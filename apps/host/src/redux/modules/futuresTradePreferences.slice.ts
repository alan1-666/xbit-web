import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { REHYDRATE, RehydrateAction } from 'redux-persist'
import { ISymbolList } from './symbolList.slide'



export type DepthLayout = 'showAll' | 'showAsks' | 'showBids'

export interface FuturesTradePreferencesState {
  preferences: {
    depthUnit: 'base' | 'quote'
    depthLayout: DepthLayout
    depthPrecision: number
    isExpandKline: boolean
    allSymbols: ISymbolList[]
    klinePeriod: string
    maxSlippage: string
    isShowOrderConfirm: boolean
  }
}

export const initialStateTradeConfig: FuturesTradePreferencesState = {
  preferences: {
    depthUnit: 'base',
    depthLayout: 'showAll',
    depthPrecision: 0.1,
    isExpandKline: false,
    allSymbols: [],
    klinePeriod: '1h',
    maxSlippage: '8.00',
    isShowOrderConfirm: true
  },
}

export const futuresTradePreferencesSlice = createSlice({
  name: 'futuresTradePreferencesSetting',
  initialState: initialStateTradeConfig,
  reducers: {
    updateTradePreferences: (
      state,
      action: PayloadAction<Partial<FuturesTradePreferencesState['preferences']>>
    ) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      }
    },
    updateAllSymbols: (state, action: PayloadAction<ISymbolList[]>) => {
      state.preferences.allSymbols = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      localStorage.removeItem('persist:futuresTradePreferences')
    })
  },
})

export const { updateTradePreferences, updateAllSymbols } = futuresTradePreferencesSlice.actions
export const futuresTradePreferencesActions = { ...futuresTradePreferencesSlice.actions }

export const selectFuturesTradePreferences = (state: { futuresTradePreferences: FuturesTradePreferencesState }) =>
  state.futuresTradePreferences.preferences

export default futuresTradePreferencesSlice
