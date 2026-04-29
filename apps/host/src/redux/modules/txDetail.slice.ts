import type { FundingRecord } from '@/components/assets/overview/TabFundingRecords'
import type { RootState } from '@/redux/store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type TxDetailState = {
  txDetail: FundingRecord | null
}

const initialState: TxDetailState = {
  txDetail: null,
}

const txDetailSlice = createSlice({
  name: 'txDetail',
  initialState,
  reducers: {
    setTxDetail: (state, action: PayloadAction<FundingRecord | null>) => {
      state.txDetail = action.payload
    },
    clearTxDetail: (state) => {
      state.txDetail = null
    },
  },
})

export const { setTxDetail, clearTxDetail } = txDetailSlice.actions

export const selectTxDetail = (state: RootState) => state.txDetail.txDetail

export default txDetailSlice
