import { f } from 'fintech-number'
import { formatPercentageChange } from '@/lib/format.ts'
import BigNumber from 'bignumber.js'
export function fShortenNumber(value: number, decimals: number = 2, option?: any): string {
  if (value < 1000) return f(value, { decimal: decimals, ...option }) // No need to shorten

  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q']
  const tier = Math.floor(Math.log10(value) / 3) // Determine the tier (thousands, millions, etc.)

  if (tier === 0) return value.toString() // Less than 1000, return as is

  const suffix = suffixes[tier]
  const scale = Math.pow(10, tier * 3)
  const scaledValue = value / scale

  return scaledValue.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '') + suffix
}

export function fShortenNumberv2(value: number, decimals: number = 2, option?: any): string {
  // Handle numbers less than 1000
  if (Math.abs(value) < 1000) {
    const absValue = Math.abs(value)

    // For very small numbers, use more decimal places
    if (absValue < 0.01 && absValue > 0) {
      const roundedValue = parseFloat(value.toFixed(3))
      return f ? f(roundedValue, { decimal: 3, ...option }) : roundedValue.toString()
    }

    // For small numbers, use 2 decimal places
    if (absValue < 0.1 && absValue > 0) {
      const roundedValue = parseFloat(value.toFixed(2))
      return f ? f(roundedValue, { decimal: 2, ...option }) : roundedValue.toString()
    }

    // For other numbers, use regular decimals
    const roundedValue = parseFloat(value.toFixed(decimals))
    return f ? f(roundedValue, { decimal: decimals, ...option }) : roundedValue.toString()
  }

  // Handle numbers greater than or equal to 1000
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q']
  const tier = Math.floor(Math.log10(Math.abs(value)) / 3)

  if (tier === 0) return value.toString()

  const suffix = suffixes[tier]
  const scale = Math.pow(10, tier * 3)
  const scaledValue = value / scale

  return scaledValue.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '') + suffix
}

export const formatBalanceWallet = ({
  balance,
  decimal = 6,
  round = undefined,
}: {
  balance: number
  decimal?: number
  round?: 'auto' | 'up' | 'down' | undefined
}) => {
  return f(balance, {
    decimal: decimal,
    round: round,
  })
}

export const formatInputValue = (val: number, decimal: number = 6) => {
  if (!isFinite(val)) return '0'

  const factor = Math.pow(10, decimal)
  const floored = Math.floor(val * factor) / factor
  return floored.toString().replace(/\.?0+$/, '')
}

export const formatRoundedNumberInput = (value: number): string => {
  if (Math.abs(value) < 1e-6) return '0'

  const [intPart, decimalPart = ''] = value.toString().includes('e')
    ? value.toFixed(20).replace(/0+$/, '').split('.') // xử lý số dạng e-xx
    : value.toString().split('.')

  let keepDigits = 2
  if (value >= 1 && value < 1000) keepDigits = 3
  else if (value >= 1000 && value < 10000) keepDigits = 4
  else if (value >= 10000) keepDigits = 5

  if (!decimalPart || keepDigits === 0) {
    return intPart
  }

  let result = ''
  let significant = 0
  for (let i = 0; i < decimalPart.length; i++) {
    const digit = decimalPart[i]
    result += digit

    if (significant > 0 || digit !== '0') {
      significant++
    }

    if (significant >= keepDigits) break
  }

  return result ? `${intPart}.${result}` : intPart
}

export const formatNumberLimitPrice = (value: number | string, decimals: number = 2): string => {
  const num = Number(value)

  if (isNaN(num)) return '0'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    useGrouping: false,
  })
}

export function formatInputNumber(
  value: number,
  decimals: number = 4,
  mode: 'round' | 'ceil' | 'floor' = 'floor',
): string {
  if (value === null || value === undefined || isNaN(Number(value))) return '0'

  const bn = new BigNumber(value)
  if (bn.isNaN()) return '0'

  let rounded: BigNumber

  switch (mode) {
    case 'ceil':
      rounded = bn.decimalPlaces(decimals, BigNumber.ROUND_CEIL)
      break
    case 'floor':
      rounded = bn.decimalPlaces(decimals, BigNumber.ROUND_FLOOR)
      break
    default:
      rounded = bn.decimalPlaces(decimals, BigNumber.ROUND_HALF_UP)
  }

  const formatted = rounded.toFixed(decimals)

  const trimmed = formatted.replace(/\.?0+$/, '')

  return trimmed
}

export const formatPriceChange = (value: number) => {
  const formatted = formatPercentageChange(value)
  return formatted.label.replace(/0+$/, '')
}

export const formatCurrency = (value: number) => {
  return f(value, { decimal: 2, tinySupport: 6 })
}

export const parseNumber = (value: string): number => {
  const parsedValue = parseFloat(value)
  return isNaN(parsedValue) ? 0 : parsedValue
}

export const formatSmallPrice = (num: number): string => {
  if (num === 0) return '0'

  // Case: number < 1
  if (num < 1 && num > 0) {
    const decimal = num?.toFixed(20).split('.')[1]
    let result = '0.'
    let nonZeroCount = 0

    for (let i = 0; i < decimal.length; i++) {
      const digit = decimal[i]
      result += digit
      if (digit !== '0') nonZeroCount++
      if (nonZeroCount >= 4) break
    }

    // Trim trailing zeros but preserve leading zeros
    return result.replace(/(\d*?[1-9])0+$/, '$1').replace(/\.$/, '')
  }

  // Case: number >= 1
  const rounded = num?.toFixed(10) // prevent floating-point junk
  const [intPart, decPartRaw] = rounded.split('.')
  const decPart = decPartRaw.replace(/0+$/, '').slice(0, 3) // trim trailing zeros, then limit to 3 digits
  return decPart.length ? `${intPart}.${decPart}` : intPart
}

export type SignedCurrencyFormat = {
  className: string
  text: string
}

export const formatSignedCurrency = (
  value: number,
  options?: {
    decimal?: number
    round?: 'auto' | 'up' | 'down'
    hide?: boolean
  },
): SignedCurrencyFormat => {
  const className = value > 0 ? 'text-[var(--rise)]' : value < 0 ? 'text-[var(--fall)]' : 'text-[#FCFCFC]'

  if (options?.hide) {
    return { className, text: '****' }
  }

  const absValue = Math.abs(value)
  const prefix = value > 0 ? '+$' : value < 0 ? '-$' : '$'
  const amount = formatBalanceWallet({
    balance: absValue,
    decimal: options?.decimal ?? 2,
    round: options?.round ?? 'down',
  })

  return { className, text: `${prefix}${amount}` }
}

type RoundOption = 'up' | 'down' | 'auto'

/**
 * Shortens a large number (e.g., 12345 -> 12.35K) with flexible rounding options.
 *
 * @param value The number to be shortened.
 * @param decimals The number of decimal places to retain (default is 2).
 * @param round The rounding mode: 'up' (ceil), 'down' (floor), or 'auto' (standard/default round).
 * @returns The shortened number as a string with its suffix.
 */
export function fShortenNumberAdvanced(value: number, decimals: number = 2, round: RoundOption = 'auto'): string {
  // 1. Guard Clause: If the value is less than 1000, return the original value as a string.
  if (value < 1000) {
    return value.toString() // Removed semicolon
  }

  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q']
  // Determine the tier (thousands, millions, etc.)
  const tier = Math.floor(Math.log10(value) / 3)

  // Should not happen if value < 1000 check passed, but kept for robustness.
  if (tier === 0) return value.toString() // Removed semicolon

  const suffix = suffixes[tier]
  const scale = Math.pow(10, tier * 3) // The divisor (e.g., 1000, 1000000)
  let scaledValue = value / scale

  // 2. ROUNDING LOGIC based on the `round` parameter
  const roundFactor = Math.pow(10, decimals)
  let roundingFunction: (x: number) => number

  switch (round) {
    case 'up':
      // Always round up (ceiling)
      roundingFunction = Math.ceil
      break
    case 'down':
      // Always round down (floor)
      roundingFunction = Math.floor
      break
    case 'auto':
    default:
      // Standard rounding (round half up)
      roundingFunction = Math.round
      break
  }

  // Apply the rounding operation: (scaledValue * 10^N) -> round -> / 10^N
  scaledValue = roundingFunction(scaledValue * roundFactor) / roundFactor

  // 3. STRING FORMATTING AND TRIMMING
  let result = scaledValue.toString()

  // Ensure the required number of decimal places are present (e.g., 10 -> 10.00)
  if (decimals > 0) {
    const parts = result.split('.')
    if (parts.length === 1) {
      // No decimal part, append '.00...'
      result += '.' + '0'.repeat(decimals)
    } else if (parts[1].length < decimals) {
      // Decimal part exists but is too short, append trailing zeros
      result += '0'.repeat(decimals - parts[1].length)
    }
  }

  // Remove trailing zeros and the decimal point if it's the last character
  if (decimals > 0) {
    // E.g., 1.20K -> 1.2K; 1.00K -> 1K
    result = result.replace(/0+$/, '').replace(/\.$/, '')
  } else {
    // If decimals=0, ensure no decimal point is left
    result = result.replace(/\.$/, '')
  }

  return result + suffix // Removed semicolon
}

export const formatSafeDecimalNumberString = (value: number): string => {
  const [intPart, decimalPart] = value.toString().split('.')
  if (decimalPart && decimalPart.length > 6) {
    return `${intPart}.${decimalPart.slice(0, 6)}`
  }
  return value.toString()
}

export function roundUp(num: number, decimals: number = 4): string {
  // const pow = Math.pow(10, decimals)
  // if (num >= 0) {
  //   return (Math.ceil(num * pow) / pow).toFixed(decimals)
  // }
  // return (Math.floor(num * pow) / pow).toFixed(decimals)
  return num.toFixed(decimals)
}
