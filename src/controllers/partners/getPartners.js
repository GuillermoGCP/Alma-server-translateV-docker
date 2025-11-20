import { allSheetData } from '../../googleapis/methods/index.js'

const getPartners = async (req, res, next) => {
  try {
    const sheetId = process.env.SPREADSHEET_ID
    const { rows } = await allSheetData(sheetId, 'Socios')

    // Devolver las filas tal cual, o podríamos mapearlas si fuera necesario.
    // Por ahora devolvemos 'rows' que es un array de arrays (o objetos según implementación de allSheetData).
    // Revisando allSheetData, devuelve { rows, headers, nextEmptyRow }.
    // rows suele ser un array de arrays con los valores.

    res.send({ data: rows })
  } catch (error) {
    next(error)
  }
}

export default getPartners
