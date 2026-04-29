import { fShortenNumber } from '@/lib/number.ts'
import React from 'react'

const subscript = [
  { number: 0, sub: '₀' },
  { number: 1, sub: '₁' },
  { number: 2, sub: '₂' },
  { number: 3, sub: '₃' },
  { number: 4, sub: '₄' },
  { number: 5, sub: '₅' },
  { number: 6, sub: '₆' },
  { number: 7, sub: '₇' },
  { number: 8, sub: '₈' },
  { number: 9, sub: '₉' },
]

const zeroCountToSubNumber = (zeroCount: number): string => {
  if (zeroCount === 0 || zeroCount === 1) return ''
  if (zeroCount > 9) {
    return zeroCount
      .toString()
      .split('')
      .map((num) => subscript[Number(num)]?.sub)
      .join('')
  }
  return subscript[zeroCount]?.sub || ''
}

const zeroCountAfterDecimal = (value: string): number => {
  const decimalPart = value?.toString().split('.')[1]
  if (!decimalPart) return 0
  const match = decimalPart.match(/^0+/)
  return match ? match[0].length : 0
}

function normalizeValue(value: number | string | null | undefined): number | null | undefined {
  if (value === null || value === undefined) return value
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return null
    return value
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return null
    const num = parseFloat(trimmed)
    if (isNaN(num) || !isFinite(num)) return null
    return num
  }
  return null
}

function getSignificantDigits(
  value: string,
  significantDigits: number = 4,
  roundMode: 'floor' | 'round' | 'ceil' = 'round',
): string {
  const strAfterDecimal = value.toString().split('.')[1]
  const zeroCount = zeroCountAfterDecimal(value)
  const significant = strAfterDecimal.slice(zeroCount)
  if (significant.length <= significantDigits) {
    return significant
  } else {
    const factor = Math.pow(10, significant.length - significantDigits)
    let roundedValue: number
    switch (roundMode) {
      case 'floor':
        roundedValue = Math.floor(parseFloat(significant) / factor)
        break
      case 'ceil':
        roundedValue = Math.ceil(parseFloat(significant) / factor)
        break
      case 'round':
      default:
        roundedValue = Math.round(parseFloat(significant) / factor)
        break
    }
    return roundedValue.toString()
  }
}

function numberToFullString(value: number): string {
  // eg., 1.8964072403823052e-19 => 0.00000000000000000018964072403823052, 1.8964072403823052e+21 => 1896407240382305200000
  const valueStr = value.toString()

  // Check if the number is in scientific notation
  if (!valueStr.includes('e') && !valueStr.includes('E')) {
    return valueStr
  }

  // Handle sign
  const isNegative = valueStr.startsWith('-')
  const unsignedStr = isNegative ? valueStr.slice(1) : valueStr

  // Parse scientific notation
  const [mantissaStr, exponentStr] = unsignedStr.toLowerCase().split('e')
  const exponent = parseInt(exponentStr, 10)

  // Get all digits from mantissa (remove decimal point)
  const mantissaParts = mantissaStr.split('.')
  const integerPart = mantissaParts[0] || ''
  const decimalPart = mantissaParts[1] || ''
  const allDigits = integerPart + decimalPart

  // Current position of decimal point (after integerPart)
  const currentDecimalPos = integerPart.length

  // New position of decimal point after applying exponent
  const newDecimalPos = currentDecimalPos + exponent

  let result: string

  if (newDecimalPos <= 0) {
    // Decimal point moves to the left (negative exponent)
    // Need to add zeros before the number
    const zerosNeeded = Math.abs(newDecimalPos)
    result = '0.' + '0'.repeat(zerosNeeded) + allDigits
  } else if (newDecimalPos >= allDigits.length) {
    // Decimal point moves to the right beyond all digits (positive exponent)
    // Need to add zeros after the number
    const zerosNeeded = newDecimalPos - allDigits.length
    result = allDigits + '0'.repeat(zerosNeeded)
  } else {
    // Decimal point is within the digits
    result = allDigits.slice(0, newDecimalPos) + '.' + allDigits.slice(newDecimalPos)
    // Remove trailing zeros after decimal point
    result = result.replace(/\.?0+$/, '')
  }

  return (isNegative ? '-' : '') + result
}

export function formatPrice(
  value: number | string | null | undefined,
  {
    showCurrency = false,
    roundMode = 'round',
    showSmallAsJSX = false, // if true, use React elements for subscripts
  }: { showCurrency?: boolean; roundMode?: 'floor' | 'round' | 'ceil'; showSmallAsJSX?: boolean } = {},
): string | React.ReactNode {
  const numValue = normalizeValue(value)
  if (numValue === null || numValue === undefined) return '--'
  if (numValue === 0) return showCurrency ? '$0' : '0'

  const absValue = Math.abs(numValue)
  const isNegative = numValue < 0
  const signPrefix = isNegative ? '-' : ''
  const currency = showCurrency ? '$' : ''

  // 0 < x < 1: round according to roundMode to 4 significant digits after the last zero, at most 3 zeros after decimal point, e.g., 0.0₁₄2164
  if (absValue < 1) {
    const zeroCount = zeroCountAfterDecimal(numberToFullString(absValue))
    const significant = getSignificantDigits(numberToFullString(absValue), 4, roundMode)
    if (zeroCount === 0) {
      if (+significant == 10000) {
        return `${signPrefix}${currency}1` // e.g., 1
      }
      // remove trailing zeros in significant
      const trimmedSignificant = significant.replace(/0+$/, '')
      return `${signPrefix}${currency}0.${trimmedSignificant}` // e.g., 0.9999
    } else if (zeroCount <= 3) {
      if (+significant == 10000) {
        return `${signPrefix}${currency}0.${'0'.repeat(zeroCount - 1)}1` // e.g., 0.0001, 0.001, 0.01, 0.1
      }
      // remove trailing zeros in significant
      const trimmedSignificant = significant.replace(/0+$/, '')
      return `${signPrefix}${currency}0.${'0'.repeat(zeroCount)}${trimmedSignificant}` // e.g., 0.01234, 0.001234, 0.0001234
    } else {
      if (showSmallAsJSX) {
        if (+significant == 10000) {
          const newZeroCount = zeroCount - 1
          if (newZeroCount <= 3) {
            return `${signPrefix}${currency}0.${'0'.repeat(newZeroCount)}1` // e.g., 0.00001
          }
          return React.createElement(
            React.Fragment,
            null,
            signPrefix,
            currency,
            '0.0',
            React.createElement('sub', null, newZeroCount),
            '1',
          ) // e.g., 0.0₄1, 0.0₅1, 0.0₆1
        }
        // remove trailing zeros in significant
        const trimmedSignificant = significant.replace(/0+$/, '')
        return React.createElement(
          React.Fragment,
          null,
          signPrefix,
          currency,
          '0.0',
          React.createElement('sub', null, zeroCount),
          trimmedSignificant,
        ) // e.g., 0.0₄1234
      } else {
        if (+significant == 10000) {
          const newZeroCount = zeroCount - 1
          if (newZeroCount <= 3) {
            return `${signPrefix}${currency}0.${'0'.repeat(newZeroCount)}1` // e.g., 0.00001
          }
          const subscriptNewZeros = zeroCountToSubNumber(newZeroCount)
          return `${signPrefix}${currency}0.0${subscriptNewZeros}1` // e.g., 0.0₄1, 0.0₅1, 0.0₆1
        }
        const subscriptZeros = zeroCountToSubNumber(zeroCount)
        const trimmedSignificant = significant.replace(/0+$/, '')
        return `${signPrefix}${currency}0.0${subscriptZeros}${trimmedSignificant}` // e.g., 0.0₄1234
      }
    }
  }

  // 1 <= x < 1M: display full number with comma separators, round according to roundMode to 4 significant digits after decimal point
  else if (absValue >= 1 && absValue < 1e6) {
    const valArr = absValue.toString().split('.')
    if (valArr.length === 1) {
      return `${signPrefix}${currency}${Number(valArr[0]).toLocaleString('en-US')}` // e.g., 123,456
    } else {
      const integerPart = Number(valArr[0]).toLocaleString('en-US')
      const decimalPart = valArr[1]
      if (decimalPart.length <= 4) {
        return `${signPrefix}${currency}${integerPart}.${decimalPart}` // e.g., 123,456.1234
      } else {
        const factor = Math.pow(10, decimalPart.length - 4)
        let roundedDecimal: number
        switch (roundMode) {
          case 'floor':
            roundedDecimal = Math.floor(parseFloat(decimalPart) / factor)
            break
          case 'ceil':
            roundedDecimal = Math.ceil(parseFloat(decimalPart) / factor)
            break
          case 'round':
          default:
            roundedDecimal = Math.round(parseFloat(decimalPart) / factor)
            break
        }
        if (roundedDecimal === 0) {
          return `${signPrefix}${currency}${integerPart}` // e.g., 123,456
        } else if (roundedDecimal.toString().length < 4) {
          const paddedDecimal = roundedDecimal.toString().padStart(4, '0').replace(/0+$/, '')
          return `${signPrefix}${currency}${integerPart}.${paddedDecimal}` // e.g., 123,456.0123
        } else if (roundedDecimal.toString().length === 4) {
          const trimmedDecimal = roundedDecimal.toString().replace(/0+$/, '') // remove trailing zeros
          if (trimmedDecimal === '') {
            return `${signPrefix}${currency}${integerPart}` // e.g., 123,456.0000 => 123,456
          }
          return `${signPrefix}${currency}${integerPart}.${trimmedDecimal}` // e.g., 123,456.2000 => 123,456.2, 123,456.1230 => 123,456.123
        }
        // roundedDecimal = 10000
        const lastInteger = Number(valArr[0]) + 1
        if (lastInteger === 1e6) {
          return `${signPrefix}${currency}${lastInteger.toLocaleString('en-US')}` // next rules
        }
        return `${signPrefix}${currency}${Number(+valArr[0] + 1).toLocaleString('en-US')}` // e.g., 123,457
      }
    }
  }

  // x>=1M: display full number, no decimal part
  switch (roundMode) {
    case 'floor': {
      const floored = Math.floor(absValue).toLocaleString('en-US').split('.')[0]
      return `${signPrefix}${currency}${floored}`
    }
    case 'ceil': {
      const ceiled = Math.ceil(absValue).toLocaleString('en-US').split('.')[0]
      return `${signPrefix}${currency}${ceiled}`
    }
    case 'round':
    default: {
      const rounded = Math.round(absValue).toLocaleString('en-US').split('.')[0]
      return `${signPrefix}${currency}${rounded}`
    }
  }
}

export function formatAmount(
  value: number | string | null | undefined,
  {
    showSign = false,
    showCurrency = false,
    roundMode = 'round',
    unit = '',
  }: { showSign?: boolean; showCurrency?: boolean; roundMode?: 'floor' | 'round' | 'ceil'; unit?: string } = {},
): string {
  const currency = showCurrency && !unit ? '$' : ''
  const postfix = unit ? ` ${unit}` : ''
  const numValue = normalizeValue(value)
  if (numValue === null || numValue === undefined) return '--'
  if (numValue === 0) return `${currency}0${postfix}`

  const absValue = Math.abs(numValue)
  const isNegative = numValue < 0
  const signPrefix = showSign ? (isNegative ? '-' : '+') : isNegative ? '-' : ''

  // 0 < x < 1: round according to roundMode to 4 significant digits after the last zero, at most 3 zeros after decimal point, e.g., 0.0₁₄2164
  if (absValue < 1) {
    const zeroCount = zeroCountAfterDecimal(numberToFullString(absValue))
    const significant = getSignificantDigits(numberToFullString(absValue), 4, roundMode)
    if (zeroCount === 0) {
      if (+significant == 10000) {
        return `${signPrefix}${currency}1${postfix}` // e.g., 1
      }
      // remove trailing zeros in significant
      const trimmedSignificant = significant.replace(/0+$/, '')
      return `${signPrefix}${currency}0.${trimmedSignificant}${postfix}` // e.g., 0.9999
    } else if (zeroCount <= 3) {
      if (+significant == 10000) {
        return `${signPrefix}${currency}0.${'0'.repeat(zeroCount - 1)}1${postfix}` // e.g., 0.0001, 0.001, 0.01, 0.1
      }
      // remove trailing zeros in significant
      const trimmedSignificant = significant.replace(/0+$/, '')
      return `${signPrefix}${currency}0.${'0'.repeat(zeroCount)}${trimmedSignificant}${postfix}` // e.g., 0.01234, 0.001234, 0.0001234
    } else {
      if (+significant == 10000) {
        const newZeroCount = zeroCount - 1
        if (newZeroCount <= 3) {
          return `${signPrefix}${currency}0.${'0'.repeat(newZeroCount)}1${postfix}` // e.g., 0.00001
        }
        const subscriptNewZeros = zeroCountToSubNumber(newZeroCount)
        return `${signPrefix}${currency}0.0${subscriptNewZeros}1${postfix}` // e.g., 0.0₄1, 0.0₅1, 0.0₆1
      }
      const subscriptZeros = zeroCountToSubNumber(zeroCount)
      // remove trailing zeros in significant
      const trimmedSignificant = significant.replace(/0+$/, '')
      return `${signPrefix}${currency}0.0${subscriptZeros}${trimmedSignificant}${postfix}` // e.g., 0.0₄1234
    }
  }

  // 1 <= x < 10k: display full number with comma separators, round according to roundMode to 2 significant digits after decimal point
  else if (absValue >= 1 && absValue < 1e4) {
    const valArr = absValue.toString().split('.')
    if (valArr.length === 1) {
      return `${signPrefix}${currency}${Number(valArr[0]).toLocaleString('en-US')}${postfix}` // e.g., 1,234
    } else {
      const integerPart = Number(valArr[0]).toLocaleString('en-US')
      const decimalPart = valArr[1]
      if (decimalPart.length <= 2) {
        // remove trailing zeros in decimal part
        const trimmedDecimal = decimalPart.replace(/0+$/, '') // remove trailing zeros
        return `${signPrefix}${currency}${integerPart}.${trimmedDecimal}${postfix}` // e.g., 1,234.12
      } else {
        const factor = Math.pow(10, decimalPart.length - 2)
        let roundedDecimal: number
        switch (roundMode) {
          case 'floor':
            roundedDecimal = Math.floor(parseFloat(decimalPart) / factor)
            break
          case 'ceil':
            roundedDecimal = Math.ceil(parseFloat(decimalPart) / factor)
            break
          case 'round':
          default:
            roundedDecimal = Math.round(parseFloat(decimalPart) / factor)
            break
        }
        if (roundedDecimal === 0) {
          return `${signPrefix}${currency}${integerPart}${postfix}` // e.g., 1,234
        } else if (roundedDecimal.toString().length < 2) {
          const paddedDecimal = roundedDecimal.toString().padStart(2, '0').replace(/0+$/, '')
          return `${signPrefix}${currency}${integerPart}.${paddedDecimal}${postfix}` // e.g., 1,234.01
        } else if (roundedDecimal.toString().length === 2) {
          const trimmedDecimal = roundedDecimal.toString().replace(/0+$/, '') // remove trailing zeros
          if (trimmedDecimal === '') {
            return `${signPrefix}${currency}${integerPart}${postfix}` // e.g., 1,234.00 => 1,234
          }
          return `${signPrefix}${currency}${integerPart}.${trimmedDecimal}${postfix}` // e.g., 1,234.12
        }
        // roundedDecimal = 100
        const lastInteger = Number(valArr[0]) + 1
        if (lastInteger === 1e4) {
          return `${signPrefix}${currency}10K${postfix}` // next rules
        }
        return `${signPrefix}${currency}${lastInteger.toLocaleString('en-US')}${postfix}` // e.g., 1235
      }
    }
  }

  // x >= 10k: use K, M, B, T suffixes, round according to roundMode to 2 significant digits after decimal point
  let scaled: number
  let suffix: string

  if (absValue >= 1e12) {
    scaled = absValue / 1e12
    suffix = 'T'
  } else if (absValue >= 1e9) {
    scaled = absValue / 1e9
    suffix = 'B'
  } else if (absValue >= 1e6) {
    scaled = absValue / 1e6
    suffix = 'M'
  } else {
    scaled = absValue / 1e3
    suffix = 'K'
  }

  const valArr = scaled.toString().split('.')
  if (valArr.length === 1) {
    return `${signPrefix}${currency}${Number(valArr[0]).toLocaleString('en-US')}${suffix}${postfix}`
  } else {
    const integerPart = Number(valArr[0]).toLocaleString('en-US')
    const decimalPart = valArr[1]
    if (decimalPart.length <= 2) {
      const trimmedDecimal = decimalPart.replace(/0+$/, '') // remove trailing zeros
      if (trimmedDecimal === '') {
        return `${signPrefix}${currency}${integerPart}${suffix}${postfix}` // e.g., 12K
      }
      return `${signPrefix}${currency}${integerPart}.${trimmedDecimal}${suffix}${postfix}` // e.g., 12.34K
    } else {
      const factor = Math.pow(10, decimalPart.length - 2)
      let roundedDecimal: number
      switch (roundMode) {
        case 'floor':
          roundedDecimal = Math.floor(parseFloat(decimalPart) / factor)
          break
        case 'ceil':
          roundedDecimal = Math.ceil(parseFloat(decimalPart) / factor)
          break
        case 'round':
        default:
          roundedDecimal = Math.round(parseFloat(decimalPart) / factor)
          break
      }
      if (roundedDecimal === 0) {
        return `${signPrefix}${currency}${integerPart}${suffix}${postfix}` // e.g., 12K
      } else if (roundedDecimal.toString().length < 2) {
        const paddedDecimal = roundedDecimal.toString().padStart(2, '0').replace(/0+$/, '')
        return `${signPrefix}${currency}${integerPart}.${paddedDecimal}${suffix}${postfix}` // e.g., 12.01K
      } else if (roundedDecimal.toString().length === 2) {
        const trimmedDecimal = roundedDecimal.toString().replace(/0+$/, '') // remove trailing zeros
        if (trimmedDecimal === '') {
          return `${signPrefix}${currency}${integerPart}${suffix}${postfix}` // e.g., 12.00 => 12K
        }
        return `${signPrefix}${currency}${integerPart}.${trimmedDecimal}${suffix}${postfix}` // e.g., 12.34K, 12.10 => 12.1K
      }
      // roundedDecimal = 100, need to increment integer part
      const newInteger = Number(valArr[0]) + 1
      // Check if need to change suffix (e.g., 999.99K -> 1M)
      if (newInteger >= 1000 && suffix !== 'T') {
        const nextSuffixMap: Record<string, string> = { K: 'M', M: 'B', B: 'T' }
        const nextSuffix = nextSuffixMap[suffix]
        if (nextSuffix) {
          // Rescale: divide by 1000 to get the new scaled value
          const rescaledValue = newInteger / 1000
          const rescaledArr = rescaledValue.toString().split('.')
          const rescaledInteger = Number(rescaledArr[0]).toLocaleString('en-US')
          if (rescaledArr.length === 1) {
            return `${signPrefix}${currency}${rescaledInteger}${nextSuffix}${postfix}`
          } else {
            const rescaledDecimal = rescaledArr[1]
            if (rescaledDecimal.length <= 2) {
              const trimmedRescaledDecimal = rescaledDecimal.replace(/0+$/, '')
              if (trimmedRescaledDecimal === '') {
                return `${signPrefix}${currency}${rescaledInteger}${nextSuffix}${postfix}`
              }
              return `${signPrefix}${currency}${rescaledInteger}.${trimmedRescaledDecimal}${nextSuffix}`
            } else {
              // Round the rescaled decimal part to 2 digits
              const rescaledFactor = Math.pow(10, rescaledDecimal.length - 2)
              let rescaledRoundedDecimal: number
              switch (roundMode) {
                case 'floor':
                  rescaledRoundedDecimal = Math.floor(parseFloat(rescaledDecimal) / rescaledFactor)
                  break
                case 'ceil':
                  rescaledRoundedDecimal = Math.ceil(parseFloat(rescaledDecimal) / rescaledFactor)
                  break
                case 'round':
                default:
                  rescaledRoundedDecimal = Math.round(parseFloat(rescaledDecimal) / rescaledFactor)
                  break
              }
              if (rescaledRoundedDecimal === 0) {
                return `${signPrefix}${currency}${rescaledInteger}${nextSuffix}${postfix}`
              } else if (rescaledRoundedDecimal.toString().length < 2) {
                const paddedRescaledDecimal = rescaledRoundedDecimal.toString().padStart(2, '0').replace(/0+$/, '')
                return `${signPrefix}${currency}${rescaledInteger}.${paddedRescaledDecimal}${nextSuffix}${postfix}`
              } else {
                const trimmedRescaledDecimal = rescaledRoundedDecimal.toString().replace(/0+$/, '')
                if (trimmedRescaledDecimal === '') {
                  return `${signPrefix}${currency}${rescaledInteger}${nextSuffix}${postfix}`
                }
                return `${signPrefix}${currency}${rescaledInteger}.${trimmedRescaledDecimal}${nextSuffix}${postfix}`
              }
            }
          }
        }
      }
      return `${signPrefix}${currency}${Number(newInteger).toLocaleString('en-US')}${suffix}${postfix}` // e.g., 1000K
    }
  }
}

export function formatVolume(
  value: number | string | null | undefined,
  {
    showCurrency = false,
    roundMode = 'round',
  }: { showCurrency?: boolean; roundMode?: 'floor' | 'round' | 'ceil' } = {},
): string {
  const numValue = normalizeValue(value)
  if (numValue === null || numValue === undefined) return '--'
  if (numValue === 0) return showCurrency ? '$0' : '0'

  const absValue = Math.abs(numValue)
  const isNegative = numValue < 0
  const signPrefix = isNegative ? '-' : ''
  const currency = showCurrency ? '$' : ''

  // 0 < x < 1: round according to roundMode to 4 significant digits after the last zero, at most 3 zeros after decimal point, e.g., 0.0₁₄2164
  if (absValue < 1) {
    const zeroCount = zeroCountAfterDecimal(numberToFullString(absValue))
    const significant = getSignificantDigits(numberToFullString(absValue), 4, roundMode)
    if (zeroCount === 0) {
      if (+significant == 10000) {
        return `${signPrefix}${currency}1` // e.g., 1
      }
      const trimmedSignificant = significant.replace(/0+$/, '')
      return `${signPrefix}${currency}0.${trimmedSignificant}` // e.g., 0.9999
    } else if (zeroCount <= 3) {
      if (+significant == 10000) {
        return `${signPrefix}${currency}0.${'0'.repeat(zeroCount - 1)}1` // e.g., 0.0001, 0.001, 0.01, 0.1
      }
      // remove trailing zeros in significant
      const trimmedSignificant = significant.replace(/0+$/, '')
      return `${signPrefix}${currency}0.${'0'.repeat(zeroCount)}${trimmedSignificant}` // e.g., 0.01234, 0.001234, 0.0001234
    } else {
      if (+significant == 10000) {
        const newZeroCount = zeroCount - 1
        if (newZeroCount <= 3) {
          return `${signPrefix}${currency}0.${'0'.repeat(newZeroCount)}1` // e.g., 0.00001
        }
        const subscriptNewZeros = zeroCountToSubNumber(newZeroCount)
        return `${signPrefix}${currency}0.0${subscriptNewZeros}1` // e.g., 0.0₄1, 0.0₅1, 0.0₆1
      }
      const subscriptZeros = zeroCountToSubNumber(zeroCount)
      // remove trailing zeros in significant
      const trimmedSignificant = significant.replace(/0+$/, '')
      return `${signPrefix}${currency}0.0${subscriptZeros}${trimmedSignificant}` // e.g., 0.0₄1234
    }
  }

  // 1 <= x < 1k: display full number with comma separators, round according to roundMode to 2 decimal places
  else if (absValue >= 1 && absValue < 1e3) {
    const valArr = absValue.toString().split('.')
    if (valArr.length === 1) {
      return `${signPrefix}${currency}${Number(valArr[0]).toLocaleString('en-US')}` // e.g., 123
    } else {
      const integerPart = Number(valArr[0]).toLocaleString('en-US')
      const decimalPart = valArr[1]
      if (decimalPart.length <= 2) {
        return `${signPrefix}${currency}${integerPart}.${decimalPart}` // e.g., 123.12
      } else {
        const factor = Math.pow(10, decimalPart.length - 2)
        let roundedDecimal: number
        switch (roundMode) {
          case 'floor':
            roundedDecimal = Math.floor(parseFloat(decimalPart) / factor)
            break
          case 'ceil':
            roundedDecimal = Math.ceil(parseFloat(decimalPart) / factor)
            break
          case 'round':
          default:
            roundedDecimal = Math.round(parseFloat(decimalPart) / factor)
            break
        }
        if (roundedDecimal === 0) {
          return `${signPrefix}${currency}${integerPart}` // e.g., 123
        } else if (roundedDecimal.toString().length < 2) {
          const paddedDecimal = roundedDecimal.toString().padStart(2, '0')
          return `${signPrefix}${currency}${integerPart}.${paddedDecimal}` // e.g., 123.01
        } else if (roundedDecimal.toString().length === 2) {
          const trimmedDecimal = roundedDecimal.toString().replace(/0+$/, '') // remove trailing zeros
          if (trimmedDecimal === '') {
            return `${signPrefix}${currency}${integerPart}` // e.g., 123.00 => 123
          }
          return `${signPrefix}${currency}${integerPart}.${trimmedDecimal}` // e.g., 123.12, 123.10 => 123.1
        }
        // roundedDecimal = 10000
        const lastInteger = Number(valArr[0]) + 1
        if (lastInteger === 1e3) {
          return `${signPrefix}${currency}1K` // next rules
        }
        return `${signPrefix}${currency}${Number(+valArr[0] + 1).toLocaleString('en-US')}` // e.g., 124
      }
    }
  }

  // x > 10000T: show >9999T, x < -10000T: show <-9999T
  if (absValue >= 1e16 || Math.round(absValue) >= 1e16 || Math.ceil(absValue) >= 1e16) {
    const angleBracket = isNegative ? '<' : '>'
    return `${angleBracket}${signPrefix}${currency}9999T`
  }

  // x >= 1k: use K, M, B, T suffixes, round according to roundMode to 2 significant digits after decimal point
  let scaled: number
  let suffix: string

  if (absValue >= 1e12) {
    scaled = absValue / 1e12
    suffix = 'T'
  } else if (absValue >= 1e9) {
    scaled = absValue / 1e9
    suffix = 'B'
  } else if (absValue >= 1e6) {
    scaled = absValue / 1e6
    suffix = 'M'
  } else {
    scaled = absValue / 1e3
    suffix = 'K'
  }

  const valArr = scaled.toString().split('.')
  if (valArr.length === 1) {
    return `${signPrefix}${currency}${Number(valArr[0]).toLocaleString('en-US')}${suffix}`
  } else {
    const integerPart = Number(valArr[0]).toLocaleString('en-US')
    const decimalPart = valArr[1]
    if (decimalPart.length <= 2) {
      const trimmedDecimal = decimalPart.replace(/0+$/, '') // remove trailing zeros
      if (trimmedDecimal === '') {
        return `${signPrefix}${currency}${integerPart}${suffix}` // e.g., 12K
      }
      return `${signPrefix}${currency}${integerPart}.${trimmedDecimal}${suffix}` // e.g., 12.34K
    } else {
      const factor = Math.pow(10, decimalPart.length - 2)
      let roundedDecimal: number
      switch (roundMode) {
        case 'floor':
          roundedDecimal = Math.floor(parseFloat(decimalPart) / factor)
          break
        case 'ceil':
          roundedDecimal = Math.ceil(parseFloat(decimalPart) / factor)
          break
        case 'round':
        default:
          roundedDecimal = Math.round(parseFloat(decimalPart) / factor)
          break
      }
      if (roundedDecimal === 0) {
        return `${signPrefix}${currency}${integerPart}${suffix}` // e.g., 12K
      } else if (roundedDecimal.toString().length < 2) {
        const paddedDecimal = roundedDecimal.toString().padStart(2, '0')
        return `${signPrefix}${currency}${integerPart}.${paddedDecimal}${suffix}` // e.g., 12.01K
      } else if (roundedDecimal.toString().length === 2) {
        const trimmedDecimal = roundedDecimal.toString().replace(/0+$/, '') // remove trailing zeros
        if (trimmedDecimal === '') {
          return `${signPrefix}${currency}${integerPart}${suffix}` // e.g., 12.00 => 12K
        }
        return `${signPrefix}${currency}${integerPart}.${trimmedDecimal}${suffix}` // e.g., 12.34K, 12.10 => 12.1K
      }
      // roundedDecimal = 100, need to increment integer part
      const newInteger = Number(valArr[0]) + 1
      // Check if need to change suffix (e.g., 999.99K -> 1M)
      if (newInteger >= 1000 && suffix !== 'T') {
        const nextSuffixMap: Record<string, string> = { K: 'M', M: 'B', B: 'T' }
        const nextSuffix = nextSuffixMap[suffix]
        if (nextSuffix) {
          // Rescale: divide by 1000 to get the new scaled value
          const rescaledValue = newInteger / 1000
          const rescaledArr = rescaledValue.toString().split('.')
          const rescaledInteger = Number(rescaledArr[0]).toLocaleString('en-US')
          if (rescaledArr.length === 1) {
            return `${signPrefix}${currency}${rescaledInteger}${nextSuffix}`
          } else {
            const rescaledDecimal = rescaledArr[1]
            if (rescaledDecimal.length <= 2) {
              const trimmedRescaledDecimal = rescaledDecimal.replace(/0+$/, '')
              if (trimmedRescaledDecimal === '') {
                return `${signPrefix}${currency}${rescaledInteger}${nextSuffix}`
              }
              return `${signPrefix}${currency}${rescaledInteger}.${trimmedRescaledDecimal}${nextSuffix}`
            } else {
              // Round the rescaled decimal part to 2 digits
              const rescaledFactor = Math.pow(10, rescaledDecimal.length - 2)
              let rescaledRoundedDecimal: number
              switch (roundMode) {
                case 'floor':
                  rescaledRoundedDecimal = Math.floor(parseFloat(rescaledDecimal) / rescaledFactor)
                  break
                case 'ceil':
                  rescaledRoundedDecimal = Math.ceil(parseFloat(rescaledDecimal) / rescaledFactor)
                  break
                case 'round':
                default:
                  rescaledRoundedDecimal = Math.round(parseFloat(rescaledDecimal) / rescaledFactor)
                  break
              }
              if (rescaledRoundedDecimal === 0) {
                return `${signPrefix}${currency}${rescaledInteger}${nextSuffix}`
              } else if (rescaledRoundedDecimal.toString().length < 2) {
                const paddedRescaledDecimal = rescaledRoundedDecimal.toString().padStart(2, '0')
                return `${signPrefix}${currency}${rescaledInteger}.${paddedRescaledDecimal}${nextSuffix}`
              } else {
                const trimmedRescaledDecimal = rescaledRoundedDecimal.toString().replace(/0+$/, '')
                if (trimmedRescaledDecimal === '') {
                  return `${signPrefix}${currency}${rescaledInteger}${nextSuffix}`
                }
                return `${signPrefix}${currency}${rescaledInteger}.${trimmedRescaledDecimal}${nextSuffix}`
              }
            }
          }
        }
      }
      return `${signPrefix}${currency}${Number(newInteger).toLocaleString('en-US')}${suffix}` // e.g., 1000K
    }
  }
}

export const formatMarketCap = formatVolume
export const formatLiquidity = formatVolume
export const formatNumber = formatVolume

export function formatBalance(
  value: number | string | null | undefined,
  {
    showSign = false,
    showCurrency = false,
    roundMode = 'round',
  }: { showSign?: boolean; showCurrency?: boolean; roundMode?: 'floor' | 'round' | 'ceil' } = {},
): string {
  const numValue = normalizeValue(value)
  if (numValue === null || numValue === undefined) return '--'
  if (numValue === 0) return showCurrency ? '$0' : '0'

  const absValue = Math.abs(numValue)
  const isNegative = numValue < 0
  const signPrefix = showSign ? (isNegative ? '-' : '+') : isNegative ? '-' : ''
  const currency = showCurrency ? '$' : ''

  // 0 < x < 1: round according to roundMode to 4 significant digits after the last zero, at most 3 zeros after decimal point, e.g., 0.0₁₄2164
  if (absValue < 0.1) {
    const zeroCount = zeroCountAfterDecimal(numberToFullString(absValue))
    const significant = getSignificantDigits(numberToFullString(absValue), 4, roundMode)
    if (zeroCount === 0) {
      if (+significant == 10000) {
        return `${signPrefix}${currency}1` // e.g., 1
      }
      const trimmedSignificant = significant.replace(/0+$/, '')
      return `${signPrefix}${currency}0.${trimmedSignificant}` // e.g., 0.9999
    } else if (zeroCount <= 3) {
      if (+significant == 10000) {
        return `${signPrefix}${currency}0.${'0'.repeat(zeroCount - 1)}1` // e.g., 0.0001, 0.001, 0.01, 0.1
      }
      // remove trailing zeros in significant
      const trimmedSignificant = significant.replace(/0+$/, '')
      return `${signPrefix}${currency}0.${'0'.repeat(zeroCount)}${trimmedSignificant}` // e.g., 0.01234, 0.001234, 0.0001234
    } else {
      if (+significant == 10000) {
        const newZeroCount = zeroCount - 1
        if (newZeroCount <= 3) {
          return `${signPrefix}${currency}0.${'0'.repeat(newZeroCount)}1` // e.g., 0.00001
        }
        const subscriptNewZeros = zeroCountToSubNumber(newZeroCount)
        return `${signPrefix}${currency}0.0${subscriptNewZeros}1` // e.g., 0.0₄1, 0.0₅1, 0.0₆1
      }
      const subscriptZeros = zeroCountToSubNumber(zeroCount)
      // remove trailing zeros in significant
      const trimmedSignificant = significant.replace(/0+$/, '')
      return `${signPrefix}${currency}0.0${subscriptZeros}${trimmedSignificant}` // e.g., 0.0₄1234
    }
  }

  // x >= 1: display full number with comma separators, round according to roundMode to 2 decimal places
  const valArr = absValue.toString().split('.')
  if (valArr.length === 1) {
    return `${signPrefix}${currency}${Number(valArr[0]).toLocaleString('en-US')}` // e.g., 123
  } else {
    const integerPart = Number(valArr[0]).toLocaleString('en-US')
    const decimalPart = valArr[1]
    if (decimalPart.length <= 2) {
      // remove trailing zeros in decimal part
      const trimmedDecimal = decimalPart.replace(/0+$/, '')
      return `${signPrefix}${currency}${integerPart}.${trimmedDecimal}` // e.g., 123.12
    } else {
      const factor = Math.pow(10, decimalPart.length - 2)
      let roundedDecimal: number
      switch (roundMode) {
        case 'floor':
          roundedDecimal = Math.floor(parseFloat(decimalPart) / factor)
          break
        case 'ceil':
          roundedDecimal = Math.ceil(parseFloat(decimalPart) / factor)
          break
        case 'round':
        default:
          roundedDecimal = Math.round(parseFloat(decimalPart) / factor)
          break
      }
      if (roundedDecimal === 0) {
        return `${signPrefix}${currency}${integerPart}` // e.g., 123
      } else if (roundedDecimal.toString().length <= 2) {
        const paddedDecimal = roundedDecimal.toString().padStart(2, '0').replace(/0+$/, '')
        return `${signPrefix}${currency}${integerPart}.${paddedDecimal}` // e.g., 123.01
      } else if (roundedDecimal.toString().length === 2) {
        const trimmedDecimal = roundedDecimal.toString().replace(/0+$/, '') // remove trailing zeros
        if (trimmedDecimal === '') {
          return `${signPrefix}${currency}${integerPart}` // e.g., 123.00 => 123
        }
        return `${signPrefix}${currency}${integerPart}.${trimmedDecimal}` // e.g., 123.12, 123.10 => 123.1
      }
      // roundedDecimal = 100
      return `${signPrefix}${currency}${Number(+valArr[0] + 1).toLocaleString('en-US')}` // e.g., 124
    }
  }
}

export function formatPercent(
  value: number | string | null | undefined,
  { showSign = false, showSmallAsAngleBracket = false }: { showSign?: boolean; showSmallAsAngleBracket?: boolean } = {},
): string {
  const numValue = normalizeValue(value)
  if (numValue === null || numValue === undefined) return '--'
  if (numValue === 0) return '0%'

  const absValue = Math.abs(numValue)
  const isNegative = numValue < 0
  const signPrefix = showSign ? (isNegative ? '-' : '+') : isNegative ? '-' : ''

  if (showSmallAsAngleBracket && numValue > 0 && numValue < 0.01) {
    return '<0.01%'
  }

  // -0.01 < x < 0.01: display 0%
  if (absValue < 0.01) {
    if (absValue >= 0.005) {
      return `${signPrefix}0.01%`
    }
    return '0%'
  }

  // 0.01 <= x < 10K: display full number with comma separators, round to 2 decimal places
  if (absValue < 1e4) {
    const valArr = absValue.toString().split('.')
    if (valArr.length === 1) {
      return `${signPrefix}${Number(valArr[0]).toLocaleString('en-US')}%` // e.g., 1,234%
    } else {
      const integerPart = Number(valArr[0]).toLocaleString('en-US')
      const decimalPart = valArr[1]
      if (decimalPart.length <= 2) {
        // remove trailing zeros in significant
        const trimmedDecimal = decimalPart.replace(/0+$/, '')
        return `${signPrefix}${integerPart}.${trimmedDecimal}%` // e.g., 1,234.12%
      } else {
        const factor = Math.pow(10, decimalPart.length - 2)
        const roundedDecimal = Math.round(parseFloat(decimalPart) / factor)
        if (roundedDecimal === 0) {
          return `${signPrefix}${integerPart}%` // e.g., 1,234%
        } else if (roundedDecimal.toString().length <= 2) {
          const paddedDecimal = roundedDecimal.toString().padStart(2, '0').replace(/0+$/, '')
          return `${signPrefix}${integerPart}.${paddedDecimal}%` // e.g., 1,234.01%
        } else if (roundedDecimal.toString().length === 2) {
          const trimmedDecimal = roundedDecimal.toString().replace(/0+$/, '') // remove trailing zeros
          if (trimmedDecimal === '') {
            return `${signPrefix}${integerPart}%` // e.g., 1,234.00 => 1,234%
          }
          return `${signPrefix}${integerPart}.${trimmedDecimal}%` // e.g., 1,234.12, 1,234.10 => 1,234.1%
        }
        const lastInteger = Number(valArr[0]) + 1
        if (lastInteger === 1e4) {
          return `${signPrefix}10K%` // next rules
        }
        return `${signPrefix}${lastInteger.toLocaleString('en-US')}%` // e.g., 1,235%
      }
    }
  }

  // 10K <= x < 10000T: use K, M, B, T suffixes, round to 2 decimal places
  if (absValue >= 1e4 && absValue < 1e16) {
    let scaled: number
    let suffix: string

    if (absValue >= 1e12) {
      scaled = absValue / 1e12
      suffix = 'T'
    } else if (absValue >= 1e9) {
      scaled = absValue / 1e9
      suffix = 'B'
    } else if (absValue >= 1e6) {
      scaled = absValue / 1e6
      suffix = 'M'
    } else {
      scaled = absValue / 1e3
      suffix = 'K'
    }

    // Round to 2 decimal places
    const rounded = Math.round(scaled * 100) / 100
    const roundedStr = rounded.toFixed(2)
    const roundedArr = roundedStr.split('.')
    const integerPart = Number(roundedArr[0]).toLocaleString('en-US')
    const decimalPart = roundedArr[1] || ''
    const trimmedDecimal = decimalPart.replace(/0+$/, '') // remove trailing zeros

    if (trimmedDecimal === '') {
      return `${signPrefix}${integerPart}${suffix}%`
    }
    return `${signPrefix}${integerPart}.${trimmedDecimal}${suffix}%`
  }

  // x <= -10000T: <-9999T%
  if (numValue < 0) {
    return '<-9999T%'
  }

  // x >= 10000T: >9999T%
  return '>9999T%'
}

export function formatDuration(seconds: number) {
  if (seconds < 60) {
    return { label: `${seconds}s`, color: '#00F8D4' }
  } else if (seconds < 3600) {
    return { label: `${Math.floor(seconds / 60)}m`, color: '#00F8D4' }
  } else if (seconds < 86400) {
    return { label: `${Math.floor(seconds / 3600)}h`, color: '#00F8D4' }
  } else {
    return { label: `${Math.floor(seconds / 86400)}d`, color: 'rgba(255, 255, 255, 0.7)' }
  }
}

export function formatPercentageChange(change: number) {
  if (typeof change === undefined) return { label: '--', cls: '' }

  if (Math.abs(change) < 0.01) return { label: '0%', cls: 'text-neutral' }

  let formattedChange = change.toLocaleString('en', { maximumFractionDigits: 2 }).replace(/\.0+$/, '')

  if (change >= 1e16)
    return {
      label: '>9999T%',
      cls: 'text-rise',
    }
  if (change >= 1e12)
    return {
      label: (change / 1e12).toFixed(2).replace(/\.?0+$/, '') + 'T%',
      cls: 'text-rise',
    }
  if (change >= 1e9)
    return {
      label: (change / 1e9).toFixed(2).replace(/\.?0+$/, '') + 'B%',
      cls: 'text-rise',
    }
  if (change >= 1e6)
    return {
      label: (change / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M%',
      cls: 'text-rise',
    }
  if (change >= 1e3)
    return {
      label: (change / 1e3).toFixed(2).replace(/\.?0+$/, '') + 'K%',
      cls: 'text-rise',
    }

  let label = formattedChange + '%'
  let cls = ''

  if (change > 0) {
    cls = 'text-rise'
  } else if (change === 0) {
    cls = 'text-neutral'
  } else {
    cls = 'text-fall'
  }
  return { label, cls }
}

export function formatPercentageChangev2(change: number) {
  if (typeof change === undefined) return { label: '--', cls: '' }

  if (Math.abs(change) < 0.01) return { label: '0%', cls: 'text-neutral' }

  if (change >= 99999) {
    return {
      label: '>9999%',
      cls: 'text-rise',
    }
  }

  if (change <= -99999) {
    return {
      label: '-<9999%',
      cls: 'text-fall',
    }
  }

  let formattedChange = change.toLocaleString('en', { maximumFractionDigits: 2 }).replace(/\.0+$/, '')

  if (change >= 1e16)
    return {
      label: '>9999T%',
      cls: 'text-rise',
    }
  if (change >= 1e12)
    return {
      label: (change / 1e12).toFixed(2).replace(/\.?0+$/, '') + 'T%',
      cls: 'text-rise',
    }
  if (change >= 1e9)
    return {
      label: (change / 1e9).toFixed(2).replace(/\.?0+$/, '') + 'B%',
      cls: 'text-rise',
    }
  if (change >= 1e6)
    return {
      label: (change / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M%',
      cls: 'text-rise',
    }
  if (change >= 1e3)
    return {
      label: (change / 1e3).toFixed(2).replace(/\.?0+$/, '') + 'K%',
      cls: 'text-rise',
    }

  let label = formattedChange + '%'
  let cls = ''

  if (change > 0) {
    cls = 'text-rise'
  } else if (change === 0) {
    cls = 'text-neutral'
  } else {
    cls = 'text-fall'
  }
  return { label, cls }
}

export function formatHolders(count: number) {
  if (count < 1000) return count.toString()

  let unit = ''
  let value = count

  if (count >= 1e9) {
    unit = 'B'
    value = count / 1e9
  } else if (count >= 1e6) {
    unit = 'M'
    value = count / 1e6
  } else if (count >= 1e3) {
    unit = 'K'
    value = count / 1e3
  }

  return value.toFixed(2).replace(/\.?0+$/, '') + unit
}
// market and Transaction amount
export function formatMarketValue(value?: number, currency: string = '') {
  if (value === undefined || value === null) return '--'

  if (value < 1000) return currency + fShortenNumber(value)

  const units = ['K', 'M', 'B', 'T']
  let unitIndex = -1
  let formattedValue = value

  while (formattedValue >= 1000 && unitIndex < units.length - 1) {
    formattedValue /= 1000
    unitIndex++
  }

  if (unitIndex === units.length - 1 && formattedValue >= 10000) {
    return `>${currency}9999T`
  }

  return currency + formattedValue?.toFixed(2)?.replace(/\.?0+$/, '') + units[unitIndex]
}

export function formatTradeCount(tradeCount: number) {
  if (tradeCount < 100000) {
    return tradeCount.toString()
  }

  const units = ['K', 'M', 'B', 'T']
  let unitIndex = 0
  let formattedCount = tradeCount

  while (formattedCount >= 1000 && unitIndex < units.length) {
    formattedCount /= 1000
    unitIndex++
  }

  formattedCount = Math.round(formattedCount * 100) / 100

  if (formattedCount % 1 === 0) {
    return `${formattedCount.toFixed(0)}${units[unitIndex - 1]}`
  } else if ((formattedCount * 10) % 1 === 0) {
    return `${formattedCount.toFixed(1)}${units[unitIndex - 1]}`
  } else {
    return `${formattedCount.toFixed(2)}${units[unitIndex - 1]}`
  }
}

// Legacy formatVolume - kept for backward compatibility
// Use the new formatVolume function above for new code
export function formatVolumeLegacy(volume: number) {
  if (volume > 1e15) return '>9999T'
  return fShortenNumber(volume)
}

// export const formatLiquidity = (liquidity: number | undefined) => {
//   if (liquidity === undefined) return '--'
//   if (liquidity > 1e15) return '>$9999T'
//   return '$' + fShortenNumber(liquidity)
// }

export const getStyleRiseFall = (
  input: number | boolean | '--',
  isEqualZero: boolean = false,
  config: {
    important?: boolean
    classNameRise?: string
    classNameFall?: string
    classNameNeutral?: string
  } = {
    important: false,
    classNameRise: 'text-rise',
    classNameFall: 'text-fall',
    classNameNeutral: 'text-neutral',
  },
) => {
  const {
    important = false,
    classNameRise = 'text-rise',
    classNameFall = 'text-fall',
    classNameNeutral = 'text-neutral',
  } = config
  //NaN, Inffinity, 0
  if (isNaN(Number(input)) || !isFinite(Number(input)) || (typeof input === 'number' && Number(input) === 0)) {
    return classNameNeutral
  }
  // const isBoolean = typeof input === 'boolean' ? input : input == '--' ? false : input >= 0;
  const isBoolean = typeof input === 'boolean' ? input : input === '--' ? true : input >= 0
  if (important) {
    return isBoolean
      ? isEqualZero && (input === 0 || input == '--')
        ? `${classNameNeutral}!`
        : `${classNameRise}!`
      : `${classNameFall}!`
  }
  return isBoolean ? (isEqualZero && (input === 0 || input == '--') ? classNameNeutral : classNameRise) : classNameFall
}
