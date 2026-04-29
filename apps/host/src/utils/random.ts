export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min: number, max: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces)
  return Math.floor(Math.random() * (max - min + 1) * factor) / factor
}

export function randomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function randomNumberMinMax(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function randomNumberWithDecimal(min: number, max: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces)
  return Math.floor(Math.random() * (max - min + 1) * factor) / factor
}