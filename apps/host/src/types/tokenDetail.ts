import { SortByCreateAtType, TransactionType } from '@/types/enums.ts'
import { ChainType } from '@/@generated/gql/graphql-meme2.ts'

export type TokenDetailRow = {
  time: string
  type: string
  transactionAmount: string
  soldPrice: string
  volume: string
  wallet: string
}

export interface TradeHistoryFilterInput {
  fromTimestamp?: number
  toTime?: number
  type?: TransactionType
  tradeValueMin?: string // or Decimal if using decimal.js
  tradeValueMax?: string
  quantityMin?: string
  quantityMax?: string
  wallets?: string[]
  sortType: SortByCreateAtType
}

export interface TokenTradeHistoryInput {
  tokenAddress: string
  page?: number
  limit?: number
  chain?: ChainType
  filter?: TradeHistoryFilterInput
}

export interface TradeHistoryDTO {
  timestamp: string
  type: TransactionType
  tradeValue: string
  price: string
  quantity: string
  wallet: string
  //new attribute
  maxHoldingQty?: number
  balance?: number
  marketCap?: number
}

export interface Pagination {
  page: number
  limit: number
}

export interface TradeHistoryPagination extends Pagination {
  data: TradeHistoryDTO[]
}

export interface TradeHistoryResponse {
  getTradeHistory: TradeHistoryPagination
}

// Type definitions for the library
export interface WheelItem {
  id: string
  value: string
}

export type TimeUnit = 'm' | 'h' | 'D' | 'M' | 'Y'

export interface TokenInfo {
  logoUrl: string
}

export interface TokenDTO {
  address: string
  chainId: number
  symbol: string
  name: string
  decimals: string
  info: TokenInfo
  totalSupply: string
  tags: string[]
  mintDisable: boolean
  isBlacklisted: boolean
  isHoneypot: boolean
  burnRatio: number
  burnStatus: string
  top10HolderRate: number
  ratTraderAmountRate: number
}

export type SmartMoneyAction = {
  txType: TransactionType
  timestamp: number
  token: TokenDTO
  address: string
  baseAmount: number
  usdAmount: number
  transactionInSixHours?: any[]
}

export interface TokenReq {
  chain: ChainType
  address: string
}

export interface TokenRes {
  address: string
  name: string
  logo: string
  totalSupply: number
}

export interface SmartMoneyTradeHistoryReq {
  token: TokenReq
  page?: number
  limit?: number
  duration?: number
}

export interface SmartMoneyTradeHistories {
  address: string
  timestamp: number
  type: TransactionType
  amount: number
  usdAmount: number
  usdPrice: number
  token: TokenRes
  transactionHash?: string
  nativeAmount: number
}

export interface SmartMoneyTradeHistoryResponse {
  getSmartMoneyTradeHistories: SmartMoneyTradeHistories[]
}
