import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'

export interface ResolvedMarket {
  marketId: string
  resolvedAt: number // timestamp
}

interface ResolvedMarketsState {
  markets: ResolvedMarket[]
}

const initialState: ResolvedMarketsState = {
  markets: [],
}

// TTL: 15 minutes — matching the claimed positions TTL
const RESOLVED_MARKET_TTL_MS = 15 * 60 * 1000

const pruneExpired = (markets: ResolvedMarket[]) =>
  markets.filter((m) => Date.now() - m.resolvedAt < RESOLVED_MARKET_TTL_MS)

const resolvedMarketsSlice = createSlice({
  name: 'resolvedMarkets',
  initialState,
  reducers: {
    addResolvedMarket: (state, action: PayloadAction<string>) => {
      state.markets = pruneExpired(state.markets)
      const marketId = action.payload
      const exists = state.markets.some((m) => m.marketId === marketId)
      if (!exists) {
        state.markets.push({ marketId, resolvedAt: Date.now() })
      }
    },

    clearResolvedMarkets: (state) => {
      state.markets = []
    },
  },
})

export const { addResolvedMarket, clearResolvedMarkets } = resolvedMarketsSlice.actions

export default resolvedMarketsSlice.reducer

/** Selector returning only non-expired resolved market IDs as a Set */
export const selectResolvedMarketIds = createSelector(
  (state: RootState) => state.resolvedMarkets.markets,
  (markets) => new Set(pruneExpired(markets).map((m) => m.marketId)),
)
