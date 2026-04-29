import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type SortByField =
  | 'token'
  | 'marketCap'
  | 'price'
  | 'liquidity'
  | 'change24h'
  | 'holders'
  | 'txs'
  | 'volume'
  | 'age'
  | 'favoriteAt'
  | 'volume24h'

export type SortBy = {
  field: SortByField
  direction: 'asc' | 'desc'
}

type XStockTab = 'watchlist' | 'popular' | 'gainers' | 'losers' | 'volume' | 'marketCap'

export interface XStocksState {
  sorts: Record<XStockTab, SortBy>
}

const initialState: XStocksState = {
  sorts: {
    watchlist: { field: 'favoriteAt', direction: 'desc' },
    popular: { field: 'liquidity', direction: 'desc' },
    gainers: { field: 'change24h', direction: 'desc' },
    losers: { field: 'change24h', direction: 'asc' },
    volume: { field: 'volume24h', direction: 'desc' },
    marketCap: { field: 'marketCap', direction: 'desc'},
  },
}

const xstocksSlice = createSlice({
  name: 'xstocks',
  initialState,
  reducers: {
    setSortBy(state, action: PayloadAction<{ tab: XStockTab; sortBy: SortBy }>) {
      const { tab, sortBy } = action.payload
      state.sorts[tab] = sortBy
    },
  },
})

export const xstocksActions = xstocksSlice.actions
export const xstocksReducer = xstocksSlice.reducer
export default xstocksSlice
