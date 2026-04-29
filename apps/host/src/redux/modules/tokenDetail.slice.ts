import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { TradeHistoryDTO } from '@/types/tokenDetail'
import { DateSelectedType, DisplayPriceType, SortByCreateAtType, TimeKey } from '@/types/enums'
import { TxType as TransactionType } from '@/@generated/gql/graphql-future.ts'
import { RootState } from '@store'
import { EventType } from '@/@generated/gql/graphql-meme2.ts'

export interface TimeWheelDateType {
  year?: string
  month?: string
  day?: string
  hour?: string
  minute?: string
}

export function timeWheelToTimestamp(dateObj: TimeWheelDateType): number {
  const now = new Date()

  const year = dateObj.year ? parseInt(dateObj.year) : now.getFullYear()
  const month = dateObj.month ? parseInt(dateObj.month) - 1 : now.getMonth()
  const day = dateObj.day ? parseInt(dateObj.day) : now.getDate()
  const hour = dateObj.hour ? parseInt(dateObj.hour) : now.getHours()
  const minute = dateObj.minute ? parseInt(dateObj.minute) : now.getMinutes()

  const date = new Date(year, month, day, hour, minute, 0, 0)

  return date.getTime()
}

export interface TokenDetailState {
  startDate: TimeWheelDateType | undefined
  endDate: TimeWheelDateType | undefined
  data: TradeHistoryDTO[]
  sortByCreatedAt: SortByCreateAtType | undefined
  page: number
  hasMore: boolean
  displayDateTimeMode: boolean
  minAmount: number
  maxAmount: number
  minVolume: number
  maxVolume: number
  address: string
  displayPriceType: DisplayPriceType
  price: number
  nativeAmountFrom: number
  nativeAmountTo: number
  transactionType: TransactionType
  eventType: EventType | undefined
  paused: boolean
}

type TimePayload = {
  type: DateSelectedType
  key: TimeKey
  value: string
}

export const getCurrentTime = (): TimeWheelDateType => {
  const now = dayjs()
  return {
    year: now.year().toString(),
    month: (now.month() + 1).toString().padStart(2, '0'),
    day: now.date().toString().padStart(2, '0'),
    hour: now.hour().toString().padStart(2, '0'),
    minute: now.minute().toString().padStart(2, '0'),
  }
}

export const getInitialState = (): TokenDetailState => ({
  startDate: undefined,
  endDate: undefined,
  data: [],
  sortByCreatedAt: SortByCreateAtType.DESC,
  page: 1,
  hasMore: true,
  displayDateTimeMode: false,
  minAmount: -1,
  maxAmount: -1,
  minVolume: -1,
  maxVolume: -1,
  address: '',
  displayPriceType: DisplayPriceType.PRICE,
  price: 0,
  nativeAmountFrom: 0,
  nativeAmountTo: 0,
  transactionType: TransactionType.All,
  eventType: undefined,
  paused: false,
})

export const createTokenDetailSlice = (name: string) => {
  return createSlice({
    name,
    initialState: getInitialState(),
    reducers: {
      setStartDate(state, action: PayloadAction<TimeWheelDateType | undefined>) {
        state.startDate = action.payload
      },
      setEndDate(state, action: PayloadAction<TimeWheelDateType | undefined>) {
        state.endDate = action.payload
      },
      setData(state, action: PayloadAction<TradeHistoryDTO[]>) {
        state.data = action.payload
      },
      setPage(state, action: PayloadAction<number>) {
        state.page = action.payload
      },
      setHasMore(state, action: PayloadAction<boolean>) {
        state.hasMore = action.payload
      },
      setTime(state, action: PayloadAction<TimePayload>) {
        const { type, key, value } = action.payload
        let target = type === 'start' ? state.startDate : state.endDate
        if (!target) target = getCurrentTime()
        target[key] = value
      },
      resetTime(state) {
        state.startDate = getCurrentTime()
        state.endDate = getCurrentTime()
      },
      setSortByCreatedAt(state, action: PayloadAction<SortByCreateAtType | undefined>) {
        state.sortByCreatedAt = action.payload
      },
      setDisplayDateTimeMode(state, action: PayloadAction<boolean>) {
        state.displayDateTimeMode = action.payload
      },
      setMinAmount(state, action: PayloadAction<number>) {
        state.minAmount = action.payload
      },
      setMaxAmount(state, action: PayloadAction<number>) {
        state.maxAmount = action.payload
      },
      setMinVolume(state, action: PayloadAction<number>) {
        state.minVolume = action.payload
      },
      setMaxVolume(state, action: PayloadAction<number>) {
        state.maxVolume = action.payload
      },
      setNativeAmountFrom(state, action: PayloadAction<number>) {
        state.nativeAmountFrom = action.payload
      },
      setNativeAmountTo(state, action: PayloadAction<number>) {
        state.nativeAmountTo = action.payload
      },
      setAddress(state, action: PayloadAction<string>) {
        state.address = action.payload
      },
      setDisplayPriceType(state, action: PayloadAction<DisplayPriceType>) {
        state.displayPriceType = action.payload
      },
      setPrice(state, action: PayloadAction<number>) {
        state.price = action.payload
      },
      setTransactionType(state, action: PayloadAction<TransactionType>) {
        state.transactionType = action.payload
      },
      reset: () => getInitialState(),
      setEventType(state, action: PayloadAction<EventType | undefined>) {
        state.eventType = action.payload
      },
      setPaused(state, action: PayloadAction<boolean>) {
        state.paused = action.payload
      },
    },
  })
}

export const tokenDetailSlice = createTokenDetailSlice('tokenDetail')

export const {
  setStartDate,
  setEndDate,
  setData,
  setPage,
  setHasMore,
  setTime,
  resetTime,
  setSortByCreatedAt,
  setDisplayDateTimeMode,
  setMinAmount,
  setMaxAmount,
  setMinVolume,
  setMaxVolume,
  setAddress,
  setDisplayPriceType,
  reset,
  setPrice,
  setNativeAmountFrom,
  setNativeAmountTo,
  setTransactionType, // add filter type for filter tx
  setEventType,
  setPaused,
} = tokenDetailSlice.actions

export const selectFromTokenDetailState =
  <T extends keyof TokenDetailState>(key: T) =>
  (state: RootState) => {
    const tokenDetail = state.tokenDetail as TokenDetailState
    return tokenDetail[key]
  }

export default tokenDetailSlice.reducer
