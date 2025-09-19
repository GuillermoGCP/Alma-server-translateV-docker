import FilteredExperiencesModel from '../../Database/models/FilteredExperiencesModel.js'
import { getRowsData } from '../../googleapis/methods/index.js'

const getFilteredExperiences = async (req, res, next) => {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID
    if (!spreadsheetId) {
      return res.status(200).json({
        message: 'SPREADSHEET_ID no configurado',
        data: [],
      })
    }

    // Si no hay documento o el campo no es array, usa []
    const doc = await FilteredExperiencesModel.findOne().lean()
    const ids = Array.isArray(doc?.filteredExperiences)
      ? doc.filteredExperiences
      : []

    if (ids.length === 0) {
      return res.status(200).json({
        message: 'Sin experiencias filtradas configuradas',
        data: [],
      })
    }

    const experiences = await Promise.all(
      ids.map(async (experienceId) => {
        try {
          const fields = {
            field: 'id',
            value: String(experienceId),
            sheetName: 'Experiencias',
          }

          const values = await getRowsData(
            spreadsheetId,
            'Experiencias',
            fields
          )
          const rowsData = values?.rowsData ?? []
          const row = rowsData[0]
          if (!row) return null // id no encontrado en la hoja

          // Asumiendo columnas: [id, es, gl, image]
          const [id, es, gl, image] = row

          return {
            id,
            text: { es: es ?? '', gl: gl ?? '' },
            image: image || 'Sin imagen',
          }
        } catch (e) {
          console.error('Fallo leyendo hoja para id', experienceId, e?.message)
          return null
        }
      })
    )

    const clean = experiences.filter(Boolean)

    return res.status(200).json({
      message: 'Experiencias filtradas obtenidas',
      data: clean,
    })
  } catch (error) {
    next(error)
  }
}

export default getFilteredExperiences
