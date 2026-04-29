import { createSlice } from '@reduxjs/toolkit'
import { FilterState } from '@components/detailPoolTab'

export type TradeTabState = {
  holderCount: number
  top10Holder: number
  avgHolding: number
  insiderPct: number
  phishingPct: number,
  botPct: number,
  bundlePct: number,
  newWalletPct: number,
  inActivePct: number,
  holderChart: {
    holder: number[]
    top10: number[]
    avgHolding: number[]
    insider: number[]
  }
  currentDetailTab?: string
  currentHoldingTab?: string
  currentFollowedTab?: string
  currentFilterTradeTab?: string
  currentFilterHolderTab?: string
  currentFilterPoolTab?: string
  currentTradingTransactionType?: string
  currentTradingCheckBot?: boolean
  currentTradingCheckBasic?: boolean
  currentHistoryCheckIsCurrent?: boolean
  poolFilter?: FilterState
  followedPoolFilter?: FilterState
  totalSupply?: number
}

const initialState: TradeTabState = {
  currentDetailTab: undefined,
  currentHoldingTab: undefined,
  currentFollowedTab: undefined,
  currentFilterTradeTab: undefined,
  currentFilterHolderTab: undefined,
  currentFilterPoolTab: undefined,
  currentTradingTransactionType: undefined,
  currentTradingCheckBot: undefined,
  currentTradingCheckBasic: undefined,
  currentHistoryCheckIsCurrent: false,
  holderCount: 0,
  top10Holder: 0,
  avgHolding: 0,
  insiderPct: 0,
  phishingPct: 0,
  botPct: 0,
  bundlePct: 0,
  newWalletPct: 0,
  inActivePct: 0,
  holderChart: {
    holder: [],
    top10: [],
    avgHolding: [],
    insider: [],
  },
  totalSupply: 0,
  poolFilter: undefined,
  followedPoolFilter: undefined,
}

const tradeTabSlice = createSlice({
  name: 'tradeTab',
  initialState,
  reducers: {
    setCurrentDetailTab: (state, action) => {
      state.currentDetailTab = action.payload
    },
    setCurrentHoldingTab: (state, action) => {
      state.currentHoldingTab = action.payload
    },
    setCurrentFollowedTab: (state, action) => {
      state.currentFollowedTab = action.payload
    },
    setCurrentFilterTradeTab: (state, action) => {
      state.currentFilterTradeTab = action.payload
    },
    setCurrentFilterHolderTab: (state, action) => {
      state.currentFilterHolderTab = action.payload
    },
    setCurrentFilterPoolTab: (state, action) => {
      state.currentFilterPoolTab = action.payload
    },
    setCurrentTradingTransactionType: (state, action) => {
      state.currentTradingTransactionType = action.payload
    },
    setCurrentTradingCheckBot: (state, action) => {
      state.currentTradingCheckBot = action.payload
    },
    setCurrentTradingCheckBasic: (state, action) => {
      state.currentTradingCheckBasic = action.payload
    },
    setCurrentHistoryCheckIsCurrent: (state, action) => {
      state.currentHistoryCheckIsCurrent = action.payload
    },
    setHolderCount: (state, action) => {
      state.holderCount = action.payload
    },
    setTop10Holder: (state, action) => {
      state.top10Holder = action.payload
    },
    setAvgHolding: (state, action) => {
      state.avgHolding = action.payload
    },
    setInsiderPct: (state, action) => {
      state.insiderPct = action.payload
    },
    setPhishingPct: (state, action) => {
      state.phishingPct = action.payload
    },
    setBotPct: (state, action) => {
      state.botPct = action.payload
    },
    setBundlePct: (state, action) => {
      state.bundlePct = action.payload
    },
    setNewWalletPct: (state, action) => {
      state.newWalletPct = action.payload
    },
    setInActivePct: (state, action) => {
      state.inActivePct = action.payload
    },
    setHolderCountChart: (state, action) => {
      state.holderChart.holder = action.payload
    },
    setTop10Chart: (state, action) => {
      state.holderChart.top10 = action.payload
    },
    setAvgHoldingChart: (state, action) => {
      state.holderChart.avgHolding = action.payload
    },
    setInsiderChart: (state, action) => {
      state.holderChart.insider = action.payload
    },
    resetDataHolderTab: (state) => {
      state.holderCount = 0
      state.top10Holder = 0
      state.insiderPct = 0
      state.holderChart = {
        top10: [],
        avgHolding: [],
        insider: [],
        holder: [],
      }
    },
    setPoolFilter: (state, action) => {
      state.poolFilter = action.payload
    },
    setFollowedPoolFilter: (state, action) => {
      state.followedPoolFilter = action.payload
    },
    setTotalSupply: (state, action) => {
      state.totalSupply = action.payload
    },
    reset: () => initialState
  }
})

export const {
  setCurrentDetailTab,
  setCurrentHoldingTab,
  setCurrentFollowedTab,
  setCurrentFilterTradeTab,
  setCurrentFilterHolderTab,
  setCurrentFilterPoolTab,
  setCurrentTradingTransactionType,
  setCurrentTradingCheckBasic,
  setCurrentTradingCheckBot,
  setCurrentHistoryCheckIsCurrent,
  setHolderCount,
  setTop10Holder,
  setAvgHolding,
  setInsiderPct,
  setPhishingPct,
  setBotPct,
  setBundlePct,
  setNewWalletPct,
  setInActivePct,
  setHolderCountChart,
  setTop10Chart,
  setAvgHoldingChart,
  setInsiderChart,
  resetDataHolderTab,
  setTotalSupply,
  setPoolFilter,
  setFollowedPoolFilter,
  reset
} = tradeTabSlice.actions

export default tradeTabSlice.reducer
