import { allSheetData } from '../../googleapis/methods/index.js'

const getPartners = async (req, res, next) => {
  try {
    const sheetId = process.env.SPREADSHEET_ID
    const { rows } = await allSheetData(sheetId, 'Socios')

    // rows[0] should contain headers. Build objects for the rest.
    const [headers, ...dataRows] = rows
    const normalizedHeaders =
      headers?.map((h) => {
        const raw = h?.toString().trim().toLowerCase() || ''
        const simplified = raw
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '')

        if (
          simplified.includes('nombre') ||
          simplified.includes('nome') ||
          simplified.includes('apelid')
        )
          return 'nombre'
        if (simplified.includes('email') || simplified.includes('correo'))
          return 'email'
        if (
          simplified.includes('tel') ||
          simplified.includes('movil') ||
          simplified.includes('mobile')
        )
          return 'telefono'

        return simplified || raw || ''
      }) || []

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
