import { symbolDexClient } from '@/lib/gql/apollo-client'
import { createThunk } from './common'
import { getCurrencies } from '@/services/swap.service'
import { createSlice } from '@reduxjs/toolkit'
import ls from '@/lib/local-storage.ts'

export const getTokensChains = createThunk('getTokensChains', async (_arg: {}) => {
  const resp = await symbolDexClient.query({
    query: getCurrencies,
  })
  ls.set('tokensChains', resp?.data)
  return resp?.data
})

interface TokensChainsState {
  chains?: Array<{
    chainId: number
    chainImage: string
    chainName: string
    decimals: number
  }>
  tokens?: Array<{
    symbol: string
    name: string
    image: string
    chainList?: Array<{
      chainId: number
      chainImage: string
      chainName: string
      tokenId: string
      decimals: number
      address: string
    }>
  }>
  minBridgeUsd?: string
}

const initialState: TokensChainsState = {}

export const tokensChainsSlice = createSlice({
  name: 'tokensChains',
  initialState,
  reducers: {
    updateTokensChains: (state, action) => {
      return { ...state, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTokensChains.fulfilled, (state, action) => {
      const tokenChains = action.payload
      if (tokenChains?.relayCurrencies) {
        state.chains = tokenChains.relayCurrencies.chains
        state.tokens = tokenChains.relayCurrencies.tokens
        state.minBridgeUsd = tokenChains.relayCurrencies.minBridgeUsd
      }
    })
  },
})
export default tokensChainsSlice.reducer
