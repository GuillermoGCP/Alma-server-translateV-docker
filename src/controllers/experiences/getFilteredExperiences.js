import FilteredExperiencesModel from '../../Database/models/FilteredExperiencesModel.js'
import { getRowsData } from '../../googleapis/methods/index.js'

const getFilteredExperiences = async (req, res, next) => {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID
    if (!spreadsheetId) {
      return res
        .status(200)
        .json({ message: 'SPREADSHEET_ID no configurado', data: [] })
    }

    const doc = await FilteredExperiencesModel.findOne().lean()

    const ids = Array.isArray(doc?.filteredExperiences)
      ? doc.filteredExperiences
      : []
    if (ids.length === 0) {
      return res
        .status(200)
        .json({ message: 'Sin experiencias configuradas', data: [] })
    }

    const experiences = await Promise.all(
      ids.map(async (experienceId) => {
        try {
          const values = await getRowsData(spreadsheetId, 'Experiencias', {
            field: 'id',
            value: String(experienceId),
            sheetName: 'Experiencias',
          })
          const row = values?.rowsData?.[0]
          if (!row) return null

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

    return res
      .status(200)
      .json({ message: 'OK', data: experiences.filter(Boolean) })
  } catch (error) {
    next(error)
  }
}

export default getFilteredExperiences
