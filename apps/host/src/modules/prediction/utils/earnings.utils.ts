import { EventModel } from '@/modules/prediction/models/EventModel'
import { StockItem } from '@/modules/prediction/types/earnings.types'
import { PROBABILITY_THRESHOLDS } from '@/modules/prediction/constants/earnings.constants'

export const formatEPS = (eps: number): string => {
  const sign = eps >= 0 ? '' : '-'
  const abs = Math.abs(eps)
  return `${sign}$${abs.toFixed(2)} EPS`
}

export const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`
}

export const getGradientForLetter = (letter: string): string => {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-yellow-500 to-orange-500',
  ]
  const index = letter.charCodeAt(0) % gradients.length
  return gradients[index]
}

export const extractStockSymbol = (title: string): string => {
  const parenthesesMatch = title.match(/\(([^)]+)\)/)
  if (parenthesesMatch) {
    return parenthesesMatch[1].trim()
  }
  const firstWord = title.trim().split(/\s+/)[0]
  return firstWord.substring(0, 4).toUpperCase()
}

const NUM = '[0-9]+(?:\\.[0-9]+)?'

export const parseEPS = (event: EventModel): number => {
  const description = event.description || ''

  // Pattern 1: "... -$0.12 EPS", " $-2.28 EPS", " $1.23 EPS" (number immediately before "EPS")
  const beforeEps = description.match(new RegExp(`(-\\s*)?\\$?\\s*([+-]?${NUM})\\s*EPS`, 'i'))
  if (beforeEps) {
    const value = parseFloat(beforeEps[2])
    if (!Number.isNaN(value)) {
      return beforeEps[1] ? -Math.abs(value) : value
    }
  }

  // Pattern 2: "GAAP EPS ... is $-2.28" or "EPS ... $-2.28" (EPS then text then $number)
  const epsThenDollar = description.match(
    new RegExp(`(?:GAAP\\s+)?EPS\\s+.*?\\$\\s*([+-]?${NUM})`, 'i')
  )
  if (epsThenDollar) {
    const value = parseFloat(epsThenDollar[1])
    if (!Number.isNaN(value)) return value
  }

  // Pattern 3: "EPS: -0.12" or "EPS -0.12" (EPS immediately followed by number)
  const afterEps = description.match(new RegExp(`EPS\\s*:?\\s*\\$?\\s*([+-]?${NUM})`, 'i'))
  if (afterEps) {
    const value = parseFloat(afterEps[1])
    if (!Number.isNaN(value)) return value
  }

  const sourceForStrike = event.ticker || event.slug || ''
  const strikeMatch = sourceForStrike.match(/(\d+)pt(\d+)/i)
  if (strikeMatch) {
    const dollars = strikeMatch[1]
    const cents = strikeMatch[2]
    const value = parseFloat(`${dollars}.${cents}`)
    if (!Number.isNaN(value)) return value
  }

  return 0
}

export const getProbability = (event: EventModel): number => {
  if (event.markets && event.markets.length > 0) {
    const market = event.markets[0]
    return market.outcomePrices?.[0] ? parseFloat(market.outcomePrices[0]) * 100 : 50
  }
  return Math.random() * 100
}

export const getStatusText = (probability: number): string => {
  // if (probability > PROBABILITY_THRESHOLDS.BEATS) return 'beats'
  // if (probability < PROBABILITY_THRESHOLDS.MISSES) return 'misses'
  // return 'in-line'
  return 'beats'
}

export const isPreMarket = (event: EventModel): boolean => {
  //if event from 11:00 to 14:30 UTC, it's pre-market, otherwise post-market
  if (!event.endDate) return false
  const date = new Date(event.endDate)

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date string')
  }

  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()

  const totalMinutes = hours * 60 + minutes

  const start = 11 * 60
  const end = 14 * 60 + 30

  return totalMinutes >= start && totalMinutes <= end
}

export const transformEventToStockItem = (event: EventModel): StockItem => {
  const title = event.title || ''
  const symbol = extractStockSymbol(title)
  const eps = parseEPS(event)
  const probability = getProbability(event)

  return {
    id: event.id,
    slug: event.slug || event.id,
    symbol,
    eps,
    probability,
    statusText: getStatusText(probability),
    logoUrl: event.icon || event.image || undefined,
  }
}

const getNextMondayOffset = (dayOfWeek: number): number => {
  const SATURDAY = 6
  const SUNDAY = 0
  const MONDAY_DAY = 1

  if (dayOfWeek === SUNDAY) return 1
  if (dayOfWeek === SATURDAY) return 2
  return MONDAY_DAY - dayOfWeek
}

export const getWeekDate = (offset: number): Date => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() + getNextMondayOffset(dayOfWeek))

  const targetWeekStart = new Date(currentWeekStart)
  targetWeekStart.setDate(currentWeekStart.getDate() + offset * 7)

  return targetWeekStart
}
