import { getRowsData } from '../../googleapis/methods/index.js'
import groupDataById from '../../utils/groupDataById.js'
import FormModel from '../../Database/models/FormModel2.js'
import unnormalizeFieldName from '../../utils/unnormalizeFieldName.js'

const getFormById = async (req, res, next) => {
  try {
    const formId = req.params.formId
    const publish = req.params.publish
    const jsonNumber = req.params.jsonNumber
    const spreadsheetId = process.env.SPREADSHEET_ID
    let formToSave
    const fields = {
      field: 'id',
      value: formId,
      sheetName: 'Formularios',
    }

    const values = await getRowsData(spreadsheetId, 'Formularios', fields)
    const { rowsData } = values

    const form = groupDataById(rowsData)

    //Formateo los datos para que coincidan con la estructura esperada en el front:
    const dataToSend = {
      formName: { es: form[formId].formName.es, gl: form[formId].formName.gl },
      formId: formId,
      publishNumber: jsonNumber,
      fields: form[formId].fields.map((field) => {
        return {
          label: {
            es: unnormalizeFieldName(field.label.es),
            gl: unnormalizeFieldName(field.label.gl),
          },
          type: field.type,
        }
      }),
    }
    console.log('dataToSend', dataToSend)
    //Si se publica, se comprueba si existe publicación anterior con el mismo json number, se borra y se guarda en Mongo la nueva:
    if (publish === 'publish') {
      const match = await FormModel.exists({ publishNumber: 1 })
      if (match) {
        await FormModel.deleteOne({ publishNumber: 1 })
        console.log('Borrada publicación anterior')
      }
      formToSave = new FormModel(dataToSend)
      await formToSave.save()
    }

    res.send({
      message: `formulario con id: ${formId} obtenido`,
      form: dataToSend,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
export default getFormById
