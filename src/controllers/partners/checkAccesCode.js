import { generateError } from '../../utils/index.js'
import { validationSchemaCodePartner } from '../../utils/index.js'
import {
  allSheetData,
  getCoordinates,
  getRowsData,
} from '../../googleapis/methods/index.js'

const checkAccesCode = async (req, res, next) => {
  try {
    let partnerData = {}
    const sheetId = process.env.SPREADSHEET_ID
    const { code, email } = req.body

    // Validación de datos:
    const { error } = validationSchemaCodePartner.validate(req.body)

    if (error) {
      error.message = error.details[0].message
      generateError(error.message)
    }

    //Comprobar si el email y el id existen en las hojas de cálculo y si encuentran en la misma fila de socio:
    const { rows, headers } = await allSheetData(sheetId, 'Socios')
    const emailValues = getCoordinates(rows, headers, 'email', email)
    if (emailValues.valueRowIndex === -1) {
      generateError('No se encuentra el email')
      return
    }
    const idValues = getCoordinates(rows, headers, 'id', code)
    if (idValues.valueRowIndex === -1) {
      generateError('El código introducido no es válido')
      return
    }
    if (emailValues.valueRowIndex !== idValues.valueRowIndex) {
      generateError(
        'El código y el correo electrónico introducidos no se corresponden'
      )
    }

    const { rowData } = await getRowsData(sheetId, 'Socios', {
      sheetName: 'Socios',
      field: 'id',
      value: code,
      newValue: '',
    })

    partnerData.code = rowData[0]
    partnerData.name = rowData[1]
    partnerData.surname = rowData[2]
    partnerData.email = rowData[3]
    partnerData.phone = rowData[4]
    partnerData.registered = rowData[5]
    partnerData.lasRenovation = rowData[6]
    partnerData.state = rowData[7]
      .split(/\s+/)
      .slice(0, 2)
      .join(' ')
      .slice(0, -1)

    //Validación del estado de la suscripción:
    if (partnerData.state === 'Baja voluntaria') {
      generateError('El socio se encuentra dado de baja')
      return
    }

    if (partnerData.state === 'Susc. caducad') {
      generateError('La suscripción está caducada')
      return
    }

    res.send({
      data: partnerData,
    })
  } catch (error) {
    next(error.message)
  }
}
export default checkAccesCode
