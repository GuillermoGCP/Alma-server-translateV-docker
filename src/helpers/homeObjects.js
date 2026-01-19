import { translateText, translateTextWithPageBreak } from '../utils/index.js'

const processResources = async (resources) => {
  if (!resources || !Array.isArray(resources)) return []
  return await Promise.all(
    resources.map(async (item) => {
      const titleEs = item?.title?.es || ''
      return {
        title: {
          es: titleEs,
          gl: await translateTextWithPageBreak(titleEs, 'es-gl'),
        },
        link: item.link || '',
      }
    })
  )
}

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
      lactationBooks: data.library.lactationBooks
        ? data.library.lactationBooks
        : {},
      pregnancyResources: await processResources(
        data.library.pregnancyResources
      ),
      pregnancyBooks: data.library.pregnancyBooks
        ? data.library.pregnancyBooks
        : {},
      parentingResources: await processResources(
        data.library.parentingResources
      ),
      parentingBooks: data.library.parentingBooks
        ? data.library.parentingBooks
        : {},
      nutritionBlogs: await processResources(data.library.nutritionBlogs),
      nutritionBooks: data.library.nutritionBooks
        ? data.library.nutritionBooks
        : {},
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
      lactationResources: newData.library?.lactationResources
        ? await processResources(newData.library.lactationResources)
        : oldData.library.lactationResources,
      lactationBooks: newData.library?.lactationBooks
        ? newData.library.lactationBooks
        : oldData.library.lactationBooks,
      pregnancyResources: newData.library?.pregnancyResources
        ? await processResources(newData.library.pregnancyResources)
        : oldData.library.pregnancyResources,
      pregnancyBooks: newData.library?.pregnancyBooks
        ? newData.library.pregnancyBooks
        : oldData.library.pregnancyBooks,
      parentingResources: newData.library?.parentingResources
        ? await processResources(newData.library.parentingResources)
        : oldData.library.parentingResources,
      parentingBooks: newData.library?.parentingBooks
        ? newData.library.parentingBooks
        : oldData.library.parentingBooks,
      nutritionBlogs: newData.library?.nutritionBlogs
        ? await processResources(newData.library.nutritionBlogs)
        : oldData.library.nutritionBlogs,
      nutritionBooks: newData.library?.nutritionBooks
        ? newData.library.nutritionBooks
        : oldData.library.nutritionBooks,
      archiveBlogs: newData.library?.archiveBlogs
        ? await processResources(newData.library.archiveBlogs)
        : oldData.library.archiveBlogs,
    },
  }
}
export { newHomeObjectCreator, combinedHomeObjectCreator }
