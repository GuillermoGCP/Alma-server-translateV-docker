import { allSheetData } from '../../googleapis/methods/index.js'
import { groupDataById } from '../../utils/index.js'

const getAllForms = async (req, res, next) => {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID

    // Traigo todos los datos de la hoja de formularios:
    const data = await allSheetData(spreadsheetId, 'Formularios')
    const { rows } = data

    // Agrupo los formularios por id:
    const groupedData = groupDataById(rows)

    //TEMPORAL. Luego dejar solo el groupedData:
    // const dataToSend = {
    //   id: {
    //     formName: {
    //       es: 'Nombre formulario',
    //       gl: 'Nombre gl',
    //     },
    //     fields: [
    //       {
    //         label: {
    //           es: 'Campo',
    //           gl: 'Campo gl',
    //         },
    //         type: 'Tipo',
    //       },
    //     ],
    //   },
    //   '03e312f3-988b-42cd-8e16-35f9e9cd87ef': {
    //     formName:
    //       groupedData['03e312f3-988b-42cd-8e16-35f9e9cd87ef'].formName.es,
    //     fields: [
    //       {
    //         label: 'Titulo principal nuevo',

    //         type: 'text',
    //       },
    //       {
    //         label: 'Titulo secundario nuevo',

    //         type: 'text',
    //       },
    //     ],
    //   },
    // }

    res.send({
      message: 'formularios obtenidos',
      forms: groupedData,
    })
  } catch (error) {
    next(error)
  }
}
export default getAllForms
