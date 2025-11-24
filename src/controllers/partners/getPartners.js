import { allSheetData } from '../../googleapis/methods/index.js'

const getPartners = async (req, res, next) => {
  try {
    const sheetId = process.env.SPREADSHEET_ID
    const { rows } = await allSheetData(sheetId, 'Socios')

    // rows[0] contains headers. Use them as keys without renaming.
    const [headers, ...dataRows] = rows

    const partners =
      dataRows?.map((row) => {
        const record = {}
        headers.forEach((header, idx) => {
          const key = header?.toString().trim() || `col_${idx}`
          record[key] = row[idx] ?? ''
        })
        return record
      }) || []

    res.send({ data: partners })
  } catch (error) {
    next(error)
  }
}
export default getPartners
