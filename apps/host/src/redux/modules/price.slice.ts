import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { gqlClient } from '@/lib/gql/apollo-client'
import { createThunk } from './common'
import { getCryptoCurrencyPriceQuery } from '@/services/pairs.service'
import { RootState } from '../store'
import { TYPE_CHAIN } from '@/lib/blockchain'

export interface AuthState {
  // list: CryptoCurrencyPriceDto[]
  list: any
}

const initialState: AuthState = {
  // list: [] as CryptoCurrencyPriceDto[],
  list: {},
}

export const getCryptoCurrencyPrice = createThunk('price/getCryptoCurrencyPrice', async () => {
  const resp = await gqlClient?.query<any>({
    query: getCryptoCurrencyPriceQuery,
    variables: {},
  })
  return resp?.data
})

export const priceSlice = createSlice({
  name: 'price',
  initialState,
  reducers: {
    updateListPrices(state, action: PayloadAction<any>) {
      state.list = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCryptoCurrencyPrice.fulfilled, (state, action) => {
      // state.list = action.payload.getCryptoCurrencyPrice.filter(
      //   (item: CryptoCurrencyPriceDto) => item.symbol === 'ETH' || item.symbol === 'SOL',
      // )
    })
  },
})

// export const selectToken = (state: RootState) => state.auth.token
export const priceActions = { ...priceSlice.actions, getCryptoCurrencyPrice }
export default priceSlice

export const priceChain = (symbol: string) =>
  createSelector([(state: RootState) => state.price.list], (list): number => {
    if (symbol === TYPE_CHAIN.BSC) return list?.['BNB'] || 1
    return list?.[symbol.toUpperCase()] || 1
  })
