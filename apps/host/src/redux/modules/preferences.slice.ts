import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type PriceChangeColor = 'normal' | 'inverse'

export interface PreferenceState {
  currency: 'native' | 'usdc'
  assetTimeRange: string
  priceChangeColor: PriceChangeColor
}

export const initialState: PreferenceState = {
  currency: 'native',
  assetTimeRange: '1week',
  priceChangeColor: 'normal',
}

export const preferenceSlice = createSlice({
  name: 'preference',
  initialState,
  reducers: {
    updatePreference: (state, action: PayloadAction<Partial<PreferenceState>>) => {
      // Object.keys(action.payload).forEach((key) => {
      //   const objKey = key as keyof PreferenceState
      //   if (objKey in state && action.payload[objKey] !== undefined) {
      //     state[objKey] = action.payload[objKey]
      //   }
      // })
      Object.assign(state, action.payload)
    },
  },
})

export const preferenceActions = { ...preferenceSlice.actions }
export default preferenceSlice
