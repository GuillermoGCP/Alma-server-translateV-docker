import { getRowsData, updateRow } from '../../googleapis/methods/index.js'
import cloudinaryDelete from '../cloudinary/deleteImage.js'
import cloudinaryUpload from '../cloudinary/uploadImage.js'
import {
  generateError,
  translateTextWithPageBreak,
  validationUpdateExperiences,
} from '../../utils/index.js'

const updateExperience = async (req, res, next) => {
  try {
    const id = req.params.id
    const spreadsheetId = process.env.SPREADSHEET_ID
    let image = req.file

    // Datos nuevos y validación:
    const experienceFromFront = req.body
    const { error } = validationUpdateExperiences.validate(experienceFromFront)
    if (error) {
      error.message = error.details[0].message
      generateError(error.message)
    }

    // Subir la imagen a Cloudinary:
    if (req.file) {
      try {
        const response = await cloudinaryUpload(req.file, 'experiencias')

        image = response
      } catch (error) {
        console.error('Error al actualizar:', error.message)
        generateError(error.message)
      }
    }

    // Datos antiguos:
    const fields = {
      field: 'id',
      value: id,
      newValue: '',
      sheetName: 'Experiencias',
    }
    const matchingData = await getRowsData(
      spreadsheetId,
      'Experiencias',
      fields
    )
    const { rowData } = matchingData

    const experienceFromBack = rowData

    // Traducir texto al gallego con manejo de errores
    let translatedText = experienceFromBack[2] // Usar traducción existente por defecto
    
    if (experienceFromFront.text) {
      try {
        const newTranslation = await translateTextWithPageBreak(experienceFromFront.text, 'es-gl')
        
        // Verificar que la traducción es válida
        if (newTranslation && newTranslation.trim() !== '' && newTranslation !== experienceFromFront.text) {
          translatedText = newTranslation
        } else {
          console.warn('Traducción vacía o igual al original, usando texto en español')
          translatedText = experienceFromFront.text
        }
      } catch (error) {
        console.error('Error en traducción automática, usando texto original:', error.message)
        translatedText = experienceFromFront.text
      }
    }

    // Datos actualizados:
    const updatedExperience = [
      id,
      experienceFromFront.text || experienceFromBack[1],
      translatedText,
      image || experienceFromBack[3],
    ]
    const data = await getRowsData(
      spreadsheetId,
      'Experiencias',
      fields,
      updatedExperience
    )
    const { rowToUpdate } = data
    await updateRow(rowToUpdate)

    // Borrar imagen antigua si existe nueva:
    if (req.file) cloudinaryDelete(experienceFromBack[3])

    const newExperience = [
      id,
      {
        es: experienceFromFront.text,
        gl: updatedExperience[2],
      },
      image || experienceFromBack[3],
    ]

    res.status(200).json({
      message: 'Experiencia actualizada correctamente.',
      data: newExperience,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
export default updateExperience
