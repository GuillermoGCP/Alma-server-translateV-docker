import { generateError, translateTextWithPageBreak } from '../../utils/index.js'
import { validationSchemaNewCollaborator } from '../../utils/index.js'
import { updateRow, getRowsData } from '../../googleapis/methods/index.js'
import cloudinaryUpload from '../cloudinary/uploadImage.js'
import cloudinaryDelete from '../cloudinary/deleteImage.js'

const safeTranslate = async (text) => {
  if (!text) return ''
  try {
    const out = await translateTextWithPageBreak(text)
    return typeof out === 'string' ? out : ''
  } catch {
    // Fallback duro: sin traducción
    return ''
  }
}

const updateCollaborator = async (req, res, next) => {
  try {
    const spreadSheetId = process.env.SPREADSHEET_ID
    const { id, team } = req.params

    if (!spreadSheetId) {
      return res
        .status(500)
        .json({ message: 'Config error: falta SPREADSHEET_ID' })
    }

    const isTeam = String(team) === 'true'
    const sheetName = isTeam ? 'Miembros' : 'Colaboradores'

    const fieldsToUpdate = req.body ?? {}
    let newImage = ''

    // 1) Subida de imagen (opcional)
    if (req.file) {
      try {
        const response = await cloudinaryUpload(req.file, 'collaborators')
        newImage = response
      } catch (error) {
        console.error('Error al subir imagen:', error.message)
        generateError(error.message)
      }
    }

    // 2) Cargar fila actual
    const lookup = {
      field: 'id',
      value: id,
      newValue: '',
      sheetName,
    }

    const oldData = await getRowsData(spreadSheetId, sheetName, lookup)
    if (oldData?.error) {
      generateError(oldData.error)
      return
    }

    const { rowData = [], headers = [] } = oldData
    if (!headers.length || !rowData.length) {
      generateError('Registro no encontrado')
    }

    // Construir objeto existente a partir de headers -> rowData
    const mergedObject = {}
    for (let i = 0; i < headers.length; i++) {
      mergedObject[headers[i]] = rowData[i]
    }

    // 3) Traducciones seguras (fallback → "")
    if (Object.prototype.hasOwnProperty.call(fieldsToUpdate, 'description')) {
      mergedObject.description_gl = await safeTranslate(
        fieldsToUpdate.description
      )
    }
    if (Object.prototype.hasOwnProperty.call(fieldsToUpdate, 'role')) {
      mergedObject.role_gl = await safeTranslate(fieldsToUpdate.role)
    }

    // 4) Preparar nuevo objeto de datos
    const newData = {
      ...mergedObject,
      ...fieldsToUpdate,
      collaboratorImage: newImage ? newImage : 'Sin imagen',
    }

    // 5) Borrar imagen anterior si procede
    //    Buscamos el valor anterior respetando el índice del header
    const imgIdx = headers.findIndex((h) => h === 'collaboratorImage')
    const prevImage =
      imgIdx >= 0 ? rowData[imgIdx] : mergedObject.collaboratorImage
    if (
      prevImage &&
      prevImage !== 'Sin imagen' &&
      prevImage !== newData.collaboratorImage
    ) {
      try {
        await cloudinaryDelete(prevImage)
      } catch (e) {
        console.warn('No se pudo borrar la imagen anterior:', e?.message)
      }
    }

    // 6) Convertir a array siguiendo el orden de headers (evita desordenar columnas)
    const newValuesArray = headers.map((key) =>
      Object.prototype.hasOwnProperty.call(newData, key) ? newData[key] : ''
    )

    // 7) Preparar actualización y escribir
    const dataToUpdate = await getRowsData(
      spreadSheetId,
      sheetName,
      lookup,
      newValuesArray
    )
    const { rowToUpdate } = dataToUpdate
    await updateRow(rowToUpdate)

    // 8) Validación final (mantengo tu esquema)
    const dataToValidate = {
      name: newData.name,
      surname: newData.surname,
      description: newData.description,
      role: newData.role || '',
      team: String(isTeam),
    }
    const { error } = validationSchemaNewCollaborator.validate(dataToValidate)
    if (error) {
      error.message = error.details?.[0]?.message || 'Datos inválidos'
      generateError(error.message)
    }

    // 9) Respuesta — siempre con gl string vacío si no hubo traducción
    return res.send({
      message: 'Datos actualizados',
      data: {
        ...newData,
        description: {
          es: newData.description,
          gl: newData.description_gl ?? '',
        },
        role: {
          es: newData.role ?? '',
          gl: newData.role_gl ?? '',
        },
      },
    })
  } catch (error) {
    return next(error)
  }
}

export default updateCollaborator
