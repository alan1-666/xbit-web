const prefix = 'xbit'

const _safeParse = (value: any) => {
  try {
    return JSON.parse(value || null)
  } catch (e) {
    return null
  }
}

export const get = (key: string) => {
  const fullKey = `${prefix}.${key}`

  const value = localStorage.getItem(fullKey)

  return _safeParse(value)
}

export const set = (key: string, value: any) => {
  const fullKey = `${prefix}.${key}`
  const vValue = JSON.stringify(value)

  return localStorage.setItem(fullKey, vValue)
}

export const remove = (key: string) => {
  return localStorage.removeItem(`${prefix}.${key}`)
}

const ls = { get, set, remove }

export default ls
