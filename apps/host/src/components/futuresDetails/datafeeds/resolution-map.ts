export interface IntervalItem {
  label: string
  value: string
  show: boolean
}

export const intervalMap: IntervalItem[] = [
  // { label: '分时', value: '1', show: true },
  { label: '1m', value: '1', show: true },
  { label: '3m', value: '3', show: false },
  { label: '5m', value: '5', show: false },
  { label: '15m', value: '15', show: true },
  { label: '30m', value: '30', show: false },
  { label: '1h', value: '60', show: true },
  { label: '2h', value: '120', show: false },
  { label: '4h', value: '240', show: true },
  { label: '8h', value: '480', show: false },
  { label: '12h', value: '720', show: false },
  { label: '1d', value: '1D', show: true },
  { label: '3d', value: '3D', show: false },
  { label: '1w', value: '1W', show: false },
  { label: '1M', value: '1M', show: false }
]

export const resolutionToHyperliquidInterval: Record<string, string> = {
  '1': '1m',
  '3': '3m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '240': '4h',
  '480': '8h',
  '720': '12h',
  '1D': '1d',
  '3D': '3d',
  '1W': '1w',
  '1M': '1M'
};

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
