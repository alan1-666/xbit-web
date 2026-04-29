import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface PriorityFeePrice {
  low?: number
  medium?: number
  high?: number
  veryHigh?: number
}

interface NetworkFeeState {
  maxcomputeUnit: number
  priorityFeePrice: PriorityFeePrice
  feeAccount: string
  platformFee: number
  xstockPlatformFee: number
  minTipFee: number
  autoTipFee: number
}

const initialState: NetworkFeeState = {
  maxcomputeUnit: 0,
  priorityFeePrice: {
    medium: 0,
    high: 0,
    veryHigh: 0,
  },
  feeAccount: '',
  platformFee: 0.01,
  xstockPlatformFee: 0.0002,
  minTipFee: 0,
  autoTipFee: 0.001,
}

const networkFeeSlice = createSlice({
  name: 'networkFee',
  initialState,
  reducers: {
    setNetworkFee: (state, action: PayloadAction<NetworkFeeState>) => {
      state.maxcomputeUnit = action.payload.maxcomputeUnit
      state.priorityFeePrice = action.payload.priorityFeePrice
      state.feeAccount = action.payload.feeAccount
      state.xstockPlatformFee = action.payload.xstockPlatformFee
      state.platformFee = action.payload.platformFee
      state.minTipFee = action.payload.minTipFee
      state.autoTipFee = action.payload.autoTipFee
    },
    setMaxComputeUnit: (state, action: PayloadAction<number>) => {
      state.maxcomputeUnit = action.payload
    },
    setPriorityFeePrice: (state, action: PayloadAction<PriorityFeePrice>) => {
      state.priorityFeePrice = action.payload
    },
    resetNetworkFee: (state) => {
      state.maxcomputeUnit = 0
      state.priorityFeePrice = {
        medium: 0,
        high: 0,
        veryHigh: 0,
      }
    },
  },
})

export const { setNetworkFee, setMaxComputeUnit, setPriorityFeePrice, resetNetworkFee } = networkFeeSlice.actions
export default networkFeeSlice.reducer
