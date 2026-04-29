export type TokenStatisticTotalAmount = {
  totalBuyAmount1h: string
  totalBuyAmount5m: string
  totalBuyAmount6h: string
  totalBuyAmount24h: string
  totalSellAmount1h: string
  totalSellAmount5m: string
  totalSellAmount6h: string
  totalSellAmount24h: string
}

export type TokenStatisticUniqueAddresses = {
  numberOfBuyAddress1h: number
  numberOfBuyAddress5m: number
  numberOfBuyAddress6h: number
  numberOfBuyAddress24h: number
  numberOfSellAddress1h: number
  numberOfSellAddress5m: number
  numberOfSellAddress6h: number
  numberOfSellAddress24h: number
}

export type TokenStatisticTotalTransactions = {
  numberOfPurchases1h: number
  numberOfPurchases5m: number
  numberOfPurchases6h: number
  numberOfPurchases24h: number
  numberOfSales1h: number
  numberOfSales5m: number
  numberOfSales6h: number
  numberOfSales24h: number
}

export type TokenStatisticMqttPayload = Partial<{
  chainId: number
  createdTime: string
  firstPrice: string
  initLiquidity: string
  internalMarketProgress: string
  liquidity: string
  marketCap5mChangeUsd: string
  marketcap: string
  openPrice24h: string
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
  token: string
  updatedAt: string
  volume1h: string
  volume1m: string
  volume24h: string
  volume5m: string
  volume6h: string
  totalTransactions: TokenStatisticTotalTransactions
  totalAmount: TokenStatisticTotalAmount
  numberUniqueAddresses: TokenStatisticUniqueAddresses
  numberOfHolder: number
  top10Holders: number
  athPrice: number
  atlPrice: number
  turnoverRate24h: number
}>
