import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { REHYDRATE, RehydrateAction } from 'redux-persist'

export interface FuturesTradeConfig {
  leverage: string
  positionMode: 'cross' | 'isolated'
  depthTick: number
  isFavorite: boolean 
}

export interface FuturesTradeConfigState {
  tradeConfigs: {
    [symbol: string]: FuturesTradeConfig
  }
}

const defaultConfig = (): FuturesTradeConfig => ({
  leverage: '',
  positionMode: 'cross',
  depthTick: 0,
  isFavorite: false,
})

export const initialStateTradeConfig: FuturesTradeConfigState = {
  tradeConfigs: {
    BTC: defaultConfig(),
  },
}

export const futuresTradeConfigsSlice = createSlice({
  name: 'futuresTradeConfigSetting',
  initialState: initialStateTradeConfig,
  reducers: {
    updateFuturesTradeConfig: (
      state,
      action: PayloadAction<{ symbol: string; config: Partial<FuturesTradeConfig> }>
    ) => {
      const { symbol, config } = action.payload
      if (!state.tradeConfigs[symbol]) {
        state.tradeConfigs[symbol] = defaultConfig()
      }
      state.tradeConfigs[symbol] = {
        ...state.tradeConfigs[symbol],
        ...config,
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      localStorage.removeItem('persist:futuresTradeConfigs')
    })
  },
})

export const futuresTradeConfigSelector = (symbol: string) =>
  createSelector(
    [(state: { futuresTradeConfigs: FuturesTradeConfigState }) => state.futuresTradeConfigs.tradeConfigs],
    (configs) => configs[symbol] ?? defaultConfig()
  )

export const allFuturesTradeConfigsSelector = createSelector(
  [(state: { futuresTradeConfigs: FuturesTradeConfigState }) => state.futuresTradeConfigs.tradeConfigs],
  (configs) => configs
)

export const { updateFuturesTradeConfig } = futuresTradeConfigsSlice.actions
export const futuresTradeConfigActions = { ...futuresTradeConfigsSlice.actions }

export default futuresTradeConfigsSlice
