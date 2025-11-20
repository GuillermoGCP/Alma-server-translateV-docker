const assignNestedValue = (target, pathSegments, value) => {
  let current = target

  for (let index = 0; index < pathSegments.length; index += 1) {
    const segment = pathSegments[index]
    const isLast = index === pathSegments.length - 1

    if (isLast) {
      current[segment] = value
      return
    }

    const next = current[segment]
    if (
      typeof next !== 'object' ||
      next === null ||
      Array.isArray(next)
    ) {
      current[segment] = {}
    }

    current = current[segment]
  }
}

const buildNestedStructure = (body = {}) => {
  const nestedResult = {}

  Object.entries(body).forEach(([key, value]) => {
    if (!key.includes('[')) return

    const cleanedKey = key.replace(/\]/g, '')
    const [root, ...rest] = cleanedKey.split('[')

    if (!root) return

    const segments = [root, ...rest].filter(Boolean)
    assignNestedValue(nestedResult, segments, value)
  })

  return nestedResult
}

const deepAssign = (target, source) => {
  if (!source || typeof source !== 'object') {
    return target
  }

  Object.entries(source).forEach(([key, value]) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      if (
        typeof target[key] !== 'object' ||
        target[key] === null ||
        Array.isArray(target[key])
      ) {
        target[key] = {}
      }
      deepAssign(target[key], value)
    } else {
      target[key] = value
    }
  })

  return target
}

const normalizeEventPayload = (body = {}) => {
  if (!body || typeof body !== 'object') {
    return body
  }

  const normalized = {}

  Object.entries(body).forEach(([key, value]) => {
    if (key.includes('[')) return
    normalized[key] = value
  })

  const nestedStructure = buildNestedStructure(body)
  deepAssign(normalized, nestedStructure)

  return normalized
}

export default normalizeEventPayload

