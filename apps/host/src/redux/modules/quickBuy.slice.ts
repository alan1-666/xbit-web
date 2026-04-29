import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface QuickBuyState {
  amount: string
}

const initialState: QuickBuyState = {
  amount: localStorage.getItem('quickBuyAmount') || ''
}

export const quickBuySlice = createSlice({
  name: 'quickBuy',
  initialState,
  reducers: {
    setQuickBuyAmount: (state, action: PayloadAction<string>) => {
      state.amount = action.payload
      localStorage.setItem('quickBuyAmount', action.payload)
    }
  }
})

export const { setQuickBuyAmount } = quickBuySlice.actions
export default quickBuySlice.reducer 