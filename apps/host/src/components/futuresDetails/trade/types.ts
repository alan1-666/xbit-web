export * from '@/types/hyperliquid'
export type PositionModeValue = 'cross' | 'isolated'
export type OrderType = 'Limit' | 'Market'
export type OrderSide = 'B' | 'A' // 买入 或 卖出

export type DelegateType =
  | 'Take Profit Limit'
  | 'Stop Limit'
  | 'Limit'
  | 'Market'
  | 'Take Profit Market'
  | 'Stop Market'

export type TpslOrderType = 'Take Profit Limit' | 'Stop Limit' | 'Take Profit Market' | 'Stop Market'

// 触发单类型（用于区分止盈/止损）
export enum TriggerOrderTypeEnum {
  TakeProfitMarket = 'Take Profit Market',
  StopMarket = 'Stop Market',
}

export type All = 'All'

export interface FilterTypeOption {
  label: string
  value: OrderType | All
}

export interface FilterSideOption {
  label: string
  value: OrderSide | All
}

export interface xOpenOrders {
  coin: string
  side: 'A' | 'B'
  limitPx: string
  sz: string
  oid: number
  timestamp: number
  triggerCondition: string
  isTrigger: boolean
  triggerPx: string
  children: any[]
  isPositionTpsl: boolean
  reduceOnly: boolean
  orderType: DelegateType
  origSz: string
  tif: string
  cloid: null
  completedSz: number
  origSz_1: string
}

export interface xPositions {
  coin: string
  cumFunding: {
    allTime: string
    sinceChange: string
    sinceOpen: string
  }
  entryPx: string
  leverage: {
    rawUsd: string
    type: string
    value: number
  }
  side: 'A' | 'B'
  liquidationPx: string
  marginUsed: string
  maxLeverage: number
  positionValue: string
  returnOnEquity: string
  markPrice: string
  szi: string
  unrealizedPnl: string
  tpPrice: string
  slPrice: string
  tpOrderId: number
  slOrderId: number
  midPrice: string
  timestamp?: number
  hasTriggerOrder?: boolean
}

export interface xHistoryOrders {
  coin: string
  side: 'A' | 'B'
  limitPx: string
  sz: string
  oid: number
  timestamp: number
  triggerCondition: 'Triggered' | 'NotTriggered'
  isTrigger: boolean
  triggerPx: string
  children: any[]
  isPositionTpsl: boolean
  reduceOnly: boolean
  orderType: 'Take Profit Market' | string
  origSz: string
  tif: 'Gtc' | 'Ioc' | 'Fok' | string
  cloid: string | null
  status: 'filled' | 'open' | 'cancelled' | string
  statusTimestamp: number
}

export interface xHistoryTrade {
  coin: string
  px: string
  sz: string
  side: 'A' | 'B'
  time: number
  startPosition: string
  dir: 'Close Long' | 'Close Short' | 'Open Long' | 'Open Short' | string
  closedPnl: string
  hash: string
  oid: number
  crossed: boolean
  fee: string
  tid: number
  feeToken: string
  orderValue?: string
}

export interface xFundingHistory {
  time: number
  hash: string
  delta_type: string
  delta_coin: string
  delta_usdc: string
  delta_szi: string
  delta_fundingRate: string
  delta_side: 'Long' | 'Short'
  delta_nSamples: number | null
}

export interface xEntrustedHistory {
  status: string
  statusTimestamp: number

  order_coin: string
  order_side: 'B' | 'S'
  order_limitPx: string
  order_sz: string
  order_oid: number
  order_timestamp: number
  order_triggerCondition: string
  order_isTrigger: boolean
  order_triggerPx: string
  order_children: any[]
  order_isPositionTpsl: boolean
  order_reduceOnly: boolean
  order_orderType: string
  order_origSz: string
  order_tif: string
  order_cloid: string
  order_filledSz?: string
  order_orderValue?: string
}

export interface xBuilderInfo {
  b: string
  f: number
}

export interface xUserFill {
  coin: string
  px: string
  sz: string
  side: string
  time: number
  startPosition: string
  dir: string
  closedPnl: string
  hash: string
  oid: number
  crossed: boolean
  fee: string
  tid: number
}

export interface FuturesChartConfig {
  chartType?: number
  period?: string
}
