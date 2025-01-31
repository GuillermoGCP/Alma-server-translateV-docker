function unnormalizeFieldName(fieldName) {
  if (typeof fieldName === 'string') {
    let normalized = fieldName.replace(/[_-]+/g, ' ')

    normalized = normalized.toLowerCase()
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1)

    return normalized
  } else return null
}

export default unnormalizeFieldName
