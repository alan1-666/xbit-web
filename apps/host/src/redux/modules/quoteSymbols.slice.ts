import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { gqlMeme2 } from '@/lib/gql/apollo-client.ts'
import { getTokenSymbols } from '@services/tokens.service.ts'

export interface QuoteSymbolsState {
  tokens: Record<string, string>
  unknownTokens: string[]
}

const initialState: QuoteSymbolsState = {
  tokens: {},
  unknownTokens: [],
}

const normalizeAddress = (address: string) => address

export const resolveTokenSymbols = createAsyncThunk(
  'quoteSymbols/resolveTokenSymbols',
  async (payload: { chainId: number; addresses: string[] }) => {
    const { chainId, addresses } = payload
    if (addresses.length === 0) {
      return []
    }
    const res = await gqlMeme2.query({
      query: getTokenSymbols,
      variables: {
        chainId,
        tokens: addresses,
      },
    })
    return res.data.getTokenSymbols
  },
)

export const quoteSymbolsSlice = createSlice({
  name: 'quoteSymbols',
  initialState,
  reducers: {
    addTokens: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((addr) => {
        const address = normalizeAddress(addr)
        if (!state.unknownTokens.includes(address) && !state.tokens[address]) {
          state.unknownTokens.push(address)
        }
      })
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resolveTokenSymbols.fulfilled, (state, action) => {
      const resolvedTokens = action.payload
      resolvedTokens.forEach((token) => {
        const address = normalizeAddress(token.token)
        state.tokens[address] = token.symbol
        if (state.unknownTokens.includes(address)) {
          state.unknownTokens = state.unknownTokens.filter((addr) => addr !== address)
        }
      })
    })
  },
})

export const selectQuoteSymbol = (address: string) => (state: { tokenSymbols: QuoteSymbolsState }) => {
  if (!address || !state?.tokenSymbols) return null
  const normalizedAddress = normalizeAddress(address)
  return state.tokenSymbols.tokens[normalizedAddress] || null
}

export const selectUnknownTokens = () => {
  return (state: { tokenSymbols: QuoteSymbolsState }) => {
    return state.tokenSymbols.unknownTokens
  }
}

export const quoteSymbolsActions = quoteSymbolsSlice.actions
