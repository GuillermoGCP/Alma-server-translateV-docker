import { allSheetData } from '../../googleapis/methods/index.js'

const getPartners = async (req, res, next) => {
  try {
    const sheetId = process.env.SPREADSHEET_ID
    const { rows } = await allSheetData(sheetId, 'Socios')

    // rows[0] should contain headers. Build objects for the rest.
    const [headers, ...dataRows] = rows
    const normalizedHeaders =
      headers?.map((h) => h?.toString().trim().toLowerCase()) || []

    const partners = dataRows.map((row) => {
      const record = {}
      normalizedHeaders.forEach((header, idx) => {
        // Use the header value as key; fallback to generic column index.
        const key = header || `col_${idx}`
        record[key] = row[idx] ?? ''
      })
      return record
    })

    res.send({ data: partners })
  } catch (error) {
    next(error)
  }
}
export default getPartners
