import FormModel from '../../Database/models/FormModel2.js'
import { generateError, unnormalizeFieldName } from '../../utils/index.js'

const getAllPublishedForms = async (_req, res, next) => {
  try {
    const publishedForms = await FormModel.find()

    if (!publishedForms) {
      console.log('No se han encontrado formularios')
      generateError('No se han encontrado formularios')
    }
    const normalizedForms = publishedForms.map((formFromData) => {
      return {
        formId: formFromData.formId,
        publishNumber: formFromData.publishNumber,
        formName: {
          es: unnormalizeFieldName(formFromData.formName.es),
          gl: unnormalizeFieldName(formFromData.formName.gl),
        },
        fields: formFromData.fields.map((field) => {
          if (field.type === 'select') {
            return field
          } else
            return {
              type: field.type,
              label: {
                es: unnormalizeFieldName(field.label.es),
                gl: unnormalizeFieldName(field.label.gl),
              },
            }
        }),
      }
    })
    const sortedForms = Array.from({ length: 10 }, (_, index) => {
      return (
        normalizedForms.find(
          (obj) => Number(obj.publishNumber) === index + 1
        ) || {}
      )
    })

    res.send({
      message: 'Formulario publicados, obtenidos',
      forms: sortedForms,
    })
  } catch (error) {
    next(error)
  }
}

export default getAllPublishedForms
