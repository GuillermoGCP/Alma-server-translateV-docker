import FormModel from '../../Database/models/FormModel2.js'
import { generateError, unnormalizeFieldName } from '../../utils/index.js'

const getPublishedForm = async (req, res, next) => {
  try {
    const jsonNumber = req.params.jsonNumber
    const eventId = req.query?.eventId ? String(req.query.eventId) : ''

    if (!jsonNumber && !eventId) {
      generateError('El número de publicación es obligatorio.')
    }

    let formFromData = null

    if (eventId) {
      formFromData = await FormModel.findOne({ eventId })
    }

    if (!formFromData && jsonNumber) {
      formFromData = await FormModel.findOne({
        publishNumber: jsonNumber,
      })
    }

    if (!formFromData) {
      return res.send({
        message: 'Formulario publicado obtenido',
        form: {},
      })
    }

    const formNameEs = unnormalizeFieldName(formFromData.formName.es)
    const formNameGlRaw = unnormalizeFieldName(formFromData.formName.gl)
    const formNameGl = formNameGlRaw || formNameEs

    const normalizedForm = {
      formId: formFromData.formId,
      publishNumber: formFromData.publishNumber,
      eventId: formFromData.eventId || '',
      formName: {
        es: formNameEs,
        gl: formNameGl,
      },
      fields: formFromData.fields.map((field) => {
        if (field.type === 'select') {
          return field
        }
        const labelEs = unnormalizeFieldName(field.label.es)
        const labelGlRaw = unnormalizeFieldName(field.label.gl)

        return {
          type: field.type,
          label: {
            es: labelEs,
            gl: labelGlRaw || labelEs,
          },
        }
      }),
    }

    res.send({
      message: 'Formulario publicado obtenido',
      form: normalizedForm,
    })
  } catch (error) {
    next(error)
  }
}

export default getPublishedForm

