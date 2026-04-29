import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import Decimal from 'decimal.js'
import { APP_PATH, Browser } from './constant'
import { TYPE_CHAIN } from './blockchain'
import { path } from 'lodash/fp'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(str: string) {
  return str.replace(/^./, str[0].toUpperCase())
}

export function _isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const _isMobileSafari = (): boolean => {
  const ua = navigator.userAgent
  return _isMobileDevice() && /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/i.test(ua)
}

export function fixNumber(val: number | string, units: number) {
  let value = '' + parseFloat(val as string)

  let unit = units || 0
  let isInt = value.indexOf('.') == -1
  let intNum = value.split('.')[0]
  let floatNum = !isInt ? value.split('.')[1] : '0'
  let floatArry = floatNum.split('')
  let newFloatNum = '.'
  for (let i = 0; i < unit; i++) {
    if (!floatArry[i]) {
      newFloatNum += '0'
    } else {
      newFloatNum += floatArry[i]
    }
  }
  if (unit > 0) {
    return parseFloat(intNum + newFloatNum).toFixed(unit)
  } else {
    return parseInt(intNum)
  }
}

export function fixBigNumber(numStr: string, decimals: number) {
  const num = parseFloat(numStr)
  const factor = Math.pow(10, decimals)
  return (Math.floor(num * factor) / factor).toFixed(decimals)
}

export function showMathSymbol(value: number | string) {
  const num = typeof value === 'number' ? value : parseFloat(value)
  const isNegative = num < 0
  return `${isNegative ? '-' : '+'}${Math.abs(num).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}`
}

export function showRate(val: number | string, symbol: boolean = true, fix: number = 2) {
  if (Math.abs(val as number) === Infinity || isNaN(val as number)) {
    return '--'
  }
  const valNumber = typeof val === 'number' ? val : parseFloat(val as string)

  if (Math.abs(valNumber) < 0.01) {
    return '≈0%'
  }

  if (parseFloat(val as string) < 0) {
    return '' + fixNumber(val, fix) + '%'
  } else {
    return (symbol ? '+' : '') + fixNumber(val, fix) + '%'
  }
}

export function getPath(pathTemplate: string, params: Record<string, string>): string {
  let result = pathTemplate
  const matches = pathTemplate.match(/:([^/]+)/g) || []

  for (const match of matches) {
    const key = match.slice(1)
    if (!(key in params)) {
      throw new Error(`Missing param: ${key}`)
    }
    result = result.replace(match, params[key])
  }

  return result
}

export function trimTrailingZeros(value: string | number): string {
  const str = String(value)

  if (!str.includes('.')) return str

  return str.replace(/(\.\d*?[1-9])0+$/g, '$1').replace(/\.0+$/, '')
}

export function getDecimalPlaces(value: string | number, trimTrailingZeros = false): number {
  if (typeof value === 'number') {
    const valueStr = value.toString()

    if (valueStr.includes('e') || valueStr.includes('E')) {
      const [base, exponent] = valueStr.split(/[eE]/).map(Number)
      const baseDecimals = base.toString().split('.')[1]?.length || 0
      const decimalPlaces = baseDecimals - exponent
      return Math.max(0, decimalPlaces)
    }

    const decimals = valueStr.split('.')[1] || ''
    return trimTrailingZeros ? decimals.replace(/0+$/, '').length : decimals.length
  }

  if (typeof value === 'string') {
    const parts = value.trim().split('.')
    const decimals = parts[1] || ''
    return trimTrailingZeros ? decimals.replace(/0+$/, '').length : decimals.length
  }

  return 0
}

export const MathFun = {
  add(...args: any[]) {
    if (args.length === 0) return 0
    return args.reduce((res, cur) => new Decimal(res).add(cur)).toNumber()
  },

  sub(...args: any[]) {
    if (args.length === 0) return 0
    return args.reduce((res, cur) => new Decimal(res).sub(cur)).toNumber()
  },

  mul(...args: any[]) {
    if (args.length === 0) return 0
    return args.reduce((res, cur) => new Decimal(res).mul(cur)).toNumber()
  },

  div(...args: any[]) {
    if (args.length === 0) return 0
    return args
      .reduce((res, cur) => {
        const curDecimal = new Decimal(cur)
        if (curDecimal.equals(0)) {
          throw new Error('Division by zero')
        }
        return new Decimal(res).div(curDecimal)
      })
      .toNumber()
  },
}

// Extract the latest wallet path index from an array of HD paths
export const extractLatestWalletPath = (paths: string[]): number => {
  // example hd path "m/44'/60'/0'/0/0"

  return Math.max(
    ...paths.map(p => {
      const parts = p.split('/');

      if (parts.length < 4) {
        return 0;
      }

      return parseInt(parts[3].replace("'", ""), 10);
    }),
    paths.length
  );
}

/**
 * function for check has string in path url
 */

export function isHasStringInPath(txt: string): boolean {
  const pathname = window.location.pathname
  return pathname.includes(txt)
}

export function isPCVersion(): boolean {
  return isHasStringInPath(APP_PATH.PC_VERSION)
}

export const getDefaultTokenByChain = (chain: string): string => {
  switch (chain) {
    case TYPE_CHAIN.SOLANA:
      return '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'
    // case TYPE_CHAIN.ETH:
    //   return '/images/ether.svg'
    // case TYPE_CHAIN.ARB:
    //   return '/images/arbitrum.svg'
    case TYPE_CHAIN.BSC:
      return '0x4444308c39af3edd06e20730186338b9c6e76b6c'
    case TYPE_CHAIN.MON:
      return '0x0a332311633c0625f63cfc51ee33fc49826e0a3c'  
    default:
      return '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'
  }
}
export function hasPercent(str: string) {
  return str.includes('%');
}

export function removePercent(str: string) {
  return str.replace(/%/g, '');
}

export const detectBrowser = (): Browser => {
    const ua = navigator.userAgent.toLowerCase()

    if (ua.includes('edg/')) {
      return Browser.EDGE
    } else if (ua.includes('firefox/')) {
      return Browser.FIREFOX
    } else if (ua.includes('chrome/') && !ua.includes('edg/')) {
      return Browser.CHROME
    } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
      return Browser.SAFARI
    }

    return Browser.UNKNOWN
  }


export  const formatUserId = (str: string) => {
    if (!str || str.length <= 9) return str;
    return `${str.slice(0, 5)}...${str.slice(-4)}`;
  };
export const safeParse = (data: any) => {
  if (Array.isArray(data)) return data
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch (e) {
      console.error('Error parsing data:', data, e)
      return []
    }
  }
  return []
}

export const formatDateHeader = (dateStr?: string | null) => {
    if (!dateStr) return 'Upcoming'
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'long', day: 'numeric' }).format(date)
}
