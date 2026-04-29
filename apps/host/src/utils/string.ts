export const handleStringPercentage = (value: string) => {
  if (value !== '--' && value !== '0') {
    return `${value}%`
  }
  return value
}

export const handleStringValue = (value: string) => {
  if (value !== '--' && value !== '0') {
    return `$${value}`
  }
  return value
}

export const handleStringAmount = (value: string) => {
  if (value !== '--' && value !== '0') {
    return `${value}`
  }
  return value
}

export const safeDecodeData = (encoded: string): any => {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)))
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Decoding failed:', error)
    return null
  }
}

export const safeBtoa = (obj: any) => {
  const json = JSON.stringify(obj)
  return btoa(unescape(encodeURIComponent(json)))
}
