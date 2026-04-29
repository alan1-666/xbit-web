import { UITab } from '@/types/uiTabs'
import i18n from '@/i18n'

export interface CryptoData {
  id: string
  symbol: string
  pair: string
  leverage: string
  marketCap: string
  price: string
  volume: string
  priceChange: number
}

export const headerTabs: UITab[] = [
  {
    value: '自选',
    label: '自选', // 自选
  },
  {
    value: '热门',
    label:  '热门', // 热门
  },
  {
    value: '分类',
    label: '分类', // 分类
  },
  {
    value: '涨幅榜',
    label: '涨幅榜', // 涨幅榜
  },
  {
    value: '跌幅榜',
    label: '跌幅榜', // 跌幅榜
  },
  {
    value: '成交额',
    label: '成交额', // 成交额
  },
  {
    value: '持仓额',
    label: '持仓额', // 持仓额
  },
  {
    value: '市值榜',
    label: '市值榜', // 市值榜
  },
]

export interface ISymbolList {
  changPxPercent: number
  currentPrice: number
  marketCap: number
  maxLeverage: number
  symbol: string
  volume: string
  isFavorite?: boolean,
  openInterest: string
}
