import { ChainIds } from '@/types/enums.ts'
import { MemeDto } from '@/@generated/gql/graphql-future.ts'
import { TransactionType } from '@/@generated/gql/graphql-trading.ts'

export type TokenTrending = {
  chainId: number
  token: string
  name: string
  image: string | null
  symbol: string
  firstPrice: number
  price: string
  price1mAgo: number
  price5mAgo: number
  price1hAgo: number
  price1mChange: string
  price5mChange: string
  price1hChange: string
  price6hChange: string
  price24hChange: string
  price24hAgo: number
  buyTxs1m: number
  buyTxs5m: number
  buyTxs1h: number
  buyTxs6h: number
  buyTxs24h: number
  sellTxs1m: number
  sellTxs5m: number
  sellTxs1h: number
  sellTxs6h: number
  sellTxs24h: number
  volume1m: number
  volume5m: number
  volume1h: number
  volume6h: number
  volume24h: number
  marketcap: string
  liquidity: number
  marketCap5mChangeUsd?: string
  txs1h: number
  txs1m: number
  txs24h: number
  txs5m: number
  txs6h: number
  initLiquidity: number
  internalMarketProgress: string
  numberOfHolder: number
  dexes?: string[]
  createdTime: string
  ohlc?: {
    startTime: string
    ts: number
    token: string
    open: string
    chainId: number
    high: string
    low: string
    close: string
    tokenVolume: string
    usdVolume: string
  }[]
  isFavorite: boolean
}

export interface TokenMarketStats {
  chainId?: number
  createdTime?: string
  firstPrice?: string
  initLiquidity?: string
  internalMarketProgress?: string
  liquidity?: string
  marketcap?: string
  marketcap5m?: string
  numberOfHolder?: number
  price?: string
  price1hAgo?: string
  price1hChange?: string
  price1mAgo?: string
  price1mChange?: string
  price24hAgo?: string
  price24hChange?: string
  price5mAgo?: string
  price5mChange?: string
  price6hAgo?: string
  price6hChange?: string
  token?: string
  updatedAt?: string
  volume1h?: string
  volume1m?: string
  volume24h?: string
  volume5m?: string
  volume6h?: string
  top10Holders?: number
  athPrice?: number
  atlPrice?: number
  turnoverRate24h?: number
  totalTransactions?: {
    numberOfPurchases1h: number
    numberOfPurchases5m: number
    numberOfPurchases6h: number
    numberOfPurchases24h: number
    numberOfSales1h: number
    numberOfSales5m: number
    numberOfSales6h: number
    numberOfSales24h: number
  }
  totalAmount?: {
    totalBuyAmount1h: string
    totalBuyAmount5m: string
    totalBuyAmount6h: string
    totalBuyAmount24h: string
    totalSellAmount1h: string
    totalSellAmount5m: string
    totalSellAmount6h: string
    totalSellAmount24h: string
  }
  numberUniqueAddresses?: {
    numberOfBuyAddress5m: number
    numberOfBuyAddress6h: number
    numberOfBuyAddress24h: number
    numberOfBuyAddress1h: number
    numberOfSellAddress1h: number
    numberOfSellAddress5m: number
    numberOfSellAddress6h: number
    numberOfSellAddress24h: number
  }
}

export interface WalletTokenBalanceMsg {
  token: string
  chainId: ChainIds
  balance: number
  updateTime: number
  relatedTxHashes: string[]
}

export type MemeTokenWithFormatted = MemeDto & {
  formatted: {
    top10Holders: string
    snipers: string
    insider: string
    sameSource: string
    holders: string
    smartMoney: string
    devProjects: string
  }
  uri?: string
  totalSupply?: string
  top10Balance?: string
  devHoldBalance?: string
  migratedAt?: string
  source: string
  creator?: string
}

export interface UnCompletedOrder {
  id?: string
  baseSymbol?: string
  baseAddress?: string
  userAddress?: string
  status?: string
  type?: string
  chainId?: ChainIds
  baseAmount?: number
  transactionType?: TransactionType
}
