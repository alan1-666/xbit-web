import { ExchangeEntry, FundingRateList } from '@/components/futuresDetails/tokenSelect'
import i18n from '@/i18n'
import { LAUNCHPADS, LAUNCHPADS_BY_CHAINS } from '@/lib/constant.ts'
import { IErrorMessagesState, LanguageCode, MultiLanguageMessage } from '@/redux/modules/errorMessages.slice'
import { TimeWheelDateType } from '@/redux/modules/tokenDetail.slice.ts'
import { CurrencyUnit } from '@/types/currency'
import { ChainIds } from '@/types/enums.ts'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'
import { f } from 'fintech-number'
import { TFunction } from 'i18next'
import ls from '@/lib/local-storage.ts'

const tokenChans = ls.get('tokensChains')
const chains = tokenChans?.relayCurrencies?.chains || []

export * from './copy-trade-helper'

dayjs.extend(relativeTime)
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: '1m',
    mm: '%d' + 'm',
    h: '1h',
    hh: '%d' + 'h',
    d: '1d',
    dd: '%d' + 'd',
    M: '1M',
    MM: '%d' + 'M',
    y: '1y',
    yy: '%d' + 'y',
  },
})

/**
 * Defines the mapping of chain IDs to their respective names.
 */
export const BLOCKCHAIN_NAMES: Record<ChainIds, string> = {
  [ChainIds.Ethereum]: 'Ethereum',
  [ChainIds.Bsc]: 'BNB Chain',
  [ChainIds.BscTest]: 'BSC Testnet',
  [ChainIds.Avalanche]: 'Avalanche',
  [ChainIds.FantomOpera]: 'Fantom Opera',
  [ChainIds.Arbitrum]: 'Arbitrum',
  [ChainIds.Polygon]: 'Polygon',
  [ChainIds.Pulse]: 'Pulse',
  [ChainIds.Bitrock]: 'Bitrock',
  [ChainIds.Shibarium]: 'Shibarium',
  [ChainIds.Cybria]: 'Cybria',
  [ChainIds.Base]: 'Base',
  [ChainIds.Solana]: 'Solana',
  [ChainIds.BTC]: 'Bitcoin',
  [ChainIds.TON]: 'TON',
  [ChainIds.TRX]: '',
  [ChainIds.HyperEVM]: 'HyperEVM',
  [ChainIds.Hyperliquid]: 'Hyperliquid',
  [ChainIds.Mon]: 'Monad',
}

export const BLOCKCHAIN_SHORTNAME: Record<ChainIds, string> = {
  [ChainIds.Ethereum]: 'ETH',
  [ChainIds.Bsc]: 'BNB',
  [ChainIds.BscTest]: 'BSC Testnet',
  [ChainIds.Avalanche]: 'AVAX',
  [ChainIds.FantomOpera]: 'FTM',
  [ChainIds.Arbitrum]: 'ARB',
  [ChainIds.Polygon]: 'MATIC',
  [ChainIds.Pulse]: 'PULSE',
  [ChainIds.Bitrock]: 'BITROCK',
  [ChainIds.Shibarium]: 'SHIB',
  [ChainIds.Cybria]: 'CYB',
  [ChainIds.Base]: 'BASE',
  [ChainIds.Solana]: 'SOL',
  [ChainIds.BTC]: 'BTC',
  [ChainIds.TON]: 'TON',
  [ChainIds.TRX]: 'TRX',
  [ChainIds.Mon]: 'MON',
}

const trustwalletAssetURL = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains'
const chainAsset: Record<ChainIds, string> = {
  [ChainIds.Bsc]: 'smartchain',
  [ChainIds.Ethereum]: 'ethereum',
  [ChainIds.Optimism]: 'optimism',
  [ChainIds.Arbitrum]: 'arbitrum',
  [ChainIds.Polygon]: 'polygon',
  [ChainIds.Pulse]: 'pulse',
  [ChainIds.Bitrock]: 'bitrock',
  [ChainIds.Shibarium]: 'shibarium',
  [ChainIds.Cybria]: 'cybria',
  [ChainIds.Solana]: 'solana',
  [ChainIds.Base]: 'base',
  [ChainIds.Avalanche]: 'avalanchec',
  [ChainIds.BscTest]: 'binance',
  [ChainIds.FantomOpera]: 'fantom',
  [ChainIds.BTC]: 'bitcoin',
  [ChainIds.TON]: 'ton',
  [ChainIds.TRX]: 'tron',
  [ChainIds.Monad]: 'monad',
}

const TOKEN_LOGOS: Record<string, string> = {
  usdc: '/images/icons/chains/ic-usdc.svg',
  usdt: '/images/icons/chains/usdt.png',
  eth: '/images/icons/chains/ic-ethereum.svg',
  weth: '/images/icons/chains/ic-ethereum.svg',
  bnb: '/images/icons/chains/ic-bnb.svg',
  wbnb: '/images/icons/chains/ic-bnb.svg',
  arb: '/images/icons/chains/ic-arbitrum.svg',
  sol: '/images/icons/sol-rounded-new.svg',
  wsol: '/images/icons/sol-rounded-new.svg',
  usde: '/images/icons/chains/ic-usdc.svg',
  'usd₮0': '/images/icons/chains/usdt.png',
  pol: '/images/icons/chains/pol.png',
  wmon: '/images/icons/chains/wmon.png',
  mon: '/images/icons/chains/pol.png',
  usdt0: '/images/icons/chains/usdt0.png',
  wusde: '/images/icons/chains/wusde.png',
  ausd: '/images/icons/chains/ausd.png',
  btc: '/images/icons/chains/pol.png',
  uxrp: '/images/icons/chains/pol.png',
  cbbtc: '/images/icons/chains/ic-cbbtc.svg',
  whype: '/images/icons/chains/HyperEVM.png',
  hype: '/images/icons/chains/HyperEVM.png',
  hbhype: '/images/icons/chains/HyperEVM.png',
  ueth: '/images/icons/chains/ic-ethereum.svg',
  ubtc: '/images/icons/chains/ubtc.png',
  xaut0: '/images/icons/chains/XAUt0.webp',
  khype: '/images/icons/chains/khype.webp',
  sthype: '/images/icons/chains/ic-hyperliquid.png',
}

export const getBlockChainLogo = (chainId: ChainIds | number, baseToken: string, symbol?: string) => {
  const symbolLower = symbol?.toLowerCase()
  if (symbolLower && TOKEN_LOGOS[symbolLower]) {
    return TOKEN_LOGOS[symbolLower]
  }

  // const trustwalletAssetURL = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains'
  //
  // // To get more chain go to : https://github.com/trustwallet/assets/tree/master/blockchains
  // const chainAsset: Record<ChainIds, string> = {
  //   [ChainIds.Bsc]: 'smartchain',
  //   [ChainIds.Ethereum]: 'ethereum',
  //   [ChainIds.Arbitrum]: 'arbitrum',
  //   [ChainIds.Polygon]: 'polygon',
  //   [ChainIds.Pulse]: 'pulse',
  //   [ChainIds.Bitrock]: 'bitrock',
  //   [ChainIds.Shibarium]: 'shibarium',
  //   [ChainIds.Cybria]: 'cybria',
  //   [ChainIds.Solana]: 'solana',
  //   [ChainIds.Base]: 'base',
  //   [ChainIds.Avalanche]: '',
  //   [ChainIds.BscTest]: '',
  //   [ChainIds.FantomOpera]: '',
  //   [ChainIds.BTC]: '',
  //   [ChainIds.TON]: '',
  //   [ChainIds.TRX]: 'tron',
  // }

  return baseToken === '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
    ? '/images/icons/chains/ic-usdc.svg'
    : `${trustwalletAssetURL}/${chainAsset[chainId as ChainIds]}/assets/${baseToken}/logo.png`
  // Optional: return ChainIcon
}

export function getBlockchainLogo2(chainId?: ChainIds) {
  if (!chainId) return ''
  if (chainId === ChainIds.Ethereum) return '/images/icons/chains/ic-ethereum.svg'
  if (chainId === ChainIds.Arbitrum) return '/images/icons/chains/ic-arbitrum.svg'
  if (chainId === ChainIds.Solana) return '/images/icons/sol-rounded-new.svg'
  if (chainId === ChainIds.Bsc) return '/images/bsc.svg'
  if (chainId === ChainIds.Hyperliquid) return '/images/icons/chains/ic-hyperliquid.png'
  if (chainId === ChainIds.Mon) return '/images/icons/chains/ic-monad.svg'
  const chain = chains.find((c: any) => c.chainId == chainId)
  if (chain && chain.chainImage) return chain.chainImage
  return `${trustwalletAssetURL}/${chainAsset[chainId]}/info/logo.png`
}

export const timeFromNow = (timestamp?: number) => {
  if (!timestamp) return '--'

  if (isNaN(timestamp) || timestamp <= 0) return '--'

  const timestampMs =
    String(timestamp).length === 10
      ? timestamp * 1000 // Convert seconds to milliseconds if needed
      : timestamp

  const past = dayjs(timestampMs)
  if (!past.isValid()) return '--'

  const now = dayjs()
  const seconds = now.diff(past, 'seconds')
  const minutes = now.diff(past, 'minutes')
  const hours = now.diff(past, 'hours')
  const days = now.diff(past, 'days')
  const months = now.diff(past, 'months')
  const years = now.diff(past, 'years')

  if (seconds < 60) return `${seconds}s`
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 30) return `${days} day${days > 1 ? 's' : ''}`
  if (months < 12) return `${months} month${months > 1 ? 's' : ''}`
  return `${years} year${years > 1 ? 's' : ''}`
}

export const formatMoney = (amount?: number, showCurrency: boolean = true, unit?: string, fixed?: number) => {
  if (!amount) return '0'

  const absAmount = Math.abs(amount)

  const formatter = (num: number) => parseFloat(num.toFixed(fixed ?? 2)).toLocaleString('en-US') // Ensures proper formatting

  let formattedAmount: string

  if (absAmount >= 1_000_000_000_000_000) {
    formattedAmount = `${formatter(absAmount / 1_000_000_000_000_000)}Q` // Quadrillions
  } else if (absAmount >= 1_000_000_000_000) {
    formattedAmount = `${formatter(absAmount / 1_000_000_000_000)}T` // Trillions
  } else if (absAmount >= 1_000_000_000) {
    formattedAmount = `${formatter(absAmount / 1_000_000_000)}B` // Billions
  } else if (absAmount >= 1_000_000) {
    formattedAmount = `${formatter(absAmount / 1_000_000)}M` // Millions
  } else if (absAmount >= 1_000) {
    formattedAmount = `${formatter(absAmount / 1_000)}K` // Thousands
  } else if (absAmount < 1) {
    formattedAmount = Number(absAmount)
      .toFixed(fixed ?? 8)
      .replace(/\.0+$/, '')
      .replace(/(\.\d+?)0+$/, '$1')
  } else {
    formattedAmount = formatter(parseFloat(`${absAmount}`))
  }

  let result = showCurrency ? `$${formattedAmount}` : formattedAmount
  if (amount < 0) {
    result = `-${result}`
  }

  if (unit) {
    result += ` ${unit}`
  }

  return result
}

// Subscript numbers for small values
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
  if (zeroCount == 0 || zeroCount == 1) return ''
  if (zeroCount > 9) {
    const subscriptNumbers = zeroCount
      .toString()
      .split('')
      .map((num) => subscript[Number(num)]?.sub)
      .join('')
    return subscriptNumbers
  }
  return subscript[zeroCount]?.sub
}

export const formatSmallNumber = (value?: number, showCurrency: boolean = true, afterSub?: number): string => {
  if (!value) return '--'

  if (value >= 0.01) {
    return showCurrency ? `$${formatMoney(value, false)}` : formatMoney(value, false) // Remove extra $
  }

  const str = value.toFixed(20) // Convert to full decimal representation
  const match = str.match(/^0\.0+(?=\d)/) // Find leading zeros after "0."

  if (!match) {
    return showCurrency ? `$${formatMoney(value, false)}` : formatMoney(value, false) // Ensure formatMoney doesn't add $
  }

  const zeroCount = match[0].length - 2 // Count extra zeros after "0.0"
  const subscript = `${zeroCountToSubNumber(zeroCount)}` // Create subscript for zeros

  // Extract only meaningful digits, ignoring trailing zeros
  const significantPart = str
    .replace(/^0\.0+/, '')
    .replace(/^0+/, '')
    .slice(0, afterSub ?? 4)

  return `${showCurrency ? '$' : ''}0.0${subscript}${significantPart}`
}

export const formatPrice = (value?: number, afterSub?: number) => {
  return value ? formatSmallNumber(value, true, afterSub) : '0'
}
export const symbolFormat = (symbol: string) => {
  return symbol
}

export function getFormatPriceDecimal(price: string) {
  const input = formatDetailPrice(Number(price ?? 0))
  const subMatch = input.match(/<sub[^>]*>(.*?)<\/sub>/)
  if (!subMatch) {
    const parts = input.split('.')
    const dec = parts[1] || ''
    return dec.length
  }

  const subValue = subMatch[1]

  const subNumber = parseInt(subValue, 10)

  const indexSub = input.indexOf('<sub')
  const beforeSub = input.slice(0, indexSub)

  const indexEndSub = input.indexOf('</sub>')
  const trailing = input.slice(indexEndSub + 6)

  // let intPart = ''
  let decPart = ''
  const dotIndex = beforeSub.indexOf('.')
  if (dotIndex !== -1) {
    // intPart = beforeSub.slice(0, dotIndex)
    decPart = beforeSub.slice(dotIndex + 1)
  } else {
    // intPart = beforeSub
  }

  let paddedDecPart = decPart
  if (paddedDecPart.length < subNumber) {
    paddedDecPart = '0'.repeat(subNumber - paddedDecPart.length) + paddedDecPart
  }

  const newDecPart = paddedDecPart + trailing
  // const processed = intPart + "." + newDecPart;

  return newDecPart.length
}

export const formatDetailPrice = (value: number): string => {
  if (value === 0 || !value) return '0'

  // Handle values < 1
  if (value < 1) {
    // Convert to string with many decimal places
    const str = value.toFixed(20)

    // Find the first non-zero digit after decimal
    const match = str.match(/^0\.0*[1-9]/)

    if (!match) return str // Safety check

    // Count zeros after decimal point
    const zeroCount = match[0].length - 3 // -2 for "0." and -1 for the first non-zero digit

    if (zeroCount >= 4) {
      // For numbers with >= 4 zeros after decimal point (e.g., 0.000123)
      const subscript = `<sub class="text-[70%]">${zeroCount}</sub>`

      // Get the first 4 significant digits
      let significantPart = ''
      let significantDigitCount = 0
      let startCounting = false

      // Find the first 4 significant digits
      for (let i = 0; i < str.length && significantDigitCount < 4; i++) {
        const char = str[i]
        if (char !== '0' && char !== '.') {
          startCounting = true
        }
        if (startCounting && /[0-9]/.test(char)) {
          significantPart += char
          significantDigitCount++
        }
      }

      return `0.0${subscript}${significantPart}`
    } else {
      // For numbers like 0.1234, 0.01234, 0.001234
      const precision = 4 + (zeroCount > 0 ? zeroCount : 0)
      return value.toPrecision(precision).replace(/\.?0+$/, '')
    }
  }

  // Handle values >= 1
  const fixed = value.toFixed(4)

  // Remove trailing zeros and decimal point if all decimal digits are zero
  return fixed.replace(/\.0+$/, '').replace(/(\.\d+?)0+$/, '$1')
}

// Super long price handling
export const formatSuperLongPrice = (value: number, maxLength = 10): string => {
  const formatted = formatDetailPrice(value)

  // If HTML is present (has subscript for small numbers), preserve it
  if (formatted.includes('<sub')) {
    return formatted // Already optimized for display
  }

  // For large numbers with many digits
  if (formatted.length > maxLength) {
    // If very long (over maxLength + 5), apply both size reduction and truncation
    if (formatted.length > maxLength + 5) {
      const visiblePart = formatted.slice(0, maxLength)
      const hiddenPart = formatted.slice(maxLength)
      return `<span class="text-[8pt]">${visiblePart}</span><span class="hidden" title="${formatted}">${hiddenPart}</span>...`
    }
    // If moderately long, just reduce the font size
    else {
      return `<span class="text-[8pt]" title="${formatted}">${formatted}</span>`
    }
  }

  return formatted
}

/**
 * Formats a percentage value according to specified rules
 * @param value - The percentage value (already multiplied by 100)
 * @param includeSign - Whether to include + sign for positive values
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, includeSign = false): string => {
  // Handle null/undefined case
  if (!value || isNaN(value) || value === Infinity || value === -Infinity) return '0%'

  // Handle extremely large values (≥10000T%)
  if (value >= 10000000000000000) {
    return '>9999T%'
  }

  // Handle value conversion with suffixes for large percentages
  if (value >= 1000) {
    let formattedValue: string

    if (value >= 1000000000000) {
      // Trillions
      formattedValue = (value / 1000000000000)
        .toFixed(2)
        .replace(/\.0+$/, '')
        .replace(/(\.\d+?)0+$/, '$1')
      return `${includeSign && value > 0 ? '+' : ''}${formattedValue}T%`
    } else if (value >= 1000000000) {
      // Billions
      formattedValue = (value / 1000000000)
        .toFixed(2)
        .replace(/\.0+$/, '')
        .replace(/(\.\d+?)0+$/, '$1')
      return `${includeSign && value > 0 ? '+' : ''}${formattedValue}B%`
    } else if (value >= 1000000) {
      // Millions
      formattedValue = (value / 1000000)
        .toFixed(2)
        .replace(/\.0+$/, '')
        .replace(/(\.\d+?)0+$/, '$1')
      return `${includeSign && value > 0 ? '+' : ''}${formattedValue}M%`
    } else {
      // Thousands (K)
      formattedValue = (value / 1000)
        .toFixed(2)
        .replace(/\.0+$/, '')
        .replace(/(\.\d+?)0+$/, '$1')
      return `${includeSign && value > 0 ? '+' : ''}${formattedValue}K%`
    }
  }

  // Regular formatting for values < 10K%
  // Round to 2 decimal places
  if (!value) return '--'
  let formattedValue = Number(value)?.toFixed(2)
  // Remove unnecessary zeros
  formattedValue = formattedValue.replace(/\.0+$/, '') // Remove if all decimal places are 0
  formattedValue = formattedValue.replace(/(\.\d+?)0+$/, '$1') // Remove trailing zeros

  // Add sign if needed
  if (includeSign && value > 0) {
    formattedValue = `+${formattedValue}`
  }

  return `${formattedValue}%`
}

/**
 * Calculates percentage change between two values
 * @param currentValue - The latest value
 * @param previousValue - The previous value to compare against
 * @returns Formatted percentage change
 */
export const calculatePercentageChange = (currentValue: number, previousValue: number): string => {
  if (!previousValue) return '--'

  const percentageChange = ((currentValue - previousValue) / previousValue) * 100
  return formatPercentage(percentageChange, true)
}

export const formatSmallLongNumber = (value: number): string => {
  if (value === 0 || !isFinite(value)) return '--'

  const isNegative = value < 0
  const decimals = 20
  const factor = Math.pow(10, decimals)
  const floored = Math.floor(Math.abs(value) * factor) / factor
  const absValueStr = floored.toString().replace(/0+$/, '').replace(/\.$/, '')
  const [_, decimal = ''] = absValueStr.split('.')
  // console.log({ value, floored, absValueStr })

  const zeroMatch = decimal.match(/0{4,}/)
  if (zeroMatch) {
    const zeroStr = zeroMatch[0]
    const zeroStart = decimal.indexOf(zeroStr)
    const afterZeros = decimal.slice(zeroStart + zeroStr.length)
    const nextDigits = afterZeros.slice(0, 3)
    return `${isNegative ? '-' : ''}0.0{${zeroStr.length}}${nextDigits}`
  }

  if (floored < 1) {
    let count = 0
    let result = ''
    for (const digit of decimal) {
      result += digit
      if (digit !== '0') count++
      if (count >= 4) break
    }
    if (!result) return '--'
    return `${isNegative ? '-' : ''}0.${result}`
  } else {
    const factor4 = Math.pow(10, 4)
    const floored4 = Math.floor(floored * factor4) / factor4
    return `${isNegative ? '-' : ''}${floored4.toString().replace(/0+$/, '').replace(/\.$/, '')}`
  }
}

export const relayExplorer = (txHash: string) => `https://relay.link/transactions/${txHash}`

export const getLinkExplorer = (chainId: ChainIds, txHash: string) => {
  const chainExplorer: Record<ChainIds, string> = {
    [ChainIds.Bsc]: 'https://bscscan.com/tx/',
    [ChainIds.Ethereum]: 'https://etherscan.io/tx/',
    [ChainIds.Arbitrum]: 'https://arbiscan.io/tx/',
    [ChainIds.Polygon]: 'https://polygonscan.com/tx/',
    [ChainIds.Pulse]: 'https://pulsechain.explorer.pulsechain.com/tx/',
    [ChainIds.Bitrock]: '',
    [ChainIds.Shibarium]: '',
    [ChainIds.Cybria]: '',
    [ChainIds.Solana]: 'https://solscan.io/tx/',
    [ChainIds.Base]: 'https://basescan.org/tx/',
    [ChainIds.Avalanche]: 'https://snowtrace.io/tx/',
    [ChainIds.BscTest]: 'https://testnet.bscscan.com/tx/',
    [ChainIds.FantomOpera]: 'https://ftmscan.com/tx/',
    [ChainIds.BTC]: '',
    [ChainIds.TON]: '',
    [ChainIds.TRX]: '',
    [ChainIds.HyperEVM]: 'https://app.hyperliquid.xyz/explorer/tx/',
    [ChainIds.Hyperliquid]: 'https://app.hyperliquid.xyz/explorer/tx/',
    [ChainIds.Mon]: 'https://monad.socialscan.io/tx/',
  }

  return `${chainExplorer[chainId]}${txHash}`
}

export const getLinkExplorer2 = (chainId: ChainIds, address: string) => {
  const chainExplorer: Record<ChainIds, string> = {
    [ChainIds.Bsc]: 'https://bscscan.com/address/',
    [ChainIds.Ethereum]: 'https://etherscan.io/address/',
    [ChainIds.Arbitrum]: 'https://arbiscan.io/address/',
    [ChainIds.Polygon]: 'https://polygonscan.com/address/',
    [ChainIds.Pulse]: 'https://pulsechain.explorer.pulsechain.com/address/',
    [ChainIds.Bitrock]: '',
    [ChainIds.Shibarium]: '',
    [ChainIds.Cybria]: '',
    [ChainIds.Solana]: 'https://solscan.io/account/',
    [ChainIds.Base]: 'https://basescan.org/address/',
    [ChainIds.Avalanche]: 'https://snowtrace.io/address/',
    [ChainIds.BscTest]: 'https://testnet.bscscan.com/address/',
    [ChainIds.FantomOpera]: 'https://ftmscan.com/address/',
    [ChainIds.BTC]: '',
    [ChainIds.TON]: '',
    [ChainIds.TRX]: '',
    [ChainIds.Mon]: 'https://monad.socialscan.io/address/',
  }

  return `${chainExplorer[chainId]}${address}`
}

export function formatTokenPrice(
  value: number,
  options?: {
    roundType?: 'round' | 'floor' | 'ceil'
  },
): {
  integerPart: string
  zeroCount: number
  decimalPart: string
  unit?: string
} {
  const roundType = options?.roundType || 'round'

  const roundFn = (val: number) => {
    switch (roundType) {
      case 'floor':
        return Math.floor(val)
      case 'ceil':
        return Math.ceil(val)
      default:
        return Math.round(val)
    }
  }

  const negative = value < 0
  const absValue = Math.abs(value)

  if (absValue >= 1_000_000_000) {
    const formattedValue = (absValue / 1_000_000_000).toFixed(4)
    return {
      integerPart: `${negative ? '-' : ''}${formattedValue.replace(/\.0+$/, '').replace(/(\.\d+?)0+$/, '1')}`,
      zeroCount: 0,
      decimalPart: '',
      unit: 'B',
    }
  }

  if (absValue < 1) {
    const str = value.toString()
    const [base, exponent] = str.split('e')

    if (exponent) {
      const exponentValue = parseInt(exponent, 10)
      const zerosToAdd = Math.abs(exponentValue) - 1
      const [integerPart, decimalPart] = base.split('.')
      let newDecimalPart = ''
      if (decimalPart) {
        const decimalLength = parseInt(integerPart) >= 1 ? 4 : 3
        const decimalLongerThan4 = decimalPart.length > decimalLength
        const decimal = decimalLongerThan4
          ? roundFn(parseFloat(decimalPart.slice(0, decimalLength)) / 10)
          : parseFloat(decimalPart)
        newDecimalPart = decimalLongerThan4 ? decimal.toString() : decimalPart
      }
      return {
        integerPart: `${negative ? '-' : ''}0`,
        zeroCount: zerosToAdd,
        decimalPart: `${integerPart}${newDecimalPart}`.replace(/0+$/, ''),
      }
    }

    const decimalIndex = str.indexOf('.')
    const decimalPart = str.slice(decimalIndex + 1)
    const zeroMatch = decimalPart.match(/^0{4,}/)

    if (zeroMatch) {
      const zeroStr = zeroMatch[0]
      const zeroStart = decimalPart.indexOf(zeroStr)
      const afterZeros = decimalPart.slice(zeroStart + zeroStr.length)
      const nextDigits = afterZeros.slice(0, 5)
      const rounded = nextDigits.length > 4 ? roundFn(parseFloat(nextDigits) / 10) : afterZeros
      const zeroCount = zeroStr.length
      return {
        integerPart: `${negative ? '-' : ''}0`,
        zeroCount,
        decimalPart: rounded.toString().replace(/0+$/, ''),
      }
    } else {
      const zeroCount = decimalPart.search(/[^0]/)
      const afterZeros = decimalPart.slice(zeroCount, zeroCount + 5)
      const rounded = afterZeros.length >= 4 ? roundFn(parseFloat(afterZeros) / 10) : afterZeros.toString()
      const zeroString = zeroCount > 0 ? '0'.repeat(zeroCount) : ''
      return {
        integerPart: `${negative ? '-' : ''}0`,
        zeroCount: 0,
        decimalPart: (zeroString + rounded).replace(/0+$/, ''),
      }
    }
  } else {
    const str = value.toString()
    const [integerPart, decimalPart] = str.split('.')
    if (!decimalPart) {
      return {
        integerPart: `${negative ? '-' : ''}${str}`,
        zeroCount: 0,
        decimalPart: '',
      }
    }

    if (decimalPart.length > 4) {
      const zeroCount = decimalPart.search(/[^0]/)
      const rounded = roundFn(parseFloat(decimalPart.slice(0, 5)) / 10)
      const zeroString = zeroCount > 0 ? '0'.repeat(zeroCount) : ''
      return {
        integerPart: `${negative ? '-' : ''}${integerPart}`,
        zeroCount: 0,
        decimalPart: (zeroString + rounded.toString()).replace(/0+$/, ''),
      }
    }
    return {
      integerPart: `${negative ? '-' : ''}${str}`,
      zeroCount: 0,
      decimalPart: '',
    }
  }
}

export const isRealIOSSafari = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios/.test(userAgent)

  const isNotDevTools = !('chrome' in window) && window.self === window.top

  return isIOS && isSafari && isNotDevTools
}

export const detectIOSBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase()

  if (!/iphone|ipad|ipod/.test(userAgent)) {
    return { isIOS: false, browser: null }
  }

  // iOS detected, now check which browser
  if (/crios/.test(userAgent)) return { isIOS: true, browser: 'chrome' }
  if (/fxios/.test(userAgent)) return { isIOS: true, browser: 'firefox' }
  if (/edgios/.test(userAgent)) return { isIOS: true, browser: 'edge' }
  if (/safari/.test(userAgent)) return { isIOS: true, browser: 'safari' }

  return { isIOS: true, browser: 'unknown' }
}

export function formatNumber(value: number | string): string {
  if (typeof value === 'string') {
    value = parseFloat(value)
  }
  if (isNaN(value)) return '--'
  return value
    .toLocaleString('en-US')
    .replace(/\.0+$/, '')
    .replace(/(\.\d+?)0+$/, '$1')
    .replace(/,/g, '.')
}

export const removeFormatting = (value: string): string => {
  if (!value) return ''
  return value.replace(/,/g, '')
}

export function isAllZeros(str: string): boolean {
  return /^0+$/.test(str)
}

export function formatNumberWithCommas(value: string | number, maxDecimals?: number): string {
  if (!value || value === '' || value === '.') return value.toString()

  const parts = value.toString().split('.')
  const integerPart = parts[0]
  let decimalPart = parts[1]
  if (decimalPart !== undefined && maxDecimals !== undefined) {
    decimalPart = decimalPart.slice(0, maxDecimals)
  }
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // if (decimalPart !== undefined && decimalPart !== '' && !isAllZeros(decimalPart))
  if (decimalPart !== undefined && decimalPart !== '') {
    return `${formattedInteger}.${decimalPart}`
  }
  return formattedInteger
}

export function formatNumberWithUnit(value: number, unit: string): string {
  if (isNaN(value)) return '--'
  return `${value
    .toLocaleString('en-US')
    .replace(/\.0+$/, '')
    .replace(/(\.\d+?)0+$/, '$1')
    .replace(/,/g, '.')} ${unit}`
}

export function formatChartPrice(value: any): string {
  if (isNaN(value)) return '--'
  const absValue = Math.abs(value)
  const moneyFormatted = formatTokenPrice(absValue)
  const { integerPart, zeroCount, decimalPart } = moneyFormatted
  const zeroCountStr = zeroCountToSubNumber(zeroCount)
  const formattedDecimalPart = decimalPart.replace(/0+$/, '').replace('-', '')
  let output = ''
  if (zeroCount > 0) {
    output = decimalPart ? `${f(+integerPart)}.0${zeroCountStr}${formattedDecimalPart}` : f(+integerPart)
  } else {
    output = decimalPart ? `${f(+integerPart)}.${formattedDecimalPart}` : f(+integerPart)
  }
  return `${value < 0 ? '-' : ''}${output}`
}

export function formatPrice2(value: any): string {
  if (isNaN(value)) return '--'
  const absValue = Math.abs(value)
  const moneyFormatted = formatTokenPrice(absValue)
  const { integerPart, zeroCount, decimalPart } = moneyFormatted
  const zeroInDecimal = decimalPart.match(/^0+/)?.[0].length || 0
  const totalZeroCount = zeroCount + zeroInDecimal
  const zeroCountStr = zeroCountToSubNumber(totalZeroCount)
  const decimalWithoutLeadingZeros = decimalPart.replace(/^0+/, '')
  const formattedDecimalPart = decimalWithoutLeadingZeros.replace('-', '').slice(0, 2).replace(/0+$/, '')
  let output = ''
  if (totalZeroCount > 0) {
    output = decimalPart ? `${f(+integerPart)}.0${zeroCountStr}${formattedDecimalPart}` : f(+integerPart)
  } else {
    output = decimalPart ? `${f(+integerPart)}.${formattedDecimalPart}` : f(+integerPart)
  }
  return `${value < 0 ? '-' : ''}${output}`
}

export function isNumber(value: number | string | undefined): boolean {
  if (typeof value !== 'number') return false
  if (isNaN(value)) return false
  if (!isFinite(value)) return false
  return !(value === Infinity || value === -Infinity)
}

export const tConst = (key: string) => {
  if (!i18n.isInitialized) {
    console.warn('i18n is not initialized yet.')
    return key
  }
  return i18n.t(key)
}

export function getDaysInMonth(year: string, month: string): number {
  return dayjs(`${year}-${month}-01`).daysInMonth()
}

// export const isDiffOver1Month = (startDate?: TimeWheelDateType, endDate?: TimeWheelDateType): boolean => {
//   if (!startDate || !endDate) return false

//   const format = 'YYYY-MM-DD HH:mm'

//   const start = dayjs(
//     `${startDate.year}-${startDate.month}-${startDate.day} ${startDate.hour}:${startDate.minute}`,
//     format,
//   )
//   const end = dayjs(`${endDate.year}-${endDate.month}-${endDate.day} ${endDate.hour}:${endDate.minute}`, format)

//   const diffInMonths = Math.abs(end.diff(start, 'month', true))

//   return diffInMonths > 1
// }

export const isDiffOver1Month = (startDate?: TimeWheelDateType, endDate?: TimeWheelDateType): boolean => {
  if (!startDate || !endDate) return false

  const format = 'YYYY-MM-DD HH:mm'

  const start = dayjs(
    `${startDate.year}-${startDate.month}-${startDate.day} ${startDate.hour}:${startDate.minute}`,
    format,
  )
  const end = dayjs(`${endDate.year}-${endDate.month}-${endDate.day} ${endDate.hour}:${endDate.minute}`, format)

  // THAY ĐỔI: Dùng 'day' thay vì 'month' để check chính xác 30 ngày
  const diffInDays = Math.abs(end.diff(start, 'day', true))

  return diffInDays > 30
}

export const checkStartTimeAfterEndTime = (startDate?: TimeWheelDateType, endDate?: TimeWheelDateType): boolean => {
  if (!startDate || !endDate) return false

  const format = 'YYYY-MM-DD HH:mm'

  const start = dayjs(
    `${startDate.year}-${startDate.month}-${startDate.day} ${startDate.hour}:${startDate.minute}`,
    format,
  )
  const end = dayjs(`${endDate.year}-${endDate.month}-${endDate.day} ${endDate.hour}:${endDate.minute}`, format)

  return start.isAfter(end)
}

export const getLaunchpad = (dexes: string[] | undefined) => {
  if (!dexes) return undefined
  for (const dex of dexes) {
    if (LAUNCHPADS.includes(dex)) {
      return dex
    }
    if (LAUNCHPADS_BY_CHAINS[ChainIds.Bsc].includes(dex)) {
      return dex
    }
     if (LAUNCHPADS_BY_CHAINS[ChainIds.Mon].includes(dex)) {
      return dex
    }
  }
  return undefined
}

export enum Dex {
  PumpSwap = 'PumpSwap',
  Meteora = 'Meteora',
  Raydium = 'Raydium',
}

export const getDexByLaunchpad = (launchpad: string) => {
  switch (launchpad) {
    case 'Pumpfun':
      return Dex.PumpSwap
    case 'Moonit':
      return Dex.Meteora
    case 'MeteoraDBC':
      return Dex.Meteora
    case 'Bonk':
      return Dex.Raydium
    case 'Bags':
      return Dex.Meteora
    case 'Launchlab':
      return Dex.Raydium
    case 'Believe':
      return Dex.Meteora
    case 'Boop':
      return Dex.Meteora
    case 'Moonshot':
      return Dex.Meteora
  }
}

export function formatSmartTimeDiff(timestamp: number): string {
  const now = dayjs()
  const diffMs = now.valueOf() - Number(timestamp)

  if (isNaN(diffMs) || !isFinite(diffMs)) return '--'

  const diffInSeconds = diffMs / 1000
  if (Math.abs(diffInSeconds) < 60) return `${Math.floor(Math.max(diffInSeconds, 0))}s`

  const diffInMinutes = diffInSeconds / 60
  if (Math.abs(diffInMinutes) < 60) return `${Math.floor(Math.max(diffInMinutes, 0))}m`

  const diffInHours = diffInMinutes / 60
  if (Math.abs(diffInHours) < 24) return `${Math.floor(Math.max(diffInHours, 0))}h`

  const diffInDays = diffInHours / 24
  if (Math.abs(diffInDays) < 30) return `${Math.floor(Math.max(diffInDays, 0))}D`

  const diffInMonths = diffInDays / 30
  if (Math.abs(diffInMonths) < 12) return `${Math.floor(Math.max(diffInMonths, 0))}M`

  const diffInYears = diffInDays / 365
  return `${Math.floor(Math.max(diffInYears, 0))}Y`
}

export const waitTimer = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getSubscript = (numStr: string): string => {
  return [...numStr]
    .map((char) => {
      const item = subscript.find((s) => s.number.toString() === char)
      return item?.sub || ''
    })
    .join('')
}

const handleSubscript = (leadingZeros: number, decimals: string, isNegative: boolean): string => {
  const digitsAfterZeros = decimals.slice(leadingZeros)
  const flooredDigits = digitsAfterZeros.slice(0, 4) // floor to 4 digits only
  const sub = getSubscript(leadingZeros.toString())
  const result = `${isNegative ? '-' : ''}0.0${sub}${flooredDigits}`

  // Return 0 if the result is "0.", "0.0", or "0.00"
  if (result === '0.' || result === '0.0' || result === '0.00') {
    return '0'
  }

  return result
}

export function formatLongValue(
  value: number,
  is2Decimal: boolean = false,
  decimalPlaces: number = 6,
  rounded: boolean = true,
): string {
  const suffixes = ['', 'K', 'M', 'B', 'T']

  if (value === 0 || !isFinite(value)) return '0'

  const isNegative = value < 0
  const absVal = Math.abs(value)
  const decimalsToShow = is2Decimal ? 2 : decimalPlaces

  // Large numbers (>= 10000)
  // value >=10000 => 10K, value < 10000 => showFull, ex 9999.99
  if (absVal >= 10000) {
    let tier = Math.floor(Math.log10(absVal) / 3)
    tier = Math.min(tier, suffixes.length - 1)
    // const scaled = Math.floor(absVal / Math.pow(10, tier * 3))
    let scaled = absVal / Math.pow(10, tier * 3)
    if (rounded) {
      scaled = Math.floor(scaled)
    }
    const formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    })
    return `${isNegative ? '-' : ''}${formatter.format(scaled)}${suffixes[tier]}`
  }

  // Numbers between 1 and 999 (with decimals)
  if (absVal >= 1) {
    const decimals = (absVal % 1).toFixed(decimalPlaces).slice(2)
    if (decimals === '0'.repeat(decimalPlaces)) {
      return `${isNegative ? '-' : ''}${Math.floor(absVal)}`
    }

    const match = decimals.match(/^(0+)/)
    const leadingZeros = match ? match[0].length : 0

    if (leadingZeros >= 2) {
      return handleSubscript(leadingZeros, decimals, isNegative)
    } else {
      const cleanDecimal = decimals.replace(/0+$/, '').slice(0, decimalsToShow)
      const result = `${isNegative ? '-' : ''}${Math.floor(absVal)}.${cleanDecimal}`
      if (/^[-]?0\.?0*$/.test(result)) return '0'
      return result
    }
  }

  // Numbers less than 1
  const parts = absVal.toString().split('.')
  const decimals = parts[1] || ''
  const match = decimals.match(/^(0+)/)
  const leadingZeros = match ? match[0].length : 0

  if (leadingZeros >= 2) {
    return handleSubscript(leadingZeros, decimals, isNegative)
  } else {
    const cleanDecimal = decimals.replace(/0+$/, '').slice(0, decimalsToShow)
    const result = `${isNegative ? '-' : ''}0.${cleanDecimal}`
    if (/^[-]?0\.?0*$/.test(result)) return '0'
    return result
  }
}

export function convertTimeWheelToTimestamp(dateObj: TimeWheelDateType): number | null {
  const { year = '1970', month = '1', day = '1', hour = '0', minute = '0' } = dateObj

  const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`

  return dayjs(dateStr).isValid() ? dayjs(dateStr).valueOf() : null
}

export const formatWalletName = (wallet: string) => {
  if (wallet.length <= 10) return wallet
  return `${wallet.slice(0, 5)}...${wallet.slice(-5)}`
}

export function formatDecimal(value: number): string {
  const fixed = value.toFixed(2)
  return fixed.endsWith('.00') ? parseInt(fixed).toString() : fixed
}

export function isMilliseconds(value: number): boolean {
  return value > 1e12 // greater than 1 trillion
}

export function formatTimestamp(isoString: string | undefined, showTime: boolean = false): string {
  if (!isoString || isoString === '--') return '--'
  const format = showTime ? 'YYYY/MM/DD HH:mm' : 'YYYY/MM/DD'
  return dayjs(isoString).format(format)
}

export function getFirstAndLastFiveChars(input: string): string {
  if (input.length <= 10) return input
  const first = input.slice(0, 5)
  const last = input.slice(-5)
  return `${first}...${last}`
}

export function formatDecimalLongValue(value: number, decimalPlaces: number = 4): string {
  const suffixes = ['', 'K', 'M', 'B', 'T']

  if (value === 0 || !isFinite(value)) return '0'

  const isNegative = value < 0
  const absVal = Math.abs(value)

  // Format large numbers with decimal
  if (absVal >= 1000) {
    let tier = Math.floor(Math.log10(absVal) / 3)
    tier = Math.min(tier, suffixes.length - 1)

    const scale = Math.pow(10, tier * 3)
    const scaled = absVal / scale
    const formatted = scaled.toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })

    return `${isNegative ? '-' : ''}${formatted}${suffixes[tier]}`
  }

  // Numbers between 1 and 999 (with decimals)
  if (absVal >= 1) {
    const decimals = (absVal % 1).toFixed(decimalPlaces).slice(2)
    if (decimals === '0'.repeat(decimalPlaces)) {
      return `${isNegative ? '-' : ''}${Math.floor(absVal)}`
    }

    const match = decimals.match(/^(0+)/)
    const leadingZeros = match ? match[0].length : 0

    if (leadingZeros >= 2) {
      return handleSubscript(leadingZeros, decimals, isNegative)
    } else {
      const cleanDecimal = decimals.replace(/0+$/, '').slice(0, decimalPlaces)
      const result = `${isNegative ? '-' : ''}${Math.floor(absVal)}.${cleanDecimal}`
      if (/^[-]?0\.?0*$/.test(result)) return '0'
      return result
    }
  }

  // Numbers less than 1
  function getMeaningfulDigits(raw: string, maxDigits: number): string {
    let collected = ''
    for (const ch of raw) {
      collected += ch
      const nonZeroCount = collected.replace(/[^1-9]/g, '').length
      if (nonZeroCount >= maxDigits) break
    }
    return collected.replace(/0+$/, '').slice(0, maxDigits)
  }
  const rawFixed = absVal.toExponential().includes('e')
    ? absVal.toFixed(20).replace(/0+$/, '') // 30 ensures deep precision, strip trailing zeros
    : absVal.toString()

  const decimals = rawFixed.split('.')[1] || ''
  const match = decimals.match(/^(0+)/)
  const leadingZeros = match ? match[0].length : 0

  if (leadingZeros >= 4) {
    return handleSubscript(leadingZeros, decimals, isNegative)
  } else if (leadingZeros >= 1 && leadingZeros <= 3) {
    const zeros = '0'.repeat(leadingZeros)
    const nonZeroPart = decimals.slice(leadingZeros)
    return `0.${zeros}${getMeaningfulDigits(nonZeroPart, leadingZeros === 3 ? 3 : decimalPlaces)}`
  } else {
    const cleanDecimal = decimals.replace(/0+$/, '').slice(0, decimalPlaces)
    const result = `${isNegative ? '-' : ''}0.${cleanDecimal}`
    if (/^[-]?0\.?0*$/.test(result)) return '0'
    return result
  }
}

export function getMeaningfulDigits(raw: string, maxDigits: number): string {
  let collected = ''
  for (const ch of raw) {
    collected += ch
    const nonZeroCount = collected.replace(/[^1-9]/g, '').length
    if (nonZeroCount >= maxDigits) break
  }
  return collected.replace(/0+$/, '') // remove trailing zeros
}

export function formatDecimalNumber(
  value: number,
  maxMeaningfulDigits: number = 4,
  limitTrailingZeros: number = 4,
  roundType: 'ceil' | 'floor' = 'floor',
): {
  integer: number
  decimal?: string
  trailingZeros?: number
  suffix?: string
  isNegative: boolean
} {
  const suffixes = ['', 'K', 'M', 'B', 'T']

  if (value === 0 || !isFinite(value)) {
    return { integer: 0, isNegative: false }
  }

  const isNegative = value < 0
  const absVal = Math.abs(value)
  const sign = isNegative ? -1 : 1

  function getMeaningfulDigits(raw: string, maxDigits: number): string {
    let collected = ''
    let index = 0
    let nonZeroCount = 0

    while (index < raw.length && nonZeroCount < maxDigits) {
      const ch = raw[index]
      collected += ch

      if (ch !== '0') {
        nonZeroCount++
      }

      index++
    }

    if (roundType === 'ceil' && index < raw.length) {
      const nextDigit = parseInt(raw[index], 10)

      if (nextDigit >= 5) {
        // Increment the last digit
        const chars = collected.split('')
        let i = chars.length - 1

        // Find the last non-zero digit to increment
        while (i >= 0) {
          if (chars[i] !== '9') {
            chars[i] = (parseInt(chars[i], 10) + 1).toString()
            break
          } else {
            // handle carry if digit is 9
            chars[i] = '0'
            i--
          }
        }

        // If we carried past the first digit
        if (i < 0) {
          chars.unshift('1')
        }

        collected = chars.join('')
      }
    }

    return collected.replace(/0+$/, '').slice(0, maxDigits)
  }

  function handleMeaningfulDigits(leading: number, nonZeroPart: string, decimal: string): string {
    if (leading < 1) {
      return getMeaningfulDigits(decimal, maxMeaningfulDigits)
    }

    if (leading >= 1 && leading <= limitTrailingZeros - 1) {
      const zeros = '0'.repeat(leading)
      return `${zeros}${getMeaningfulDigits(nonZeroPart, leading === 3 ? 3 : maxMeaningfulDigits)}`
    }

    return getMeaningfulDigits(nonZeroPart, maxMeaningfulDigits)
  }
  // CASE 1: ≥ 1000
  if (absVal >= 1000) {
    const tier = Math.min(Math.floor(Math.log10(absVal) / 3), suffixes.length - 1)
    const scale = Math.pow(10, tier * 3)
    const scaled = absVal / scale
    const intPart = Math.floor(scaled)
    const decimalRaw = (scaled - intPart).toFixed(10).split('.')[1] ?? ''
    const meaningful = getMeaningfulDigits(decimalRaw, 2)

    return {
      integer: sign * intPart,
      ...(meaningful && meaningful !== '00' ? { decimal: meaningful } : {}),
      suffix: suffixes[tier],
      isNegative,
    }
  }

  // CASE 2: 100 ≤ value < 1000
  if (absVal >= 100) {
    const intPart = Math.floor(absVal)
    const decimalRaw = (absVal - intPart).toFixed(10).split('.')[1] ?? ''
    const meaningful = getMeaningfulDigits(decimalRaw, 2)

    return {
      integer: sign * intPart,
      ...(meaningful && meaningful !== '00' ? { decimal: meaningful } : {}),
      isNegative,
    }
  }

  // CASE 3: 1 ≤ value < 100
  if (absVal >= 1) {
    const intPart = Math.floor(absVal)
    const decimalRaw = (absVal - intPart).toFixed(10).split('.')[1] ?? ''
    const meaningful = getMeaningfulDigits(decimalRaw, maxMeaningfulDigits)

    return {
      integer: sign * intPart,
      ...(meaningful && meaningful !== '00' ? { decimal: meaningful } : {}),
      isNegative,
    }
  }

  // CASE 4: 0 < value < 1
  const rawFixed = absVal.toFixed(20).replace(/0+$/, '')
  const [_, decimals = ''] = rawFixed.split('.')
  const match = decimals.match(/^(0+)/)
  const leadingZeros = match ? match[0].length : 0
  const nonZeroPart = decimals.slice(leadingZeros)
  const meaningful = handleMeaningfulDigits(leadingZeros, nonZeroPart, decimals)

  return {
    integer: 0,
    ...(leadingZeros >= limitTrailingZeros ? { trailingZeros: leadingZeros } : {}),
    ...(meaningful && meaningful !== '0000' ? { decimal: meaningful } : {}),
    isNegative,
  }
}

export const getAppVersion = () => {
  return 'v' + (import.meta.env.VITE_APP_VERSION || '1.0.0')
}

export const handleStringPercentage = (value: string) => {
  if (value !== '--' && value !== '0') {
    return `${value}%`
  }
  return value
}
export const handleStringValue = (value: string, isNegative: boolean = false, unit: CurrencyUnit = 'USD') => {
  if (value !== '--' && value !== '0') {
    if (unit !== 'USD') return `${isNegative ? '-' : ''}${value} ${unit}`
    return `${isNegative ? '-' : ''}$${value}`
  }
  return value
}
export const handleStringAmount = (value: string) => {
  if (value !== '--' && value !== '0') {
    return `${value}`
  }
  return value
}

/**
 * 格式化货币显示，确保负号在货币符号之前，超过千位时添加千分符
 * @param value - 数值
 * @param currency - 货币符号，默认为 '$'
 * @returns 格式化后的货币字符串
 *
 * @example
 * formatCurrency(100) => "$100"
 * formatCurrency(1000) => "$1,000"
 * formatCurrency(1000.5) => "$1,000.5"
 * formatCurrency(-1234.56) => "-$1,234.56"
 * formatCurrency(100.00) => "$100"
 * formatCurrency(-100.25) => "-$100.25"
 * formatCurrency(0) => "$0.0"
 * formatCurrency(null) => "$0.0"
 * formatCurrency(undefined) => "$0.0"
 */
export const formatCurrency = (value: number | string | null | undefined, currency: string = '$'): string => {
  // 处理空值或无效值
  if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
    return `${currency}0.0`
  }

  const numValue = Number(value)
  const isNegative = numValue < 0
  const absValue = Math.abs(numValue)
  const formattedNumber = absValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 20, // 保持原有精度
    useGrouping: true, // 启用千分符
  })

  // 如果是负数，负号在货币符号之前
  return isNegative ? `-${currency}${formattedNumber}` : `${currency}${formattedNumber}`
}

/**
 * 格式化价格数字，如果是BTC则取整，其他代币保留原样
 * @param value 价格字符串或数字
 * @param symbol 代币符号
 * @returns 格式化后的字符串
 */
export function formatPriceBySymbol(value: string | number, symbol: string): string {
  // 转换为字符串处理
  const strValue = typeof value === 'number' ? value.toString() : value
  // 如果是BTC，则取整
  if (symbol.toUpperCase() === 'BTC') {
    const parts = strValue.split('.')
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') // 添加千位分隔符
  }
  // 非BTC代币，保留原格式
  return strValue
}

/**
 * 在 formatPriceBySymbol 基础上增加千分位分隔，且保留正负号。
 * 可选地通过 maxDecimals 截断小数位（不四舍五入）。
 */
export function formatPriceBySymbolWithCommas(value: string | number, symbol: string, maxDecimals?: number): string {
  const raw = typeof value === 'number' ? value.toString() : value
  if (raw === undefined || raw === null) return ''
  if (raw === '--') return '--'

  const sign = raw.startsWith('+') || raw.startsWith('-') ? raw[0] : ''
  const body = sign ? raw.slice(1) : raw

  const base = formatPriceBySymbol(body, symbol)
  // BTC 的 formatPriceBySymbol 已经对整数部分加了逗号，这里避免再次处理
  if (symbol.toUpperCase() === 'BTC') {
    return sign ? `${sign}${base}` : base
  }
  const withCommas = formatNumberWithCommas(base, maxDecimals)
  return sign ? `${sign}${withCommas}` : withCommas
}

export const formatValueInput = (value: string) => {
  let valueFormat = value.replace(/[^0-9.]/g, '')
  if (valueFormat.includes('.')) {
    const parts = valueFormat.split('.')
    valueFormat = parts[0] + '.' + parts[1]
  }
  return valueFormat
}

type UrlParamResult = {
  exists: boolean
  value: string | null
}

export const getUrlParam = (key: string): UrlParamResult => {
  const url = new URL(window.location.href)
  const value = url.searchParams.get(key)
  const exists = url.searchParams.has(key)

  return {
    exists,
    value,
  }
}

export const removeUrlParam = (key: string) => {
  const url = new URL(window.location.href)
  url.searchParams.delete(key)
  window.history.pushState({}, '', url.toString())
}

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export function replaceErrorCode(message: string, t: TFunction) {
  const errorCodePattern = /\{\{([A-Za-z0-9_]+)\}\}/g

  if (!errorCodePattern.test(message)) {
    return message
  }

  return message.replace(errorCodePattern, (_, errorCode) => {
    const translationKey = `orderForm.status.${errorCode}`
    return t(translationKey)
  })
}

export const escapeOkxString = (string: string) => {
  const escapedStringList = [
    ['{', '\{'],
    ['}', '\}'],
    ['\n', '\\n'],
    ['"', '\\"'],
  ]

  return escapedStringList.reduce((acc: any, [original, replacement]) => {
    return acc?.replaceAll(original, replacement)
  }, string)
}

export function getErrorMessage(
  errorMessages: IErrorMessagesState,
  errorCode: string,
  languageCode: LanguageCode = 'zh',
): string {
  const error = errorMessages?.getErrorMessages?.[errorCode]

  if (!error) {
    return ''
  }

  // Check if it is MultiLanguageMessage
  if ('en' in error && 'vi' in error && 'zh' in error) {
    const multiLangError = error as MultiLanguageMessage
    return multiLangError[languageCode] || multiLangError.vi || multiLangError.en
  }

  return ''
}

export function mergeFundingRateToSymbolList(fundingData: FundingRateList, symbolList: any[]) {
  const fundingDataMap = new Map<string, ExchangeEntry[]>()

  fundingData.forEach(([symbol, exchanges]) => {
    fundingDataMap.set(symbol, exchanges)
  })

  const updatedSymbolList = symbolList.map((symbolData) => {
    const exchanges = fundingDataMap.get(symbolData.symbol)

    if (!exchanges) {
      return {
        ...symbolData,
        fundingRate: null,
      }
    }
    const hlPerpData = exchanges.find(([exchangeName]) => exchangeName === 'HlPerp')

    const fundingRate = hlPerpData?.[1]?.fundingRate ? parseFloat(hlPerpData[1].fundingRate) : null

    return {
      ...symbolData,
      fundingRate,
    }
  })

  return updatedSymbolList
}

export const formatDate = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  let result: string
  if (digits.length <= 4) result = digits
  else if (digits.length <= 6) result = digits.slice(0, 4) + '/' + digits.slice(4)
  else result = digits.slice(0, 4) + '/' + digits.slice(4, 6) + '/' + digits.slice(6, 8)
  return result
}

export const formatTime = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  let result: string
  if (digits.length <= 2) result = digits
  else result = digits.slice(0, 2) + ':' + digits.slice(2, 4)
  return result
}

export function handleOnChangeNumber({ ableMinus = false, e }: { e: string; ableMinus?: boolean }) {
  let value = e.replace(ableMinus ? /[^\-0-9.]/g : /[^0-9.]/g, '')
  if (value.includes('.')) {
    const parts = value.split('.')
    value = parts[0] + '.' + parts[1]
  }
  return value
}

export const trimTrailingZeros = (str: string): string => {
  const trimmed = str.replace(/0+$/, '')
  return trimmed === '' ? '0' : trimmed
}

export const setUrlParam = (key: string, value: string) => {
  const url = new URL(window.location.href)
  url.searchParams.set(key, value)
  window.history.pushState({}, '', url.toString())
}

export const getShortenedUrl = (url: string, maxLength: number = 30, inviteCode?: string) => {
  if (url.length <= maxLength) return url
  const domain = new URL(url).origin
  const path = inviteCode ? `/@${inviteCode}` : ''
  if ((domain + path).length <= maxLength) return domain + path
  return `${domain.slice(0, 15)}...${path}`
}

export const isEmail = (str: string): boolean => {
  if (!str) return false

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(str)
}

/**
 * Format price according to specific display rules
 * 1) For numbers with >=4 zeros after decimal: use subscript notation (e.g., 0.0₄5566)
 * 1.1) For values < 1: Keep 4 significant digits, show actual zeros if < 4
 * 1.2) For values >= 1: Keep 4 decimal places
 * 1.3) For integer values: Display as whole number (e.g., 100.0000 → 100)
 * 2) For very long prices: Display all if possible, use smaller font (min 8PT) if needed
 */
export const formatPriceDisplay = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
    return '-'
  }

  const numValue = Number(value)

  if (numValue === 0 || !isFinite(numValue)) {
    return '0'
  }

  const absValue = Math.abs(numValue)
  const isNegative = numValue < 0
  const sign = isNegative ? '-' : ''

  // For values >= 1
  if (absValue >= 1) {
    // Check if it's an integer (all decimal places are 0)
    if (Number.isInteger(absValue)) {
      return `${sign}${absValue.toLocaleString('en-US')}`
    }

    // Keep 4 decimal places, remove trailing zeros
    const fixed = absValue.toFixed(4)
    const trimmed = fixed.replace(/\.?0+$/, '')

    // Add thousand separators to integer part
    const [intPart, decPart] = trimmed.split('.')
    const formattedInt = parseInt(intPart).toLocaleString('en-US')

    return decPart ? `${sign}${formattedInt}.${decPart}` : `${sign}${formattedInt}`
  }

  // For values < 1
  const str = absValue.toFixed(20)
  const match = str.match(/^0\.0*/)

  if (!match) {
    return `${sign}${absValue}`
  }

  // Count zeros after "0."
  const zeroCount = match[0].length - 2

  // If >= 4 zeros, use subscript notation
  if (zeroCount >= 4) {
    const subscriptNum = zeroCountToSubNumber(zeroCount)

    // Get significant digits after zeros
    const afterZeros = str.slice(match[0].length)
    const significantDigits = afterZeros.slice(0, 4).replace(/0+$/, '')

    return `${sign}0.0${subscriptNum}${significantDigits}`
  }

  // If < 4 zeros, show actual number of zeros and keep 4 significant digits
  const afterDecimal = str.slice(2) // Remove "0."
  let significantCount = 0
  let result = ''

  for (const char of afterDecimal) {
    result += char
    if (char !== '0') {
      significantCount++
    }
    if (significantCount >= 4) {
      break
    }
  }

  // Remove trailing zeros
  result = result.replace(/0+$/, '')

  return `${sign}0.${result}`
}

// Map period to interval for API call
export const getIntervalFromPeriod = (period: string): string => {
  switch (period) {
    case '1D':
      return '1d'
    case '1W':
      return '1w'
    case '1M':
      return '1m'
    case 'ALL':
      return '1m'
    default:
      return '1m'
  }
}

/**
 * Round price to nearest tick size.
 * For example:
 *  - if tickSize is 0.01, then 1.234 would round to 1.23, and 1.235 would round to 1.24.
 *  - if tickSize is 0.001, then 1.2345 would round to 1.234, and 1.2346 would round to 1.235.
 * @param price
 * @param tickSize
 */
export const roundByTickSize = (price: number, tickSize: number | string | undefined): number => {
  const tick = tickSize ? +tickSize : 0.01
  const roundedPrice = Math.round(price / tick) * tick
  return roundedPrice * 100 // price in cents
}

export function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}
