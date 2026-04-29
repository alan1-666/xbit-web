import { PageType, OHLCType } from '@/types/chart'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { chartRefRegistry } from '@/services/chartRefRegistry'
import { RootState } from '@/redux/store'
import { IntervalItem, intervalMap } from '@/datafeeds/resolution-map'

export interface ChartState {
  period: string
  chartType: number
  ohlcType: OHLCType
  height: number | string
  token: string
  symbol: string
  priceChangeColor: string
  lang: string
  isChartReady: boolean
  listTimeFrames: IntervalItem[]
  isPatch?: boolean
}

type ChartStateWithPageType = ChartState & Record<PageType, ChartState>

export const initialState: ChartStateWithPageType = {
  period: '1',
  chartType: 1,
  ohlcType: 'price',
  height: 200,
  token: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN', // Trump
  symbol: 'TRUMP',
  priceChangeColor: 'normal',
  lang: 'en',
  isChartReady: false,
  meme: {
    period: '1',
    chartType: 1,
    ohlcType: 'price',
    height: 200,
    token: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN', // Trump
    symbol: 'TRUMP',
    priceChangeColor: 'normal',
    lang: 'en',
    isChartReady: false,
    listTimeFrames: intervalMap,
    isPatch: true
  },
  xstocks: {
    period: '1',
    chartType: 1,
    ohlcType: 'price',
    height: 200,
    token: 'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W', // SPYx
    symbol: 'SPYx',
    priceChangeColor: 'normal',
    lang: 'en',
    isChartReady: false,
    listTimeFrames: intervalMap,
    isPatch: true
  },
}

export const chartSlice = createSlice({
  name: 'chart',
  initialState: initialState,
  reducers: {
    updatePeriod: (state, action) => {
      state.period = action.payload
    },
    updateChartType: (state, action) => {
      state.chartType = action.payload
    },
    updateOHLCType: (state, action) => {
      state.ohlcType = action.payload
    },
    updateHeight: (state, action) => {
      state.height = action.payload
    },
    updatePeriodWithType: (state, action: PayloadAction<{ type: PageType; period: string }>) => {
      state[action.payload.type].period = action.payload.period
    },
    updateChartTypeWithType: (state, action: PayloadAction<{ type: PageType; chartType: number }>) => {
      state[action.payload.type].chartType = action.payload.chartType
    },
    updateOHLCTypeWithType: (state, action: PayloadAction<{ type: PageType; ohlcType: OHLCType }>) => {
      state[action.payload.type].ohlcType = action.payload.ohlcType
    },
    updateHeightWithType: (state, action: PayloadAction<{ type: PageType; height: number | string }>) => {
      state[action.payload.type].height = action.payload.height
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    updateSymbol: (state, action: PayloadAction<string>) => {
      state.symbol = action.payload
    },
    updatePriceChangeColor: (state, action: PayloadAction<string>) => {
      state.priceChangeColor = action.payload
    },
    updateLang: (state, action: PayloadAction<string>) => {
      state.lang = action.payload
    },
    updateTokenWithType: (state, action: PayloadAction<{ type: PageType; token: string }>) => {
      state[action.payload.type].token = action.payload.token
    },
    updateSymbolWithType: (state, action: PayloadAction<{ type: PageType; symbol: string }>) => {
      state[action.payload.type].symbol = action.payload.symbol
    },
    updatePriceChangeColorWithType: (state, action: PayloadAction<{ type: PageType; priceChangeColor: string }>) => {
      state[action.payload.type].priceChangeColor = action.payload.priceChangeColor
    },
    updateLangWithType: (state, action: PayloadAction<{ type: PageType; lang: string }>) => {
      state[action.payload.type].lang = action.payload.lang
    },
    updateChartReady: (state, action: PayloadAction<boolean>) => {
      state.isChartReady = action.payload
    },
    updateChartReadyWithType: (state, action: PayloadAction<{ type: PageType; isChartReady: boolean }>) => {
      state[action.payload.type].isChartReady = action.payload.isChartReady
    },
    updateListTimeFrames: (state, action: PayloadAction<{ type: PageType; listTimeFrames: IntervalItem[] }>) => {
      state[action.payload.type].listTimeFrames = action.payload.listTimeFrames
    },
    updateIsPatch: (state, action: PayloadAction<{ type: PageType; isPatch: boolean }>) => {
      state[action.payload.type].isPatch = action.payload.isPatch
    },
  },
})

export const {
  updatePeriod,
  updateChartType,
  updateOHLCType,
  updateHeight,
  updatePeriodWithType,
  updateChartTypeWithType,
  updateOHLCTypeWithType,
  updateHeightWithType,
  updateToken,
  updateSymbol,
  updatePriceChangeColor,
  updateLang,
  updateTokenWithType,
  updateSymbolWithType,
  updatePriceChangeColorWithType,
  updateLangWithType,
  updateChartReady,
  updateChartReadyWithType,
  updateIsPatch
} = chartSlice.actions
export const chartActions = { ...chartSlice.actions }

// Selector to get chart ref from registry based on pageType in store
export const selectChartRef = (state: RootState, pageType: PageType) => {
  return chartRefRegistry.getRef(pageType)
}

// Selector to get chart ref for current page type (requires pageType to be determined)
export const selectChartRefByPageType = (pageType: PageType) => (state: RootState) => {
  return chartRefRegistry.getRef(pageType)
}

export default chartSlice
