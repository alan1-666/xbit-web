export type Trader = {
  user_address: string
  roi: number // e.g. 45.68
  net_pnl: number // e.g. 12786.12
  avg_win_rate: number // e.g. 87.6
  max_drawdown: number // e.g. 55.78
  trading_days: number
  total_trades: number
  unique_coins_count: number
  latest_activity?: string | null
  latest_activity_time?: string | null
  kol_labels?: string[]
  kol_labels_description?: string | null
}

export type SmartMoneyResponse = {
  success: boolean
  message?: string
  data: Trader[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

export type SmartMoneyQuery = {
  page?: number
  pageSize?: number
  address?: string // 搜索的钱包地址
  range?: string // 时间范围: 1d,7d,30d,90d,180d,365d,all
}

// holdingTime record
export type UserPositionHoldingTimeRecord = {
  id: number
  userAddress: string
  coin: string
  lastFillsId?: number | null
  lastOpenTime?: number | null
  timeSum: number
  totalHoldingTime: number // 秒
  status: 'open' | 'closed'
  updatedAt: string
  createdAt: string
}

type BucketKey = '<1h' | '1-4h' | '4-12h' | '12-24h' | '1-3d' | '3-7d' | '>7d'

export const HOLDING_BUCKETS: Array<{
    key: BucketKey
    label: BucketKey
    min: number
    max: number | null // null = Infinity
    // color: string
  }>  = [
    { key: '<1h',    label: '<1h',    min: 0,              max: 60 * 60 },        // [0, 3600)
    { key: '1-4h',   label: '1-4h',   min: 60 * 60,        max: 4 * 60 * 60 },    // [3600, 14400)
    { key: '4-12h',  label: '4-12h',  min: 4 * 60 * 60,    max: 12 * 60 * 60 },   // [14400, 43200)
    { key: '12-24h', label: '12-24h', min: 12 * 60 * 60,   max: 24 * 60 * 60 },   // [43200, 86400)
    { key: '1-3d',   label: '1-3d',   min: 24 * 60 * 60,   max: 3 * 24 * 60 * 60 }, // [86400, 259200)
    { key: '3-7d',   label: '3-7d',   min: 3 * 24 * 60 * 60, max: 7 * 24 * 60 * 60 }, // [259200, 604800)
    { key: '>7d',    label: '>7d',    min: 7 * 24 * 60 * 60, max: Infinity },
] as const

type LeverageBucketRowKey = '1-5X' | '5-10X' | '10-20X' | '20-50X' | '>50X'

export const getLeverageBuckets = (t: (k: string) => string) =>
  [
    { key: '1-5X', label: '1-5X', from: 1, to: 5, color: '#00D084', risk: t('smartMoney.chart.lowRisk') },
    { key: '5-10X', label: '5-10X', from: 5, to: 10, color: '#667EEA', risk: t('smartMoney.chart.mediumRisk') },
    { key: '10-20X', label: '10-20X', from: 10, to: 20, color: '#FFA500', risk: t('smartMoney.chart.moderatelyHighRisk') },
    { key: '20-50X', label: '20-50X', from: 20, to: 50, color: '#FF6B9D', risk: t('smartMoney.chart.highRisk') },
    { key: '>50X', label: '>50X', from: 50, to: Infinity, color: '#FF4D4D', risk: t('smartMoney.chart.veryHighRisk') },
  ] as const

export type LeverageBucketRow = {
  name: string
  key: string
  color: string
  risk: string
  count: number
}


export const getChartTabMapping = (t: (k: string) => string) =>
  [
    { label: t('smartMoney.addressDetail.profitTrend'), key: 'profitTrend' },
    { label: t('smartMoney.addressDetail.holdingTime'), key: 'holdingTime' },
    { label: t('smartMoney.addressDetail.leverageUsage'), key: 'leverageUsage' },
    { label: t('smartMoney.addressDetail.tradingSession'), key: 'tradingSession' },
  ] as const

export const TAG_COLOR_CLASS: Record<string, string> = {
  gold: 'text-[#F5C16C] bg-[#F5C16C]/10',
  green: 'text-[#12C48B] bg-[#12C48B]/10',
  purple: 'text-[#C8A7FD] bg-[#C8A7FD]/10',
  red: 'text-[#E64C68] bg-[#E64C68]/10',
  blue: 'text-[#4DA3FF] bg-[#4DA3FF]/10',
  gray: 'text-white/70 bg-white/10',
}

export type GuardArgs = {
  loading?: boolean
  error?: any
  hasData: boolean
  children: React.ReactNode
}

export type AIConculation = {
  strategy_cn?: string
  strategy_en?: string
  analyzed_at?: string
  user_address?: string
}

export type SmartMoneyAnalyzeResp = {
  success: boolean
  message?: string
  data: AIConculation
}
