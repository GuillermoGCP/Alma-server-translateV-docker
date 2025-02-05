import { getRowsData } from '../../googleapis/methods/index.js'
import groupDataById from '../../utils/groupDataById.js'

const getExperienceById = async (req, res, next) => {
  try {
    const id = req.params.id

    const spreadsheetId = process.env.SPREADSHEET_ID
    const fields = {
      field: 'id',
      value: id,
      sheetName: 'Experiencias',
    }

    const values = await getRowsData(spreadsheetId, 'Experiencias', fields)
    const { rowsData } = values

    const experience = groupDataById(rowsData)
    //Formateo los datos:
    //Los campos no se corresponden con los nombres, porque la función groupDataById está pensada para agrupar los datos de los formularios.
    const dataToSend = {
      text: {
        es: experience[id].formName.es,
        gl: experience[id].fields[0].label.es,
      },
      id,
      image: experience[id].fields[0].type,
    }

    res.send({
      message: `Experiencia con id: ${id}, obtenida`,
      experience: dataToSend,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
export default getExperienceById
