import FormModel from '../../Database/models/FormModel2.js'
import { generateError, unnormalizeFieldName } from '../../utils/index.js'

const getPublishedForm = async (req, res, next) => {
  try {
    const jsonNumber = req.params.jsonNumber

    if (!jsonNumber) {
      generateError('El número de publicación es obligatorio.')
    }

    const formFromData = await FormModel.findOne({
      publishNumber: jsonNumber,
    })

    if (!formFromData) {
      console.log(
        'Formulario no encontrado para el número de publicación dado.'
      )
    }
    const normalizedForm = {
      ...formFromData,
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

    res.send({
      message: 'Formulario publicado obtenido',
      form: normalizedForm,
    })
  } catch (error) {
    // next(error)
  }
}

export default getPublishedForm
