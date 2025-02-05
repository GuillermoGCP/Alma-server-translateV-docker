import { translateText, translateTextWithPageBreak } from '../utils/index.js'

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
      lactationResources: data.library.lactationResources
        ? await Promise.all(
            data.library.lactationResources.map(async (item) => {
              return await translateTextWithPageBreak(item)
            })
          )
        : {},
      lactationBooks: data.library.lactationBooks
        ? data.library.lactationBooks
        : {},
      pregnancyResources: data.library.pregnancyResources
        ? await Promise.all(
            data.library.pregnancyResources.map((item) => {
              return translateTextWithPageBreak(item)
            })
          )
        : {},
      pregnancyBooks: data.library.pregnancyBooks
        ? data.library.pregnancyBooks
        : {},
      parentingResources: data.library.parentingResources
        ? await Promise.all(
            data.library.parentingResources.map((item) => {
              return translateTextWithPageBreak(item)
            })
          )
        : {},
      parentingBooks: data.library.parentingBooks
        ? data.library.parentingBooks
        : {},
      nutritionBlogs: data.library.nutritionBlogs
        ? await Promise.all(
            data.library.nutritionBlogs.map((item) => {
              return translateTextWithPageBreak(item)
            })
          )
        : {},
      nutritionBooks: data.library.nutritionBooks
        ? data.library.nutritionBooks
        : {},
      archiveBlogs: data.library.archiveBlogs
        ? await Promise.all(
            data.library.archiveBlogs.map((item) => {
              return translateTextWithPageBreak(item)
            })
          )
        : {},
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
        ? await Promise.all(
            newData.library.lactationResources.map((item) => {
              return translateTextWithPageBreak(item)
            })
          )
        : oldData.library.lactationResources,
      lactationBooks: newData.library?.lactationBooks
        ? newData.library.lactationBooks
        : oldData.library.lactationBooks,
      pregnancyResources: newData.library?.pregnancyResources
        ? await Promise.all(
            newData.library.pregnancyResources.map((item) => {
              return translateTextWithPageBreak(item)
            })
          )
        : oldData.library.pregnancyResources,
      pregnancyBooks: newData.library?.pregnancyBooks
        ? newData.library.pregnancyBooks
        : oldData.library.pregnancyBooks,
      parentingResources: newData.library?.parentingResources
        ? await Promise.all(
            newData.library.parentingResources.map((item) => {
              return translateTextWithPageBreak(item)
            })
          )
        : oldData.library.parentingResources,
      parentingBooks: newData.library?.parentingBooks
        ? newData.library.parentingBooks
        : oldData.library.parentingBooks,
      nutritionBlogs: newData.library?.nutritionBlogs
        ? await Promise.all(
            newData.library.nutritionBlogs.map((item) => {
              return translateTextWithPageBreak(item)
            })
          )
        : oldData.library.nutritionBlogs,
      nutritionBooks: newData.library?.nutritionBooks
        ? newData.library.nutritionBooks
        : oldData.library.nutritionBooks,
      archiveBlogs: newData.library?.archiveBlogs
        ? await Promise.all(
            newData.library.archiveBlogs.map((item) => {
              return translateTextWithPageBreak(item)
            })
          )
        : oldData.library.archiveBlogs,
    },
  }
}
export { newHomeObjectCreator, combinedHomeObjectCreator }
