import { Configs } from '@const/configs.ts'
import { createSlice } from '@reduxjs/toolkit'

export interface AssetsState {
  memeChainId: number
}

const initialState: AssetsState = {
  memeChainId: Configs.getDefaultPortfolioChain(),
}

export const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setMemeChainId: (state, action) => {
      state.memeChainId = action.payload
    },
  },
})

export const assetsActions = assetsSlice.actions

export const assetsReducer = assetsSlice.reducer
