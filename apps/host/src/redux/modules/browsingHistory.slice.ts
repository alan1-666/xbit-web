import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BrowsingHistoryState {
  tokens: string[]
}

const initialState: BrowsingHistoryState = {
  tokens: [],
}

export const browsingHistorySlice = createSlice({
  name: 'browsingHistory',
  initialState,
  reducers: {
    addTokenToHistory: (state, action: PayloadAction<string>) => {
      const newList = state.tokens.filter((token) => token !== action.payload)
      newList.unshift(action.payload)
      state.tokens = newList.slice(0, 200) // Keep only the last 200 tokens
    },
    pushTokenToHistory: (state, action: PayloadAction<string>) => {
      if (!state.tokens.includes(action.payload)) {
        state.tokens = [action.payload, ...state.tokens].slice(0, 200)
      }
    },
    removeTokenFromHistory: (state, action: PayloadAction<string>) => {
      state.tokens = state.tokens.filter((token) => token !== action.payload)
    },
    clearBrowsingHistory: (state) => {
      state.tokens = []
    },
  },
})

export const browsingHistoryActions = browsingHistorySlice.actions
