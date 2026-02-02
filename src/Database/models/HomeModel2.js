import mongoose from 'mongoose'

// Esquema para los recursos de lactancia
const lactationResourceSchema = new mongoose.Schema({
  title: {
    es: {
      type: String,
    },
    gl: {
      type: String,
    },
  },
  link: {
    type: String,
  },
})

// Esquema para los recursos de embarazo
const pregnancyResourceSchema = new mongoose.Schema({
  title: {
    es: {
      type: String,
    },
    gl: {
      type: String,
    },
  },
  link: {
    type: String,
  },
})

// Esquema para los recursos de crianza
const parentingResourceSchema = new mongoose.Schema({
  title: {
    es: {
      type: String,
    },
    gl: {
      type: String,
    },
  },
  link: {
    type: String,
  },
})

// Esquema para los blogs de alimentación
const nutritionBlogSchema = new mongoose.Schema({
  title: {
    es: {
      type: String,
    },
    gl: {
      type: String,
    },
  },
  link: {
    type: String,
  },
})

// Esquema para los blogs de hemeroteca
const archiveBlogSchema = new mongoose.Schema({
  title: {
    es: {
      type: String,
    },
    gl: {
      type: String,
    },
  },
  link: {
    type: String,
  },
})

// Esquema principal
const homeSchema = new mongoose.Schema({
  home: {
    sectionText: {
      es: {
        type: String,
        required: true,
      },
      gl: {
        type: String,
        required: true,
      },
    },
    imageHome: {
      type: String,
      required: true,
    },
    titleHome: {
      es: {
        type: String,
        required: true,
      },
      gl: {
        type: String,
        required: true,
      },
    },
  },
  generalSettings: {
    logo: {
      type: String,
      required: true,
    },
    linkInstagram: {
      type: String,
      required: true,
    },
    linkFacebook: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  library: {
    lactationResources: [lactationResourceSchema],
    lactationBooks: {
      type: String,
    },
    pregnancyResources: [pregnancyResourceSchema],
    pregnancyBooks: {
      type: String,
    },
    parentingBooks: {
      type: String,
    },
    parentingResources: [parentingResourceSchema],
    nutritionBlogs: [nutritionBlogSchema],
    nutritionBooks: {
      type: String,
    },
    archiveBlogs: [archiveBlogSchema],
  },
})

const HomeModel = mongoose.model('Home2', homeSchema)

export default HomeModel
