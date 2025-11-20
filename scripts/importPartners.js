import fs from 'fs'
import csv from 'csv-parser'
import 'dotenv/config'
import {
  allSheetData,
  insertRow,
  updateRow,
  getCoordinates,
} from '../src/googleapis/methods/index.js'
import { generateCode, formatDate } from '../src/utils/index.js'
import { sheets } from '../src/googleapis/client.js'

const SHEET_NAME = 'Socios'
const CSV_FILE_PATH = process.argv[2] || 'socios.csv' // Default to socios.csv or take from arg

if (!fs.existsSync(CSV_FILE_PATH)) {
  console.error(`Error: CSV file not found at ${CSV_FILE_PATH}`)
  process.exit(1)
}

const processCSV = async () => {
  const results = []
  fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Parsed ${results.length} rows from CSV.`)
      await importData(results)
    })
}

const importData = async (data) => {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID
    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID not defined in .env')
    }

    // 1. Get current sheet data to check headers
    let { rows, headers, nextEmptyRow } = await allSheetData(spreadsheetId, SHEET_NAME)

    // 2. Check and add new columns if missing
    const newColumns = ['address', 'CP']
    let headersUpdated = false
    
    // Map internal names to what might be in the sheet or what we want to call them
    // Based on user request: Enderezo -> address, CP -> CP
    // Existing headers in newPartner.js seem to be implied by order, but allSheetData returns the first row.
    // Let's assume headers are in the first row.
    
    if (!headers) {
        // If sheet is empty, create headers
        headers = ['id', 'name', 'surname', 'email', 'phone', 'registrationData', 'lastRenovation', 'state', 'address', 'CP']
        await insertRow(spreadsheetId, SHEET_NAME, 1, [headers])
        console.log('Created headers in empty sheet.')
        headersUpdated = true
        nextEmptyRow = 2
    } else {
        // Check if 'address' and 'CP' exist
        // Note: The user said "create columns new in GS for Enderezo, that will be address, CP..."
        // We'll check if the header row contains 'address' and 'CP' (case insensitive or exact?)
        // Let's stick to exact 'address' and 'CP' as per request.
        
        const missingColumns = []
        if (!headers.includes('address')) missingColumns.push('address')
        if (!headers.includes('CP')) missingColumns.push('CP')

        if (missingColumns.length > 0) {
            console.log(`Adding missing columns: ${missingColumns.join(', ')}`)
            // We need to update the first row to include these.
            // updateRow takes a request object.
            // Construct the new header array
            const newHeaders = [...headers, ...missingColumns]
            
            // Update the header row (Row 1)
            // We need to construct the range for the update.
            // Assuming headers are always row 1.
            const range = `${SHEET_NAME}!A1`
            
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption: 'RAW',
                resource: {
                    values: [newHeaders]
                }
            })
            
            console.log('Headers updated.')
            headers = newHeaders
            headersUpdated = true
        }
    }

    // 3. Process each row from CSV
    let partnersAdded = 0
    
    for (const row of data) {
        // CSV Mapping:
        // "Nome e apelidos" -> name, surname
        // "Correo electrónico" -> email
        // "Teléfono" -> phone
        // "Enderezo" -> address
        // "CP, cidade e provincia" -> CP
        // "Columna 1" -> state (if exists)

        const fullName = row['Nome e apelidos'] || ''
        const email = row['Correo electrónico'] || ''
        const phone = row['Teléfono'] || ''
        const address = row['Enderezo'] || ''
        const cp = row['CP, cidade e provincia'] || ''
        const stateRaw = row['Columna 1'] || ''

        // Split name
        const nameParts = fullName.trim().split(' ')
        const name = nameParts[0] || ''
        const surname = nameParts.slice(1).join(' ') || ''

        // Check if email already exists
        // We can use getCoordinates from utils if we re-fetch data, but that's slow.
        // Better to check against the 'rows' we fetched initially, but we must be careful if we are adding many.
        // Since this is a script, maybe we just check against the initial load + what we added?
        // For simplicity and safety, let's just check the initial 'rows' for duplicates to avoid re-inserting same people if run twice.
        // Note: 'rows' contains the data from the sheet.
        
        const emailIndex = headers.indexOf('email')
        const emailExists = rows ? rows.some(r => r[emailIndex] === email) : false

        if (emailExists) {
            console.log(`Skipping ${email} - already exists.`)
            continue
        }

        // Prepare data row
        // Order must match headers!
        // We need to map our values to the header order.
        
        const newRow = headers.map(header => {
            switch(header) {
                case 'id': return generateCode(4)
                case 'name': return name
                case 'surname': return surname
                case 'email': return email
                case 'phone': return phone
                case 'registrationData': return formatDate()
                case 'lastRenovation': return formatDate()
                case 'state': return stateRaw || 'Alta nueva' // Default if empty? User said "if it has values go to state".
                case 'address': return address
                case 'CP': return cp
                default: return ''
            }
        })

        // Insert
        await insertRow(spreadsheetId, SHEET_NAME, nextEmptyRow, [newRow])
        nextEmptyRow++
        partnersAdded++
        // Add to local rows to prevent duplicates within the same CSV execution if duplicate emails exist in CSV
        if (rows) rows.push(newRow) 
        else rows = [newRow]
    }

    console.log(`Import completed. Added ${partnersAdded} partners.`)

  } catch (error) {
    console.error('Error importing data:', error)
  }
}

processCSV()
