export interface Ohlc {
  open: string
  close: string
  high: string
  low: string
  ts: number
  usdVolume: string
}

export interface OhlcUpdate {
  close: number
  high: number
  isBarClosed: boolean
  isLastBar: boolean
  low: number
  marketCap: string
  open: number
  price: number
  time: number
  volume: number
  address: string
}
