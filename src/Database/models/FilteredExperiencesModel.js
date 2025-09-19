import mongoose from 'mongoose'

const FilteredExperiencesSchema = new mongoose.Schema(
  {
    filteredExperiences: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.every((v) => typeof v === 'string'),
        message: 'filteredExperiences debe ser un array de strings',
      },
    },
  },
  { timestamps: true, versionKey: false }
)

const FilteredExperiencesModel = mongoose.model(
  'FilteredExperiences',
  FilteredExperiencesSchema
)
export default FilteredExperiencesModel
