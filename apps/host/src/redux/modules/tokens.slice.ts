import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface TokenData {
  address: string
  chainId: string | number
  name: string
  symbol: string
  logo: string
  isBlacklisted: boolean
  totalSupply: string
}

type TokenState = Record<string, TokenData>

const initialState: TokenState = {}

export const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setTokenData(state, action: PayloadAction<TokenData>) {
      if (action.payload?.address) {
        state[action.payload.address] = {
          ...state[action.payload.address],
          ...action.payload
        }
      }
    },
    setMultipleTokenData(state, action: PayloadAction<TokenData[]>) {
      action.payload.forEach((token) => {
        if (token?.address) {
          state[token.address] = {
            ...state[token.address],
            ...token
          }
        }
      })
    },
    updateTokenData(state, action: PayloadAction<{ address: string; data: Partial<TokenData> }>) {
      const { address, data } = action.payload
      if (address && state[address]) {
        state[address] = {
          ...state[address],
          ...data
        }
      }
    },
  }
})

export const tokenActions = tokenSlice.actions
export default tokenSlice

// Selectors
export const selectTokenByAddress = (address: string) => (state: { tokens: TokenState }) => {
  if (!address || !state?.tokens) return null
  return state.tokens[address] || null
}

export const selectAllTokens = (state: { tokens: TokenState }) => 
  state?.tokens || {} 