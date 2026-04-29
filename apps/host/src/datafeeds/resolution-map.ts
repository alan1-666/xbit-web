import { Timeframe } from '@/@generated/gql/graphql-core'

type ResolutionMap = Record<string, Timeframe>

export const resolutionMap: ResolutionMap = {
  '1S': Timeframe.S1,
  '30S': Timeframe.S30,
  1: Timeframe.M1,
  5: Timeframe.M5,
  15: Timeframe.M15,
  30: Timeframe.M30,
  60: Timeframe.H1,
  240: Timeframe.H4,
  '1D': Timeframe.D1,
  '1W': Timeframe.W1,
}

export const resolutionTimeFrameMap: Record<string, number> = {
  '1S': 1,
  '30S': 30,
  1: 60,
  5: 300,
  15: 900,
  30: 1800,
  60: 3600,
  240: 14400,
  '1D': 86400,
  '1W': 604800,
}

export const resolutionTfMap: Record<string, string> = {
  '1S': 'ohlc_1s',
  '30S': 'ohlc_30s',
  1: 'ohlc_1m',
  5: 'ohlc_5m',
  15: 'ohlc_15m',
  30: 'ohlc_30m',
  60: 'ohlc_1h',
  240: 'ohlc_4h',
  '1D': 'ohlc_1d',
  '1W': 'ohlc_1w',
}

export interface IntervalItem {
  label: string
  value: string
  show: boolean
}

export const intervalMap: IntervalItem[] = [
  { label: '1s', value: '1S', show: true },
  { label: '30s', value: '30S', show: false },
  { label: '1m', value: '1', show: true },
  { label: '5m', value: '5', show: true },
  { label: '15m', value: '15', show: true },
  { label: '30m', value: '30', show: false },
  { label: '1h', value: '60', show: true },
  { label: '4h', value: '240', show: false },
  { label: '1D', value: '1D', show: true },
  { label: '1W', value: '1W', show: false },
]

export interface TradingViewChartTypeItem {
  key: string
  label: string
  value: number
  icon?: string
  selectedIcon?: string
}

export const tradingviewChartTypeList: TradingViewChartTypeItem[] = [
  {
    key: 'kline-line',
    icon: '/images/chart/kline-style-line.svg',
    selectedIcon: '/images/chart/kline-style-line-active.svg',
    label: 'chart.line',
    value: 2,
  },
  {
    key: 'Candles',
    icon: '/images/chart/kline-style-candle.svg',
    selectedIcon: '/images/chart/kline-style-candle-active.svg',
    label: 'chart.candlestick',
    value: 1,
  },
  {
    key: 'kline-bars',
    icon: '/images/chart/kline-style-usa.svg',
    selectedIcon: '/images/chart/kline-style-usa-active.svg',
    label: 'chart.bar',
    value: 0,
  },
  {
    key: 'kline-hollow-candles',
    icon: '/images/chart/kline-style-hollow.svg',
    selectedIcon: '/images/chart/kline-style-hollow-active.svg',
    label: 'chart.hollowCandlestick',
    value: 9,
  },
  {
    key: 'kline-heikin-ashi',
    icon: '/images/chart/kline-style-average.svg',
    selectedIcon: '/images/chart/kline-style-average-active.svg',
    label: 'chart.averageCandlestick',
    value: 8,
  },

  {
    key: 'kline-area',
    icon: '/images/chart/kline-style-area.svg',
    selectedIcon: '/images/chart/kline-style-area-active.svg',
    label: 'chart.area',
    value: 3,
  },
]
