import Form from '../../Database/models/FormModel2.js'

const checkIsPublished = async (req, res, next) => {
  try {
    const jsonNumber = req.params.jsonNumber.toString()
    const formId = req.params.formId
    const checkIsFile = req.params.checkIsFile
    const eventId = req.query?.eventId ? String(req.query.eventId) : ''

    let jsonData = null

    if (eventId) {
      jsonData = await Form.findOne({ eventId })
    }

    if (!jsonData) {
      jsonData = await Form.findOne({
        publishNumber: jsonNumber,
      })
    }

    if (!jsonData) {
      return res.send({
        isPublished: false,
        publishedFormId: null,
        eventId: null,
      })
    }

    let isPublished = false

    if (eventId) {
      isPublished = jsonData.eventId === eventId
    } else if (!checkIsFile) {
      isPublished = jsonData.formId === formId
    } else {
      isPublished = true
    }

    res.send({
      isPublished,
      publishedFormId: jsonData.formId ?? null,
      eventId: jsonData.eventId ?? null,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
export default checkIsPublished
