import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SymbolInfo {
  baseCoin: string
  quoteCoin: string
  price: string
  markPrice: string
  change: string
  lastTradePrice: string
  szDecimals: number
  maxLeverage: number
  marginTableId: number
  funding: number
}

export interface FuturesCurrentSymbolState {
  symbolInfo: SymbolInfo
}

export const initialCurrentSymbolConfig: FuturesCurrentSymbolState = {
  symbolInfo: {
    baseCoin: '',
    quoteCoin: 'USDC',
    price: "0",
    markPrice: "0",
    change: "0.00",
    lastTradePrice: "0",
    szDecimals: 0,
    maxLeverage: 10,
    marginTableId: 0,
    funding: 0
  },
}

export const futuresCurrentSymbolSlice = createSlice({
  name: 'futuresCurrentSymbol',
  initialState: initialCurrentSymbolConfig,
  reducers: {
    setSymbolInfo: (state, action: PayloadAction<Partial<SymbolInfo>>) => {
      state.symbolInfo = {
        ...state.symbolInfo,
        ...action.payload,
      }
    },
    resetSymbolInfo: (state) => {
      state.symbolInfo = initialCurrentSymbolConfig.symbolInfo
    },
  },
})

export const baseCoinSelector = (state: { futuresCurrentSymbol: FuturesCurrentSymbolState }) =>
  state.futuresCurrentSymbol.symbolInfo.baseCoin


export const quoteCoinSelector = (state: { futuresCurrentSymbol: FuturesCurrentSymbolState }) =>
  state.futuresCurrentSymbol.symbolInfo.quoteCoin

export const priceSelector = (state: { futuresCurrentSymbol: FuturesCurrentSymbolState }) =>
  state.futuresCurrentSymbol.symbolInfo.price

export const coinOptionsSelector = (state: { futuresCurrentSymbol: FuturesCurrentSymbolState }) => {
  const { baseCoin, quoteCoin } = state.futuresCurrentSymbol.symbolInfo
  return [
    { value: quoteCoin, label: quoteCoin },
    { value: baseCoin, label: baseCoin },
  ]
}

export const lastTradePriceSelector = (state: { futuresCurrentSymbol: FuturesCurrentSymbolState }) =>
  state.futuresCurrentSymbol.symbolInfo.lastTradePrice

export const symbolInfoSelector = (state: { futuresCurrentSymbol: FuturesCurrentSymbolState }) =>
  state.futuresCurrentSymbol.symbolInfo


export const { setSymbolInfo, resetSymbolInfo } = futuresCurrentSymbolSlice.actions
export const futuresCurrentSymbolActions = { ...futuresCurrentSymbolSlice.actions }

export default futuresCurrentSymbolSlice
