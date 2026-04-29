import { SortByCreateAtType } from '@/types/enums.ts'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FollowedHolderState {
  data: any[]
  filterAddress: string
  sortByPositionPercentage: SortByCreateAtType | undefined
  sortByTotalBuy: SortByCreateAtType | undefined
  sortByTotalSell: SortByCreateAtType | undefined
  sortByRealized: SortByCreateAtType | undefined
  sortByUnrealized: SortByCreateAtType | undefined
  sortByTotalProfit: SortByCreateAtType | undefined
}

const initialState: FollowedHolderState = {
  data: [],
  filterAddress: '',
  sortByPositionPercentage: undefined,
  sortByTotalBuy: undefined,
  sortByTotalSell: undefined,
  sortByRealized: undefined,
  sortByUnrealized: undefined,
  sortByTotalProfit: undefined
}

const followedHolderSlice = createSlice({
  name: 'followedHolder',
  initialState,
  reducers: {
    setFollowedHolderData(state, action: PayloadAction<any[]>) {
      state.data = action.payload
    },
    setFilterAddress(state, action: PayloadAction<string>) {
      state.filterAddress = action.payload
    },
    setSortByPositionPercentage(state, action: PayloadAction<SortByCreateAtType | undefined>) {
      state.sortByPositionPercentage = action.payload
    },
    setSortByTotalBuy(state, action: PayloadAction<SortByCreateAtType | undefined>) {
      state.sortByTotalBuy = action.payload
    },
    setSortByTotalSell(state, action: PayloadAction<SortByCreateAtType | undefined>) {
      state.sortByTotalSell = action.payload
    },
    setSortByRealized(state, action: PayloadAction<SortByCreateAtType | undefined>) {
      state.sortByRealized = action.payload
    },
    setSortByUnrealized(state, action: PayloadAction<SortByCreateAtType | undefined>) {
      state.sortByUnrealized = action.payload
    },
    setSortByTotalProfit(state, action: PayloadAction<SortByCreateAtType | undefined>) {
      state.sortByTotalProfit = action.payload
    },
    reset: () => initialState
  }
})

export const {
  setFollowedHolderData,
  setFilterAddress,
  setSortByPositionPercentage,
  setSortByTotalBuy,
  setSortByTotalSell,
  setSortByRealized,
  setSortByUnrealized,
  setSortByTotalProfit,
  reset
} = followedHolderSlice.actions

export default followedHolderSlice.reducer