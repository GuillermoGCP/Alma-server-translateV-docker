import { translateText, translateTextWithPageBreak } from '../utils/index.js'

const processResources = async (resources) => {
  if (!resources || !Array.isArray(resources)) return []
  return await Promise.all(
    resources.map(async (item) => {
      const titleEs = item?.title?.es ?? ''
      return {
        title: {
          es: titleEs,
          gl: await translateTextWithPageBreak(titleEs, 'es-gl'),
        },
        link: item?.link ?? '',
      }
    })
  )
}

const hasOwn = (obj, key) =>
  obj && Object.prototype.hasOwnProperty.call(obj, key)

const newHomeObjectCreator = async (imageHome, logo, data) => {
  return {
    home: {
      imageHome: imageHome,
      titleHome: data.home.titleHome
        ? {
            es: data.home.titleHome,
            gl: await translateText(data.home.titleHome, 'es-gl'),
          }
        : {},
      sectionText: data.home.sectionText
        ? {
            es: data.home.sectionText,
            gl: await translateTextWithPageBreak(
              data.home.sectionText,
              'es-gl'
            ),
          }
        : {},
    },
    generalSettings: {
      ...(data.generalSettings || {}),
      logo: logo,
    },
    library: {
      lactationResources: await processResources(
        data.library.lactationResources
      ),
      lactationBooks:
        typeof data.library?.lactationBooks === 'string'
          ? data.library.lactationBooks
          : '',
      pregnancyResources: await processResources(
        data.library.pregnancyResources
      ),
      pregnancyBooks:
        typeof data.library?.pregnancyBooks === 'string'
          ? data.library.pregnancyBooks
          : '',
      parentingResources: await processResources(
        data.library.parentingResources
      ),
      parentingBooks:
        typeof data.library?.parentingBooks === 'string'
          ? data.library.parentingBooks
          : '',
      nutritionBlogs: await processResources(data.library.nutritionBlogs),
      nutritionBooks:
        typeof data.library?.nutritionBooks === 'string'
          ? data.library.nutritionBooks
          : '',
      archiveBlogs: await processResources(data.library.archiveBlogs),
    },
  }
}

const combinedHomeObjectCreator = async (imageHome, logo, oldData, newData) => {
  return {
    home: {
      imageHome: imageHome,
      titleHome: newData.home?.titleHome
        ? {
            es: newData.home.titleHome,
            gl: await translateTextWithPageBreak(
              newData.home.titleHome,
              'es-gl'
            ),
          }
        : oldData.home.titleHome,
      sectionText: newData.home?.sectionText
        ? {
            es: newData.home.sectionText,
            gl: await translateTextWithPageBreak(
              newData.home.sectionText,
              'es-gl'
            ),
          }
        : oldData.home.sectionText,
    },
    generalSettings: {
      ...oldData.generalSettings,
      ...(newData.generalSettings || {}),
      logo: logo,
    },
    library: {
      lactationResources: hasOwn(newData.library, 'lactationResources')
        ? await processResources(newData.library.lactationResources)
        : oldData.library.lactationResources,
      lactationBooks: hasOwn(newData.library, 'lactationBooks')
        ? newData.library.lactationBooks
        : oldData.library.lactationBooks,
      pregnancyResources: hasOwn(newData.library, 'pregnancyResources')
        ? await processResources(newData.library.pregnancyResources)
        : oldData.library.pregnancyResources,
      pregnancyBooks: hasOwn(newData.library, 'pregnancyBooks')
        ? newData.library.pregnancyBooks
        : oldData.library.pregnancyBooks,
      parentingResources: hasOwn(newData.library, 'parentingResources')
        ? await processResources(newData.library.parentingResources)
        : oldData.library.parentingResources,
      parentingBooks: hasOwn(newData.library, 'parentingBooks')
        ? newData.library.parentingBooks
        : oldData.library.parentingBooks,
      nutritionBlogs: hasOwn(newData.library, 'nutritionBlogs')
        ? await processResources(newData.library.nutritionBlogs)
        : oldData.library.nutritionBlogs,
      nutritionBooks: hasOwn(newData.library, 'nutritionBooks')
        ? newData.library.nutritionBooks
        : oldData.library.nutritionBooks,
      archiveBlogs: hasOwn(newData.library, 'archiveBlogs')
        ? await processResources(newData.library.archiveBlogs)
        : oldData.library.archiveBlogs,
    },
  }
}
export { newHomeObjectCreator, combinedHomeObjectCreator }
