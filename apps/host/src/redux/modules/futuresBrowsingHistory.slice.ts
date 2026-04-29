import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface FuturesBrowsingHistoryState {
  symbols: string[]
}

const initialState: FuturesBrowsingHistoryState = {
  symbols: [],
}

export const futuresBrowsingHistorySlice = createSlice({
  name: 'futuresBrowsingHistory',
  initialState,
  reducers: {
    addSymbolToHistory: (state, action: PayloadAction<string>) => {
      const newList = state.symbols.filter((symbol) => symbol !== action.payload)
      newList.unshift(action.payload)
      state.symbols = newList.slice(0, 200) // Keep only the last 200 symbols
    },
    removeSymbolFromHistory: (state, action: PayloadAction<string>) => {
      state.symbols = state.symbols.filter((symbol) => symbol !== action.payload)
    },
    clearBrowsingHistory: (state) => {
      state.symbols = []
    },
  },
})

export const futuresBrowsingHistoryActions = futuresBrowsingHistorySlice.actions
