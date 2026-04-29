export interface StockItem {
  id: string
  slug: string
  symbol: string
  eps: number
  probability: number
  statusText: string
  logoUrl?: string
}

export interface DayData {
  dayKey: string
  dateLabel: string
  dayNumber: number
  fullDate: Date
  isToday?: boolean
  isPast?: boolean
  preMarket: StockItem[]
  postMarket: StockItem[]
}

export interface WeekData {
  weekLabel: string
  days: DayData[]
  weekOffset: number
}
