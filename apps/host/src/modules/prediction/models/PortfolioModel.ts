import { PositionModel } from '@/modules/prediction/models/PositionModel.ts'

export interface IPolymarketOpenOrder {
  orderID: string
  market?: string | null
  asset_id?: string | null
  price: string
  size: string
  sizeFilled: string
  side: string
  status: string
  expiration?: number | null
  createdAt?: number | null
  outcome?: string
  marketTitle?: string
  marketIcon?: string
  marketSlug?: string
  events?: { slug: string }[]
}

export interface IPortfolioPosition extends PositionModel {
  isTotal?: boolean
  groupItemTitle?: string
}

export interface IOpenOrder {
  id: string
  marketTitle: string
  marketIcon: string
  marketSlug: string
  side: 'Buy' | 'Sell'
  outcome: string
  outcomeIndex?: number
  price: string
  filled: string
  total: string
  expiration: string
  canCancel: boolean
}

export interface IExtendedOpenOrder extends IOpenOrder {
  groupItemTitle?: string
  marketId: string
  rawPrice: number
  rawSize: number
  rawMatched: number
  tickSize?: number
}
export interface IHistoryItem {
  proxyWallet: string
  timestamp: number
  conditionId: string
  type: string
  size: number
  usdcSize: number
  transactionHash: string
  price: number
  asset: string
  side: string
  outcomeIndex: number
  title: string
  slug: string
  icon: string
  eventSlug: string
  outcome: string
  name: string
  pseudonym: string
  bio: string
  profileImage: string
  profileImageOptimized: string
  isLost?: boolean
  isCloseable?: boolean
  tokenYesTickSize?: string
}
