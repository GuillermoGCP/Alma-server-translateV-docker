import {
  addSheetToSpreadsheet,
  configureSheet,
  saveFormData,
  allSheetData,
  updateRow,
} from '../../googleapis/methods/index.js'
import {
  getColumnLetter,
  normalizeFieldName,
  unnormalizeFieldName,
} from '../../utils/index.js'

const createFormController = async (req, res, next) => {
  try {
    // 1) Parse del body (puede llegar como string o como objeto)
    const raw = req.body
    const formData = typeof raw === 'string' ? JSON.parse(raw) : raw

    const spreadsheetId = process.env.SPREADSHEET_ID
    const spreadsheetIdForms = process.env.SPREADSHEET_ID_FORMS

    let sheetExists = false
    let newSheetId
    let dataToSend = {}

    // 2) Guardar en hoja "Formularios". Si falla (Apertium o lo que sea), degradar.
    const values = await allSheetData(spreadsheetId, 'Formularios')
    const nextEmptyRow = values?.nextEmptyRow ?? 2

    let rows = null
    try {
      rows = await saveFormData(
        spreadsheetId,
        formData,
        nextEmptyRow,
        'Formularios'
      )
    } catch (e) {
      // Fallback: construir "rows" mínimos con gl vacío
      console.warn(
        '[createForm] saveFormData falló; usando fallback sin gl:',
        e?.message
      )
      rows = (formData.fields || []).map((field) => {
        const esNorm =
          typeof field.label === 'string'
            ? normalizeFieldName(field.label)
            : normalizeFieldName(String(field.label || ''))
        // Formato esperado más abajo:
        // arr[2] = label ES normalizada
        // arr[3] = type
        // arr[4] = formName GL
        // arr[5] = label GL
        return [null, null, esNorm, field.type ?? 'text', '', '']
      })
    }

    // 3) Respuesta para el front (con o sin traducciones)
    const glFormName = rows?.[0]?.[4] ?? '' // si no hay gl, cadena vacía

    dataToSend[formData.formId] = {
      formName: {
        es: formData.formName,
        gl: glFormName, // "" si no hubo traducción
      },
      fields:
        rows && rows.length
          ? rows.map((arr) => ({
              type: arr?.[3] ?? 'text',
              label: {
                es: unnormalizeFieldName(arr?.[2] ?? ''),
                gl: unnormalizeFieldName(arr?.[5] ?? ''), // "" si no hubo traducción
              },
            }))
          : (formData.fields || []).map((f) => ({
              type: f?.type ?? 'text',
              label: {
                es:
                  typeof f?.label === 'string'
                    ? f.label
                    : unnormalizeFieldName(
                        normalizeFieldName(String(f?.label || ''))
                      ),
                gl: '', // fallback explícito
              },
            })),
    }

    // 4) Crear hoja de respuestas o reutilizar si ya existe
    try {
      newSheetId = await addSheetToSpreadsheet(
        spreadsheetIdForms,
        normalizeFieldName(formData.formName)
      )
    } catch (error) {
      // Si ya existe, marcamos bandera; cualquier otro error se propaga
      if (!String(error?.message || '').includes('A sheet with the name')) {
        throw error
      }
      sheetExists = true
    }

    if (!sheetExists) {
      // Hoja nueva → configurar cabeceras
      const formLabels = (formData.fields || []).map((field) =>
        normalizeFieldName(field.label)
      )
      await configureSheet(
        spreadsheetIdForms,
        newSheetId,
        formData.fields.length,
        formLabels
      )

      return res.status(200).json({
        message:
          'Formulario generado y guardado correctamente. Creada hoja de respuestas',
        form: dataToSend,
      })
    }

    // Hoja ya existe → fusionar cabeceras
    const resultsSheet = await allSheetData(
      spreadsheetIdForms,
      normalizeFieldName(formData.formName)
    )
    const headers = Array.isArray(resultsSheet?.headers)
      ? resultsSheet.headers
      : []

    const headersToAdd = (formData.fields || []).map((field) =>
      normalizeFieldName(field.label)
    )

    const updatedHeaders = [...headers, ...headersToAdd].reduce(
      (acc, field) => {
        if (!acc.includes(field)) acc.push(field)
        return acc
      },
      []
    )

    const dataToUpdateRow = {
      spreadsheetId: spreadsheetIdForms,
      range: `${normalizeFieldName(formData.formName)}!A1:${getColumnLetter(
        updatedHeaders.length
      )}1`,
      valueInputOption: 'RAW',
      resource: {
        values: [updatedHeaders],
      },
    }
    await updateRow(dataToUpdateRow)

    return res.status(200).json({
      message: 'La hoja de respuestas ya existe y será reutilizada',
      form: dataToSend,
    })
  } catch (error) {
    console.error('[createForm] Error inesperado:', error)
    // Mantenemos comportamiento estándar del middleware de errores
    return next(error)
  }
}

export default createFormController
