import { DisplayPriceType, SortByCreateAtType } from '@/types/enums.ts'
import { EventType, TxType as TransactionType } from '@/@generated/gql/graphql-meme2.ts'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TimeWheelDateType } from '@/redux/modules/tokenDetail.slice.ts'
import { TransactionDto } from '@/@generated/gql/graphql-meme2.ts'

export interface LastFollowedState {
  data: TransactionDto[]
  sortByCreatedAt: SortByCreateAtType
  hasMore: boolean
  minAmount: number
  maxAmount: number
  holder: string
  address: string
  displayPriceType: DisplayPriceType
  transactionType: TransactionType
  startDate?: TimeWheelDateType
  endDate?: TimeWheelDateType
  lastTimestamp?: number
  minVolume?: number
  maxVolume?: number
  eventType?: EventType
}

const initialState: LastFollowedState = {
  data: [],
  sortByCreatedAt: SortByCreateAtType.DESC,
  hasMore: true,
  minAmount: -1,
  maxAmount: -1,
  holder: '',
  address: '',
  startDate: undefined,
  endDate: undefined,
  displayPriceType: DisplayPriceType.PRICE,
  transactionType: TransactionType.All,
  lastTimestamp: undefined,
  minVolume: undefined,
  maxVolume: undefined,
  eventType: undefined,
}

export const latestFollowedSlice = createSlice({
  name: 'latestFollowed',
  initialState,
  reducers: {
    setData(state, action: PayloadAction<TransactionDto[]>) {
      state.data = [...action.payload]
    },
    setSortByCreatedAt(state, action: PayloadAction<SortByCreateAtType>) {
      state.sortByCreatedAt = action.payload
    },
    setHasMore(state, action: PayloadAction<boolean>) {
      state.hasMore = action.payload
    },
    setMinAmount(state, action: PayloadAction<number>) {
      state.minAmount = action.payload
    },
    setMaxAmount(state, action: PayloadAction<number>) {
      state.maxAmount = action.payload
    },
    setAddress(state, action: PayloadAction<string>) {
      state.address = action.payload
    },
    setHolder(state, action: PayloadAction<string>) {
      state.holder = action.payload
    },
    setDisplayPriceType(state, action: PayloadAction<DisplayPriceType>) {
      state.displayPriceType = action.payload
    },
    setTransactionType(state, action: PayloadAction<TransactionType>) {
      state.transactionType = action.payload
    },
    setStartDate(state, action: PayloadAction<TimeWheelDateType | undefined>) {
      state.startDate = action.payload
    },
    setEndDate(state, action: PayloadAction<TimeWheelDateType | undefined>) {
      state.endDate = action.payload
    },
    resetTime(state) {
      state.startDate = undefined
      state.endDate = undefined
    },
    setLastTimestamp(state, action: PayloadAction<number | undefined>) {
      state.lastTimestamp = action.payload
    },
    setMinVolume(state, action: PayloadAction<number | undefined>) {
      state.minVolume = action.payload
    },
    setMaxVolume(state, action: PayloadAction<number | undefined>) {
      state.maxVolume = action.payload
    },
    setEventType(state, action: PayloadAction<EventType | undefined>) {
      state.eventType = action.payload
    },
    reset: () => initialState,
  },
})

export const {
  setData,
  setHasMore,
  setSortByCreatedAt,
  setMinAmount,
  setMaxAmount,
  setAddress,
  setHolder,
  setDisplayPriceType,
  setTransactionType,
  setStartDate,
  setEndDate,
  resetTime,
  setLastTimestamp,
  setMaxVolume,
  setMinVolume,
  setEventType,
  reset,
} = latestFollowedSlice.actions

export default latestFollowedSlice.reducer
