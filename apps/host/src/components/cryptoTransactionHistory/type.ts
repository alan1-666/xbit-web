import { UITab } from '@/types/uiTabs'

// TODO: get real user address from wallet
export const USER_ADDRESS = '0xF55dB5DbFee200d023e8C9108233aEdB6E4a5d69'

export enum ModeOptionsEmun {
  ALL_DIRECTIONS = 'all-directions',
  LONG = 'long',
  SHORT = 'short',
}

export const modeOptions = [
  {
    value: ModeOptionsEmun.ALL_DIRECTIONS,
    label: '全部方向',
    desc: '',
  },
  {
    value: ModeOptionsEmun.LONG,
    label: '做多',
    desc: '',
  },
  {
    value: ModeOptionsEmun.SHORT,
    label: '做空',
    desc: '',
  },
]

export const navTabs: UITab[] = [
  {
    value: 'current-commission',
    label: '当前委托',
  },
  {
    value: 'historical-commission',
    label: '历史委托',
  },
  {
    value: 'my-holdings',
    label: '我的持仓',
  },
  {
    value: 'funding-history',
    label: '资金费历史',
  },
]

export const currencyOptions = [
  { label: '全部', value: 'all' },
  { label: 'BTCUSD永续', value: 'BTCUSD' },
  { label: 'ETHUSD永续', value: 'ETHUSD' },
  { label: 'ADAUSD永续', value: 'ADAUSD' },
  { label: 'DOGEUSD永续', value: 'DOGEUSD' },
]
