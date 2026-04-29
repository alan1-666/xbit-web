export interface UniverseItem {
  name: string
  szDecimals: number
  maxLeverage: number
  onlyIsolated?: boolean
  isDelisted?: boolean
}

export interface PerpetualsMetaResponse {
  universe: UniverseItem[]
}

export interface IUserFunding {
  delta: {
    coin: string
    fundingRate: string
    nSamples: unknown
    szi: string
    type: string
    usdc: string
  }
  hash: string
  time: number
}

export interface IUserHistoricalOrder {
  order: {
    coin: string
    side: 'A' | 'B'
    limitPx: string
    sz: string
    oid: number
    timestamp: number
    triggerCondition: string
    isTrigger: false
    triggerPx: string
    children: []
    isPositionTpsl: false
    reduceOnly: true
    orderType: 'Market'
    origSz: string
    tif: string
    cloid: unknown
  }
  status: 'filled' | 'open' | 'canceled' | 'triggered' | 'rejected' | 'marginCanceled'
  statusTimestamp: number
}
