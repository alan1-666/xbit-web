import { MemeTokenWithFormatted, TokenTrending } from '@/types/token.ts'
import { formatPriceChange } from '@/lib/number.ts'
import { formatMarketValue, formatNumber, formatVolume } from '@/lib/format.ts'
import { TokenStatisticDto, TokenTimeRange } from '@/@generated/gql/graphql-core.ts'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { TimeRange } from '@/@generated/gql/graphql-future.ts'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator.ts'
import { ChainType, MemeDto } from '@/@generated/gql/graphql-meme2.ts'

function getNumOfTransactions(token: TokenTrending | TokenStatisticDto | MemeDto, time: string) {
  switch (time) {
    case '1m':
      return token.txs1m ?? token.buyTxs1m + token.sellTxs1m
    case '5m':
      return token.txs5m ?? token.buyTxs5m + token.sellTxs5m
    case '1h':
      return token.txs1h ?? token.buyTxs1h + token.sellTxs1h
    case '6h':
      return token.txs6h ?? token.buyTxs6h + token.sellTxs6h
    case '24h':
      return token.txs24h ?? token.buyTxs24h + token.sellTxs24h
    default:
      return '--'
  }
}

function getVolumes(token: TokenTrending | TokenStatisticDto | MemeDto | MemeTokenWithFormatted, time: string) {
  switch (time) {
    case '1m':
      return formatVolume(+token.volume1m)
    case '5m':
      return formatVolume(+token.volume5m)
    case '1h':
      return formatVolume(+token.volume1h)
    case '6h':
      return formatVolume(+token.volume6h)
    case '24h':
      return formatVolume(+token.volume24h)
    default:
      return '--'
  }
}

function getPriceChange(token: TokenTrending, time: string) {
  switch (time) {
    case '1m':
      return formatPriceChange(+token.price1mChange)
    case '5m':
      return formatPriceChange(+token.price5mChange)
    case '1h':
      return formatPriceChange(+token.price1hChange)
    case '6h':
      return formatPriceChange(+token.price6hChange)
    case '24h':
      return formatPriceChange(+token.price24hChange)
    default:
      return '--'
  }
}

function get5mMarketCapChange(token: TokenTrending) {
  const priceChange = token.marketCap5mChangeUsd ? +token.marketCap5mChangeUsd : 0
  if (priceChange === 0) return '0'
  return '+' + '$' + formatMarketValue(priceChange)
}

function normalizeChartData(
  nums: number[],
  options?: {
    length: number
    filledValue?: 'last' | number
  },
) {
  const minVal = Math.min(...nums)
  const maxVal = Math.max(...nums)
  if (minVal === maxVal) return nums.map(() => 50)
  const arr = nums.map((num) => {
    return ((num - minVal) / (maxVal - minVal)) * 50 + 50
  })
  const { length = nums.length, filledValue } = options || {}
  if (arr.length < length) {
    const diff = length - arr.length
    const filledArr: number[] = new Array(diff).fill(filledValue === 'last' ? arr[arr.length - 1] : filledValue)
    return [...arr, ...filledArr]
  }
  if (arr.length > length) {
    return arr.slice(0, length)
  }
  return arr
}

function normalizeChartData2(nums: number[], defaultValue?: number) {
  const minVal = Math.min(...nums)
  const maxVal = Math.max(...nums)
  if (minVal === maxVal) return nums.map(() => defaultValue ?? 0)
  return nums.map((num) => {
    return num > 0 ? ((num - minVal) / (maxVal - minVal)) * 80 + 20 : 0
  })
}

function getTokenTrend(token: TokenTrending, time: string) {
  type PriceChange = 'price1mChange' | 'price5mChange' | 'price1hChange' | 'price6hChange' | 'price24hChange'
  const key = `price${time}Change` as PriceChange
  const priceChange = +token[key]
  if (priceChange >= -0.01) return 'up'
  return 'down'
}

function formatWalletName(wallet: string, numbers = 6) {
  if (wallet.length <= numbers) return wallet
  return `${wallet.slice(0, numbers / 2)}...${wallet.slice(-numbers / 2)}`
}

function formatWalletNameWithEllipsis(wallet: string, numbers: number = 12, ellipsis: string = '...') {
  if (wallet.length <= numbers - ellipsis.length) return wallet
  return `${wallet.slice(0, numbers - ellipsis.length)}${ellipsis}`
}

function formatWalletNameCustom(wallet: string, sliceFirst: number = 5, sliceLast: number = 5) {
  if (wallet.length <= sliceFirst + sliceLast) return wallet
  return `${wallet.slice(0, sliceFirst)}...${wallet.slice(-sliceLast)}`
}

export const tokenTimeRangeMapper = (timeframe: TimeframeOption): TokenTimeRange => {
  switch (timeframe) {
    case '1m':
      return TokenTimeRange.M1
    case '5m':
      return TokenTimeRange.M5
    case '1h':
      return TokenTimeRange.H1
    case '6h':
      return TokenTimeRange.H6
    case '24h':
      return TokenTimeRange.H24
    default:
      return TokenTimeRange.H24
  }
}

const timeframeMapper = (timeframe: TimeframeOption): TimeRange => {
  switch (timeframe) {
    case '1m':
      return TimeRange.M1
    case '5m':
      return TimeRange.M5
    case '1h':
      return TimeRange.H1
    case '6h':
      return TimeRange.H6
    case '24h':
      return TimeRange.H24
    default:
      return TimeRange.H24
  }
}

export const formatNumberOfTransactions = (token: MemeDto, timeframe: string) => {
  const numOfTransactions = listCoinHelper.getNumOfTransactions(token, timeframe)
  if (typeof numOfTransactions !== 'number') return numOfTransactions
  if (numOfTransactions > 1e15) return '>9999T'
  return formatNumber(numOfTransactions)
}

export const getChainType = (chain: TYPE_CHAIN) => {
  if (chain === TYPE_CHAIN.ETH || chain === TYPE_CHAIN.ARB) {
    return ChainType.Evm
  }
  if (chain === TYPE_CHAIN.BSC) {
    return ChainType.Bsc
  }
   if (chain === TYPE_CHAIN.MON) {
    return ChainType.Mon
  }
  return ChainType.Solana
}

const getTimeRangeFilter = (timeframe: TimeframeOption): TokenTimeRange => {
  switch (timeframe) {
    case '1m':
      return TokenTimeRange.M1
    case '5m':
      return TokenTimeRange.M5
    case '1h':
      return TokenTimeRange.H1
    case '6h':
      return TokenTimeRange.H6
    case '24h':
      return TokenTimeRange.H24
    default:
      return TokenTimeRange.H24
  }
}

/**
 * Generate a unique SVG NFT image based on a token address.
 * @param {string} address - The NFT token or wallet address.
 * @returns {string} SVG string
 */
/**
 * Generate an xbit avatar SVG from an address.
 * - Uses the same structure as the avatars in your HTML example.
 * - Colors, gradients, and face expressions are determined by the address hash.
 */
// function normalizeAddress(raw: string): string {
//   if (!raw) return ''
//   const trimmed = raw.trim()
//   const withoutNamespace = trimmed.includes(':') ? (trimmed.split(':').pop() as string) : trimmed
//   // Remove common separators/spaces
//   const cleaned = withoutNamespace.replace(/[\s_-]/g, '')
//   // If looks like EVM, drop 0x and lowercase to match checksum/non-checksum equally
//   const evmLike = /^0x[0-9a-fA-F]{6,}$/
//   if (evmLike.test(cleaned)) {
//     return cleaned.slice(2).toLowerCase()
//   }
//   return cleaned
// }
//
// function hashAddress(address: string): number {
//   const input = normalizeAddress(address)
//   // Simple FNV-like hash
//   let hash = 2166136261
//   for (let i = 0; i < input.length; i++) {
//     hash ^= input.charCodeAt(i)
//     hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
//   }
//   return hash >>> 0
// }
//
// function hslToHex(h: number, s: number, l: number): string {
//   s /= 100
//   l /= 100
//   const k = (n: number) => (n + h / 30) % 12
//   const a = s * Math.min(l, 1 - l)
//   const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
//   const toHex = (x: number) =>
//     Math.round(255 * x)
//       .toString(16)
//       .padStart(2, '0')
//   return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
// }

// Contrast helpers (WCAG)
// function hexToRgb(hex: string): { r: number; g: number; b: number } {
//   const clean = hex.replace('#', '')
//   const r = parseInt(clean.slice(0, 2), 16)
//   const g = parseInt(clean.slice(2, 4), 16)
//   const b = parseInt(clean.slice(4, 6), 16)
//   return { r, g, b }
// }
//
// function srgbToLinear(c: number): number {
//   const cs = c / 255
//   return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
// }

// function relativeLuminance(hex: string): number {
//   const { r, g, b } = hexToRgb(hex)
//   const R = srgbToLinear(r)
//   const G = srgbToLinear(g)
//   const B = srgbToLinear(b)
//   return 0.2126 * R + 0.7152 * G + 0.0722 * B
// }

// function contrastRatio(hex1: string, hex2: string): number {
//   const L1 = relativeLuminance(hex1)
//   const L2 = relativeLuminance(hex2)
//   const lighter = Math.max(L1, L2)
//   const darker = Math.min(L1, L2)
//   return (lighter + 0.05) / (darker + 0.05)
// }

// --- Per-address gradients are generated dynamically below ---

// Expressions: mouth, eyes, extras per style
// const faces = [
//   {
//     mouth: `<path d="M13 20 Q16 23 19 20" stroke="#222" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
//     eyes: `<ellipse cx="13" cy="13" rx="1.1" ry="1.4" fill="#222"/><ellipse cx="19" cy="13" rx="1.1" ry="1.4" fill="#222"/>`,
//     extra: ``,
//   },
//   {
//     mouth: `<path d="M11 22 Q16 17 21 22" stroke="#222" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
//     eyes: `<ellipse cx="13" cy="13" rx="1.1" ry="1.4" fill="#222"/><ellipse cx="19" cy="13" rx="1.1" ry="1.4" fill="#222"/>`,
//     extra: ``,
//   },
//   {
//     mouth: `<path d="M11 22 Q16 17 21 22" stroke="#222" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
//     eyes: `<rect x="11" y="12" width="2" height="1" rx="0.5" fill="#222" transform="rotate(-20 12 12.5)"/>
//            <rect x="17" y="12" width="2" height="1" rx="0.5" fill="#222" transform="rotate(20 18 12.5)"/>`,
//     extra: ``,
//   },
//   {
//     mouth: `<ellipse cx="16" cy="21" rx="1.2" ry="1.6" fill="#fff"/><ellipse cx="16" cy="21" rx="0.7" ry="0.9" fill="#222"/>`,
//     eyes: `<ellipse cx="13" cy="16" rx="1.7" ry="2" fill="#fff"/><ellipse cx="19" cy="16" rx="1.7" ry="2" fill="#fff"/><ellipse cx="13" cy="16" rx="0.7" ry="0.9" fill="#222"/><ellipse cx="19" cy="16" rx="0.7" ry="0.9" fill="#222"/>`,
//     extra: ``,
//   },
//   {
//     mouth: `<path d="M13 20 Q16 23 19 20" stroke="#222" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
//     eyes: `<rect x="10" y="14" width="12" height="4" rx="2" fill="#000"/>`,
//     extra: ``,
//   },
// ]

export async function getAvatarFromAddress(address: string, isRounded: boolean = false): Promise<string> {
  return await generateAvatar(address, isRounded)
}

// Temporary disabled custom implementation in favor of xbit avatar generator
// export function getAvatarFromAddress(address: string): string {
//   const hash = hashAddress(address);
//
//   // Derive per-address gradient colors to maximize uniqueness
//   const hue1 = hash % 360
//   const hue2 = ((hash >> 8) % 360)
//   const hue3 = ((hash >> 16) % 360)
//   const bgColorStart = hslToHex(hue1, 70, 60)
//   const bgColorEnd = hslToHex(hue2, 80, 45)
//
//   // Initial logo colors from hues
//   let logoColorStart = hslToHex(hue2, 65, 65)
//   let logoColorEnd = hslToHex(hue3, 85, 40)
//
//   // Ensure strong contrast between background and logo
//   const minContrast = 3.5 // target minimum contrast ratio
//   const bgMidL = (60 + 45) / 2 // approximate perceived L from bg stops
//   const bgHueAvg = (hue1 + hue2) / 2
//
//   const ensureContrast = () => {
//     const c1 = Math.min(contrastRatio(bgColorStart, logoColorStart), contrastRatio(bgColorEnd, logoColorStart))
//     const c2 = Math.min(contrastRatio(bgColorStart, logoColorEnd), contrastRatio(bgColorEnd, logoColorEnd))
//     return Math.min(c1, c2)
//   }
//
//   let currentContrast = ensureContrast()
//
//   // If contrast is weak, rotate logo hue to complementary and re-choose lightness
//   if (currentContrast < minContrast) {
//     const compHue = (bgHueAvg + 180) % 360
//     const isBgLight = bgMidL >= 52.5
//     logoColorStart = hslToHex(compHue, 70, isBgLight ? 30 : 75)
//     logoColorEnd = hslToHex((compHue + 20) % 360, 80, isBgLight ? 35 : 85)
//     currentContrast = ensureContrast()
//   }
//
//   // If still low, fall back to near-black/white depending on background brightness
//   if (currentContrast < minContrast) {
//     const bgLum = Math.max(relativeLuminance(bgColorStart), relativeLuminance(bgColorEnd))
//     const useDark = bgLum > 0.5
//     logoColorStart = useDark ? '#111111' : '#ffffff'
//     logoColorEnd = useDark ? '#000000' : '#eeeeee'
//   }
//
//   const bg = {
//     id: 'auto-bg',
//     stops: [
//       { offset: '0%', color: bgColorStart },
//       { offset: '100%', color: bgColorEnd }
//     ]
//   }
//   const logo = {
//     id: 'auto-logo',
//     stops: [
//       { offset: '0%', color: logoColorStart },
//       { offset: '100%', color: logoColorEnd }
//     ]
//   }
//
//   const faceIdx = faces.length > 0 ? (hash >> 20) % faces.length : 0;
//   const face = faces[faceIdx] || faces[0];
//
//   // Compose SVG
//   return `
// <svg width="128" height="128" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
//   <defs>
//     <radialGradient id="bg" cx="50%" cy="50%" r="80%">
//       ${bg.stops.map(s => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join('')}
//     </radialGradient>
//     <linearGradient id="logo" x1="0" y1="0" x2="1" y2="1">
//       ${logo.stops.map(s => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join('')}
//     </linearGradient>
//   </defs>
//   <rect width="32" height="32" rx="6" fill="url(#bg)"/>
//   <g transform="translate(2,2)">
//     <svg width="28" height="28" viewBox="0 0 28 28">
//       <path fill="url(#logo)" d="M27.6599 4.61799C27.4023 3.67884 26.9867 2.66489 26.2637 2C26.2387 2 26.2637 2.04987 26.2637 2.06649C26.3551 2.68151 26.4299 3.13862 26.4382 3.77026C26.4798 6.8038 25.2746 9.06441 22.2744 9.97032C16.8971 11.591 11.1791 11.6076 5.7935 9.97863C2.40258 8.96468 1.28889 6.23034 1.60471 2.87266L1.746 2.01662C1.43849 2.24102 1.18916 2.61502 1.00632 2.93915C0.0837887 4.56812 -0.173855 6.93678 0.108722 8.7569C0.956451 14.1674 6.101 15.9294 10.9297 16.3034C11.1292 16.32 11.337 16.3698 11.5448 16.3449C11.6029 16.187 11.6112 16.0125 11.6611 15.8379C12.0517 14.5248 13.4646 13.7934 14.7778 14.1923C15.7169 14.4749 16.44 15.3642 16.5148 16.3449C16.7059 16.3698 16.8805 16.32 17.0633 16.3034C20.288 16.0374 24.2025 15.1149 26.2969 12.4553C28.009 10.2861 28.3664 7.24429 27.6516 4.60968L27.6599 4.61799Z"/>
//       <path fill="url(#logo)" d="M23.022 16.5278H18.1684C18.1102 16.6276 18.1517 16.7772 18.1351 16.8935C17.8775 19.8689 14.5281 21.5976 11.9517 20.06C10.7383 19.337 10.0651 18.1568 9.94039 16.7522C9.94039 16.7024 9.95701 16.5362 9.90715 16.5195H5.05348C5.00362 16.5943 5.02024 16.7522 5.02024 16.852C5.19477 22.0963 9.8739 26.0856 15.0849 25.4955C19.3735 25.0134 22.8558 21.3649 23.0553 17.0348C23.0553 16.9268 23.0719 16.6691 23.0553 16.5777C23.0553 16.5528 23.047 16.5445 23.022 16.5278Z"/>
//     </svg>
//   </g>
//   ${face.mouth}
//   ${face.eyes}
//   ${face.extra}
// </svg>
// `.trim();
// }

export const listCoinHelper = {
  getNumOfTransactions,
  getVolumes,
  getPriceChange,
  normalizeChartData,
  normalizeChartData2,
  get5mMarketCapChange,
  getTokenTrend,
  formatWalletName,
  formatWalletNameCustom,
  formatWalletNameWithEllipsis,
  getChainType,
  getTimeRangeFilter,
  timeframeMapper,
}
