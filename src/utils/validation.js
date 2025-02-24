import Joi from 'joi'

//Actividades:
const eventSchema = Joi.object({
  summary: Joi.string().max(30).required(),
  status: Joi.string().valid('confirmed', 'cancelled'),
  description: Joi.string().max(255).optional(),
  start: Joi.object({
    dateTime: Joi.date().iso().required(),
    timeZone: Joi.string().optional(),
  }).required(),
  end: Joi.object({
    dateTime: Joi.date().iso().required(),
    timeZone: Joi.string().optional(),
  }).required(),
  location: Joi.string().optional(),
  attendees: Joi.array()
    .items(
      Joi.object({
        email: Joi.string().email().required(),
      })
    )
    .optional(),
  reminders: Joi.object({
    useDefault: Joi.boolean().optional(),
    overrides: Joi.array()
      .items(
        Joi.object({
          method: Joi.string().valid('email', 'popup').required(),
          minutes: Joi.number().integer().positive().required(),
        })
      )
      .optional(),
  }).optional(),
  visibility: Joi.string().valid('default', 'public', 'private').optional(),
  access: Joi.string().valid('partners', 'free').optional(),
  extendedProperties: Joi.object({
    private: Joi.object({
      access: Joi.string().valid('free', 'partners').required(),
      image: Joi.string().optional(),
    }).required(),
  }).required(),
}).custom((value, helpers) => {
  const startDateTime = new Date(value.start.dateTime)
  const endDateTime = new Date(value.end.dateTime)

  if (endDateTime <= startDateTime) {
    return helpers.message('End date must be after start date')
  }

  return value
}, 'End Date Validation')

//Administradores/as
const validationSchemaLogin = Joi.object({
  correo_electronico: Joi.string().email().required(),
  contrasinal: Joi.string().min(6).required(),
})

//Mensajes:
const validationSchemaNewMessage = Joi.object({
  name: Joi.string().max(15).required(),
  surname: Joi.string().max(30).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().max(30),
  comments: Joi.string().max(255),
})
//Colaboradores/as:
const validationSchemaNewCollaborator = Joi.object({
  name: Joi.string().max(15).required(),
  surname: Joi.string().max(30).required(),
  description: Joi.string().min(6).required(),
  role: Joi.string(),
  team: Joi.alternatives().try(Joi.boolean(), Joi.string()).required(),
})

//Socios/as:
const validationSchemaNewPartner = Joi.object({
  name: Joi.string().max(15).required(),
  surname: Joi.string().max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.number().optional(),
})

//Renovación de socios:
const validationSchemaRenewPartner = Joi.object({
  id: Joi.string().max(4).required(),
  email: Joi.string().email().required(),
})

//Código acceso actividades de socios:
const validationSchemaCodePartner = Joi.object({
  code: Joi.string()
    .length(4)
    .regex(/^[a-zA-Z0-9]{4}$/)
    .required(),
  email: Joi.string().email().required(),
})

//Experiencias:
const validationSchemaNewExperiences = Joi.object({
  text: Joi.string().min(50).max(1800).required(),
})
const validationUpdateExperiences = Joi.object({
  text: Joi.string().min(50).max(1800),
  image: Joi.string(),
})

export {
  validationSchemaLogin,
  validationSchemaNewCollaborator,
  validationSchemaNewMessage,
  eventSchema,
  validationSchemaNewExperiences,
  validationUpdateExperiences,
  validationSchemaNewPartner,
  validationSchemaRenewPartner,
  validationSchemaCodePartner,
}
