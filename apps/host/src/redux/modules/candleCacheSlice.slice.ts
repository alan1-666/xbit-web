// redux/modules/candleCache.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Candle {
  t: number // open millis
  T: number // close millis
  s: string // coin
  i: string // interval
  o: string // open price
  c: string // close price
  h: string // high price
  l: string // low price
  v: string // volume (base unit)
  n: number // number of trades
}
interface CachedCandle {
  data: Candle
  timestamp: number
}

interface CandleCacheState {
  [baseCoin: string]: CachedCandle
}

const CACHE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

const initialState: CandleCacheState = {}

const candleCacheSlice = createSlice({
  name: 'candleCache',
  initialState,
  reducers: {
    setCandleCache: (state, action: PayloadAction<{ baseCoin: string; data: Candle }>) => {
      const { baseCoin, data } = action.payload
      state[baseCoin] = {
        data,
        timestamp: Date.now(),
      }
    },
    clearExpiredCache: (state) => {
      const now = Date.now()
      Object.keys(state).forEach((baseCoin) => {
        if (now - state[baseCoin].timestamp > CACHE_EXPIRY_MS) {
          delete state[baseCoin]
        }
      })
    },
    clearCacheForCoin: (state, action: PayloadAction<string>) => {
      delete state[action.payload]
    },
    clearAllCache: () => initialState,
  },
})

export const { setCandleCache, clearExpiredCache, clearCacheForCoin, clearAllCache } = candleCacheSlice.actions

export const selectCandleCache = (state: { candleCache?: CandleCacheState }) => 
  state?.candleCache || {}

export const selectCachedCandleData =
  (baseCoin: string) =>
  (state: { candleCache?: CandleCacheState }): Candle | null => {
    if (!state?.candleCache || !baseCoin) return null
    const cached = state.candleCache[baseCoin]
    if (!cached) return null

    // Check if cache is expired
    const now = Date.now()
    if (now - cached.timestamp > CACHE_EXPIRY_MS) {
      return null
    }

    return cached.data
  }

export const selectIsCachedDataExpired =
  (baseCoin: string) =>
  (state: { candleCache?: CandleCacheState }): boolean => {
    if (!state?.candleCache || !baseCoin) return true
    
    const cached = state.candleCache[baseCoin]
    if (!cached) return true

    const now = Date.now()
    return now - cached.timestamp > CACHE_EXPIRY_MS
  }

export default candleCacheSlice.reducer