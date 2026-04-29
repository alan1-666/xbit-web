export interface OrderWithDepth {
  price: string
  size: string
  depth: number
  volume: number
}

export interface OrderBookData {
  bids: Array<{ price: string; size: string }>
  asks: Array<{ price: string; size: string }>
}
