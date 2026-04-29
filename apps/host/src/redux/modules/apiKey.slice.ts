import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ApiKeyState {
  apiKey: string | null
}

const initialState: ApiKeyState = {
  apiKey: null,
}

export const apiKeySlice = createSlice({
  name: 'apiKey',
  initialState,
  reducers: {
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload
    },
    clearApiKey: (state) => {
      state.apiKey = null
    },
  },
})

export const { setApiKey, clearApiKey } = apiKeySlice.actions
export default apiKeySlice.reducer 