import FormModel from '../../Database/models/FormModel2.js'
import { unnormalizeFieldName } from '../../utils/index.js'

const formatField = (field) => {
  if (field.type === 'select') {
    return field
  }

  const labelEs = unnormalizeFieldName(field.label?.es ?? '')
  const labelGlRaw = unnormalizeFieldName(field.label?.gl ?? '')

  return {
    type: field.type,
    label: {
      es: labelEs,
      gl: labelGlRaw || labelEs,
    },
  }
}

const getAllPublishedForms = async (_req, res, next) => {
  try {
    const publishedForms = await FormModel.find().lean()

    if (!publishedForms.length) {
      return res.send({
        message: 'No se han encontrado formularios publicados',
        forms: [],
      })
    }

    const normalizedForms = publishedForms.map((formFromData) => {
      const formNameEs = unnormalizeFieldName(formFromData.formName?.es ?? '')
      const formNameGlRaw = unnormalizeFieldName(formFromData.formName?.gl ?? '')

      return {
        formId: formFromData.formId,
        publishNumber: formFromData.publishNumber,
        eventId: formFromData.eventId || '',
        formName: {
          es: formNameEs,
          gl: formNameGlRaw || formNameEs,
        },
        fields: Array.isArray(formFromData.fields)
          ? formFromData.fields.map(formatField)
          : [],
      }
    })

    const sortedForms = Array.from({ length: 10 }, (_, index) => {
      const publishSlot = index + 1
      return (
        normalizedForms.find(
          (form) => Number(form.publishNumber) === publishSlot
        ) || {}
      )
    })

    res.send({
      message: 'Formularios publicados, obtenidos',
      forms: sortedForms,
    })
  } catch (error) {
    next(error)
  }
}

export default getAllPublishedForms
