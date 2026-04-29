export type MemeTokenInfoRaw = Partial<{
  t10hp: string // Top 10 holdings percentage
  thr: string // Top 10 holder raw balance
  sp: string // Sniper percentage
  dp: string // Dev hold percentage
  dhb: string // Dev hold balance
  hc: string // Holder count
  dt: string // Total dev tokens migrated
  dbp: string // Dev bundlers percentage
  mc: string // Market cap in USD
  impp: string // Internal Market Progress Percentage
  itp: string // Insider trading percentage
  ib: string // Insider raw balance
  shb: string // Sniper holding balance

  txb1m: number // Buy transaction count in 1m
  txb5m: number // Buy transaction count in 5m
  txb1h: number // Buy transaction count in 1h
  txb6h: number // Buy transaction count in 6h
  txb24h: number // Buy transaction count in 24h
  txs1m: number // Sell transaction count in 1m
  txs5m: number // Sell transaction count in 5m
  txs1h: number // Sell transaction count in 1h
  txs6h: number // Sell transaction count in 6h
  txs24h: number // Sell transaction count in 24h

  vl1m: string // Volume in 1m
  vl5m: string // Volume in 5m
  vl1h: string // Volume in 1h
  vl6h: string // Volume in 6h
  vl24h: string // Volume in 24h
}> & {
  tokenAddress: string
  chainId: number
}

export type MemeTokenInfo = Partial<{
  top10: number
  sniper: number
  devHold: number
  holderCount: number
  totalMigrated: number
  bundle: number
  marketCap: number
  progress: number
  insider: number

  txBuys1m: number
  txBuys5m: number
  txBuys1h: number
  txBuys6h: number
  txBuys24h: number
  txSells1m: number
  txSells5m: number
  txSells1h: number
  txSells6h: number
  txSells24h: number

  volume1m: number
  volume5m: number
  volume1h: number
  volume6h: number
  volume24h: number
}>
