import Form from '../../Database/models/FormModel2.js'

const checkIsPublished = async (req, res, next) => {
  try {
    const jsonNumber = req.params.jsonNumber.toString()
    const formId = req.params.formId
    const checkIsFile = req.params.checkIsFile
    let jsonData
    let isPublished

    jsonData = await Form.findOne({
      publishNumber: jsonNumber,
    })

    if (!checkIsFile) {
      if (jsonData && jsonData.formId === formId) {
        console.log('El formId coincide.')
        isPublished = true
      } else {
        console.log('El formId no coincide.')
        isPublished = false
      }
    } else {
      try {
        if (Object.keys(jsonData).length === 0) {
          isPublished = false
        } else {
          isPublished = true
        }
      } catch (error) {
        console.error('No hay formulario asociado')
      }
    }

    res.send({
      isPublished: isPublished,
      publishedFormId: jsonData?.formId ? jsonData.formId : null,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
export default checkIsPublished
