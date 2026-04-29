import { xPositions } from '@/components/futuresDetails/trade/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IEnhancedOverview {
  balance: number
  unrealizedPnl: number
  positionValue: number
  maintenanceMargin: number
  crossAccountLeverage: number
  crossMarginRatio: number
  availableMargin: number
  rawUSD: number
  availableWithdraw: number
  totalMargin: number
}
export interface UserPositionState {
  enhancedOverview: IEnhancedOverview | undefined
  positions: xPositions[]
  oneDayChange: number
  hasData: boolean
  balance: number
  rawUSD: number
  perp: number
}

const initialState: UserPositionState = {
  enhancedOverview: undefined,
  oneDayChange: 0,
  hasData: false,
  positions: [],
  balance: 0,
  rawUSD: 0,
  perp: 0,
}

const userPositionSlice = createSlice({
  name: 'userPosition',
  initialState,
  reducers: {
    setRawUSD: (state, action: PayloadAction<{ rawUSD: number }>) => {
      state.rawUSD = action.payload.rawUSD
    },
    setPrep: (state, action: PayloadAction<{ perp: number }>) => {
      state.perp = action.payload.perp
    },
    setBalance: (state, action: PayloadAction<{ balance: number }>) => {
      state.balance = action.payload.balance
    },
    setHasData: (state, action: PayloadAction<boolean>) => {
      state.hasData = action.payload
    },
    setOneDayChange: (state, action: PayloadAction<{ oneDayChange: number }>) => {
      state.oneDayChange = action.payload.oneDayChange
    },

    setEnhancedOverview: (state, action: PayloadAction<{ enhancedOverview: IEnhancedOverview }>) => {
      state.enhancedOverview = action.payload.enhancedOverview
    },
    clearPositions: (state) => {
      state.positions = []
      state.rawUSD = 0
      state.perp = 0
    },
    updatePosition: (state, action: PayloadAction<{ symbol: string; updates: Partial<xPositions> }>) => {
      const { symbol, updates } = action.payload
      const index = state.positions.findIndex((pos) => pos.coin === symbol)
      if (index !== -1) {
        state.positions[index] = { ...state.positions[index], ...updates }
      }
    },

    updatePositionsFromWebData2: (state, action: PayloadAction<xPositions[]>) => {
      state.positions = action.payload
    },

    clearAllSlice: (state) => {
      state.balance = initialState.balance
      state.enhancedOverview = initialState.enhancedOverview
      state.hasData = initialState.hasData
      state.oneDayChange = initialState.oneDayChange
      state.perp = initialState.perp
      state.positions = initialState.positions
      state.rawUSD = initialState.rawUSD
    },
  },
})

export const symbolListActions = userPositionSlice.actions
export const {
  setRawUSD,
  clearPositions,
  updatePosition,
  setPrep,
  setBalance,
  setOneDayChange,
  updatePositionsFromWebData2,
  setHasData,
  setEnhancedOverview,
  clearAllSlice
} = userPositionSlice.actions

export default userPositionSlice.reducer
