import { ReasonFiltering } from '@/@generated/gql/graphql-meme2'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum RealtimeTransactionType {
  Buy = 'buy',
  Sell = 'sell',
  AddLiquidity = 'add',
  RemoveLiquidity = 'remove',
  Burn = 'burn',
  Unknown = 'unknown',
}

export type RealtimeTransaction = {
  timestamp: number // Unix timestamp in seconds
  type: RealtimeTransactionType
  volumeUsd: number // Volume in USD
  nativeAmount: number // Amount in native token
  usdPrice: number // Price in USD
  baseAmount: number // Amount in base token
  quoteAmount: number // Amount in quote token
  quoteToken: string // Address of the quote token
  maker: string // Address of the maker
  txCount: number // Number of transactions the maker has made in the last 24 hours
  txHash: string // Transaction hash
  isSmartMoney: boolean // Whether the maker is considered smart money
  isWhale: boolean // Whether the maker is considered a whale
  isSniper: boolean // Whether the transaction is a sniper transaction
  isBundler: boolean // Whether the transaction is a bundler transaction
  isDev: boolean // Whether the maker is a developer
  isNewWallet: boolean // Whether the maker is a new wallet
  isKOL: boolean // Whether the maker is a KOL
  isInsider: boolean // Whether the maker is an insider
  isTopTrader: boolean // Whether the maker is a top trader
  source?: 'ws' | 'api' // Source of the transaction data
  eventIndex?: number // Optional event index for tracking
  logIndex?: number // Optional log index for tracking
  holderPct?: number // Percentage of the total supply held by the maker
  isKlineTx?: boolean // check is KLine Tx
  dex?: string // check is KLine Tx
  reasonFiltering?: ReasonFiltering // reason for filtering
  fetchedAt: number // Unix timestamp in milliseconds when the transaction was fetched
}

interface TransactionsHistoryState {
  transactions: RealtimeTransaction[]
}

const initialState: TransactionsHistoryState = {
  transactions: [],
}

const transactionsHistorySlice = createSlice({
  name: 'transactionsHistory',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<RealtimeTransaction[]>) => {
      state.transactions = action.payload
    },
    resetTransactions: (state) => {
      state.transactions = []
    },
  },
})

export const transactionsHistoryActions = transactionsHistorySlice.actions
export default transactionsHistorySlice
