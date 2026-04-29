export interface MqttNewToken {
  chainId: number
  createdTime: string
  firstPrice: string
  initLiquidity: string
  internalMarketProgress: string
  liquidity: string
  marketCap5mChangeUsd: string
  marketcap: string
  name: string
  numberOfHolder: number
  price: string
  price1hAgo: string
  price1hChange: string
  price1mAgo: string
  price1mChange: string
  price24hAgo: string
  price24hChange: string
  price5mAgo: string
  price5mChange: string
  price6hAgo: string
  price6hChange: string
  symbol: string
  token: string
  updatedAt: string
  volume1h: string
  volume1m: string
  volume24h: string
  volume5m: string
  volume6h: string
}

export interface MqttNewMemeToken {
  chainId: number
  address: string
  token: string
  name: string
  symbol: string
  uri: string
  dexes: string[]
  decimals: number
  createdTime: string
  totalSupply: string
  // volume1h?: string
  marketcap?: string
  internalMarketProgress?: string
  dbp?: string // dev bundle percentage
  dhp?: string // dev hold percentage
  dhb?: string // dev hold balance
  dt?: string // dev tokens
  hc?: string // holder count
  insiderTradingPercentage?: string
  sameSourceTradingPercentage?: string
  sniperHoldAmount?: string
  sniperPercentage?: string
  thr?: string
  top10HolderPercentage?: string
  vl?: string
  txb?: string
  txs?: string
}
