import { getRowsData } from '../../googleapis/methods/index.js'
import groupDataById from '../../utils/groupDataById.js'
import FormModel from '../../Database/models/FormModel2.js'
import unnormalizeFieldName from '../../utils/unnormalizeFieldName.js'

const getFormById = async (req, res, next) => {
  try {
    const formId = req.params.formId
    const publish = req.params.publish
    const jsonNumber = req.params.jsonNumber
    const eventId = req.query?.eventId ? String(req.query.eventId) : ''
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
    const formEntry = form[formId]

    if (!formEntry) {
      return res.status(404).json({
        message: `No se ha encontrado el formulario con id: ${formId}`,
      })
    }

    const formNameEs = unnormalizeFieldName(formEntry.formName.es)
    const formNameGlRaw = unnormalizeFieldName(formEntry.formName.gl)
    const normalizedFormNameGl = formNameGlRaw || formNameEs

    //Formateo los datos para que coincidan con la estructura esperada en el front:
    const dataToSend = {
      formName: { es: formNameEs, gl: normalizedFormNameGl },
      formId: formId,
      publishNumber: jsonNumber,
      fields: formEntry.fields.map((field) => {
        const labelEs = unnormalizeFieldName(field.label.es)
        const labelGlRaw = unnormalizeFieldName(field.label.gl)
        return {
          label: {
            es: labelEs,
            gl: labelGlRaw || labelEs,
          },
          type: field.type,
        }
      }),
    }

    //Si se publica, se comprueba si existe publicaci�n anterior con el mismo json number, se borra y se guarda en Mongo la nueva:
    if (publish === 'publish') {
      if (!eventId) {
        return res.status(400).json({
          message:
            'El identificador del evento (eventId) es obligatorio para publicar el formulario.',
        })
      }

      await FormModel.deleteMany({ eventId })

      const match = await FormModel.exists({ publishNumber: jsonNumber })
      if (match) {
        await FormModel.deleteOne({ publishNumber: jsonNumber })
        console.log('Borrada publicaci�n anterior')
      }
      formToSave = new FormModel({
        ...dataToSend,
        eventId,
      })
      await formToSave.save()
    }

    res.send({
      message: `formulario con id: ${formId} obtenido`,
      form: {
        ...dataToSend,
        eventId,
      },
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
export default getFormById
