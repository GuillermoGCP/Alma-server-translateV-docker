import {
  generateError,
  translateTextWithPageBreak,
  validationSchemaNewExperiences,
} from '../../utils/index.js'
import { insertRow, allSheetData } from '../../googleapis/methods/index.js'
import { v4 as uuidv4 } from 'uuid'
import cloudinaryUpload from '../cloudinary/uploadImage.js'

const saveExperience = async (req, res, next) => {
  try {
    const sheetId = process.env.SPREADSHEET_ID
    const id = uuidv4()
    const { text } = req.body
    let image = req.file || 'sin imagen'

    // Validación de datos:
    const { error } = validationSchemaNewExperiences.validate(req.body)

    if (error) {
      error.message = error.details[0].message
      generateError(error.message)
    }

    // Subir imagen a Cloudinary
    if (req.file) {
      const response = await cloudinaryUpload(req.file, 'experiencias')
      image = response
    }

    // Intentar traducir al gallego, usar texto original si falla
    let textInGl = text // Por defecto, usar el mismo texto en español
    
    try {
      const translatedText = await translateTextWithPageBreak(text, 'es-gl')
      
      // Verificar que la traducción no está vacía y es diferente del original
      if (translatedText && translatedText.trim() !== '' && translatedText !== text) {
        textInGl = translatedText
      } else {
        console.warn('Traducción vacía o igual al original, usando texto en español')
      }
    } catch (error) {
      console.error('Error en traducción automática, usando texto original:', error.message)
      // textInGl ya está asignado al texto original
    }

    const dataToInsert = [[id, text, textInGl, image]]

    const sheetName = 'Experiencias'
    const values = await allSheetData(sheetId, sheetName)

    const { nextEmptyRow } = values

    await insertRow(sheetId, sheetName, nextEmptyRow, dataToInsert)

    res.send({
      message: 'Experiencia guardada correctamente en la hoja de cálculo',
      data: {
        id: id,
        image: image,
        text: { es: req.body.text, gl: textInGl },
      },
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
export default saveExperience
