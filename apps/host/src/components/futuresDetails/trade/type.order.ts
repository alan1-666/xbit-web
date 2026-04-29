export type Tif = 'Alo' | 'Ioc' | 'Gtc' | 'FrontendMarket'
export type Tpsl = 'tp' | 'sl'

export interface LimitOrderType {
  tif: Tif
}

export interface TriggerOrderTypeWire {
  triggerPx: string
  isMarket: boolean
  tpsl: Tpsl
}

export interface TriggerOrderType {
  triggerPx: string
  isMarket: boolean
  tpsl: Tpsl
}

export interface OrderType {
  limit?: LimitOrderType
  trigger?: TriggerOrderType
}

export interface OrderRequest {
  asset: number
  is_buy: boolean
  sz: string
  limit_px: string
  order_type: OrderType
  reduce_only: boolean
  cloid?: Cloid | null
}

export interface OrderTypeWire {
  limit?: LimitOrderType
  trigger?: TriggerOrderTypeWire
}

export interface TpslRequest {
  orders: OrderRequest[]
  grouping: 'normalTpsl'
}

export interface ScaleRequest {
  orders: OrderWire[]
  grouping: 'na',
  type: 'order'
}

export interface TwapRequest {
  action: {
    type: string
    twap: {
      a: number
      b: boolean
      s: string
      r: boolean
      m: number
      t: boolean
    }
  }
}

export interface OrderWire {
  a: number
  b: boolean
  p: string
  s: string
  r: boolean
  t: OrderTypeWire
  c?: string
}

export class Cloid {
  private _rawCloid: string

  constructor(rawCloid: string) {
    this._rawCloid = rawCloid
    this._validate()
  }

  private _validate(): void {
    if (!this._rawCloid.startsWith('0x')) {
      throw new Error('cloid is not a hex string')
    }
    if (this._rawCloid.slice(2).length !== 32) {
      throw new Error('cloid is not 16 bytes')
    }
  }

  static fromInt(cloid: number): Cloid {
    return new Cloid(`0x${cloid.toString(16).padStart(32, '0')}`)
  }

  static fromStr(cloid: string): Cloid {
    return new Cloid(cloid)
  }

  toRaw(): string {
    return this._rawCloid
  }
}

export enum OrderTypeEnum {
  market = 'market',
  limit = 'limit',
  tpsl = 'tpsl',
  phased = 'phased',
  twap = 'twap',
}
export enum OrderSide {
  buy = 'buy',
  sell = 'sell',
}
export enum TriggerTypeEmum {
  LimitOrder = 'Limit_Order',
  MarketOrder = 'Market_Order',
}
export enum TpslTypeEmum {
  ROI = 'ROI',
  Price = 'Price',
}
export type OrderInfo = {
  type: OrderTypeEnum
  side: OrderSide
  size: number | string
  price: number | string
  reduceOnly: boolean
  isShowTPSl: boolean
  currency: string
  sliderValue: number[]
  triggerType: TriggerTypeEmum
  triggerPrice: number
  duration: number
  randomize: boolean
  orderCount: number
  startPrice: number
  endPrice: number
  tpPrice: string
  slPrice: string
  sizeSkew: number,
  tpslUnit: string
  tif: Tif,
  liquidationPrice: number
  positionValue: number
  marginRequired: number
  orderCoin: string
  tpType: TpslTypeEmum
  slType: TpslTypeEmum
  tpValue: string
  slValue: string
}

export interface OrderContractState {
  orderInfo: OrderInfo
}

export interface ITimeOption {
  lable: string
  value: number
  unit: string
}

export interface ScaleOrderRequest {
  asset: number
  is_buy: boolean
  sz: number
  startPrice: number
  endPrice: number
  count: number
  skew: number
  reduce_only: boolean
  order_type: OrderType
}

export interface OrderPhasedParams {
  totalSize: number
  startPrice: number
  endPrice: number
  count: number
  skew: number
  isBuy: boolean
  reduceOnly?: boolean
  minNotionalUSD?: number
  decimals?: number
  tif: Tif
}
