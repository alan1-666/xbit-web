import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {  getDecimalPlaces } from '@/lib/utils'

export interface PerpMetaItem {
  szDecimals: number;
  name: string;
  maxLeverage: number;
  marginTableId: number;
}

export interface TickTier {
  tick: number;
  nSigFigs: number | null;
  mantissa: number | null;
}

export interface MarginTier {
  lowerBound: string,
  maxLeverage: number
}

export interface SymbolCtx {
  funding: string;
  openInterest: string;
  prevDayPx: string;
  dayNtlVlm: string;
  premium: string;
  oraclePx: string;
  markPx: string;
  midPx: string;
  impactPxs: [string, string];
  dayBaseVlm: string;
}

export interface FuturesMetaState {
  universe: PerpMetaItem[];
  szMap: Record<string, number>;
  maxLeverageMap: Record<string, number>;
  allTiers: Record<string, TickTier[]>;
  symbolListCtxs: SymbolCtx[];
  pricePrecisionMap: Record<string, number>;
  allMarginTiers: Record<string, MarginTier[]>;
}

export const initialMeta: FuturesMetaState = {
  universe: [],
  szMap: {},
  maxLeverageMap: {},
  allTiers: {},
  symbolListCtxs: [],
  pricePrecisionMap: {},
  allMarginTiers: {}
}

export const futuresMetaSlice = createSlice({
  name: 'futuresMeta',
  initialState: initialMeta,
  reducers: {
    setUniverse: (state, action: PayloadAction<PerpMetaItem[]>) => {
      state.universe = action.payload;

      state.szMap = {};
      state.maxLeverageMap = {};

      for (const item of action.payload) {
        const symbol = item.name
        state.szMap[symbol] = item.szDecimals;
        state.maxLeverageMap[symbol] = item.maxLeverage;
      }
    },

    setAllTiers: (state, action: PayloadAction<Record<string, TickTier[]>>) => {
      state.allTiers = action.payload;

      state.pricePrecisionMap = {};
      for (const symbol in action.payload) {
        const tiers = action.payload[symbol];
        if (tiers && tiers.length > 0) {
          state.pricePrecisionMap[symbol] = getDecimalPlaces(tiers[0].tick);
        }
      }
    },

    setAllMarginTiers: (state, action: PayloadAction<Record<string, MarginTier[]>>) => {
      state.allMarginTiers = action.payload
    },

    setSymbolListCtxs: (state, action: PayloadAction<SymbolCtx[]>) => {
      state.symbolListCtxs = action.payload;
    },
  },
})

export const {
  setUniverse,
  setAllTiers,
  setAllMarginTiers,
  setSymbolListCtxs,
} = futuresMetaSlice.actions;

export const selectSzDecimalsBySymbol = (symbol: string) =>
  (state: { futuresMeta: FuturesMetaState }): number | undefined =>
    state.futuresMeta.szMap[symbol];

export const selectSzMap = (state: { futuresMeta: FuturesMetaState }) =>
  state.futuresMeta.szMap;

export const selectAllPerpMeta = (state: { futuresMeta: FuturesMetaState }) =>
  state.futuresMeta.universe;

export const selectPerpMetaByName = (name: string) =>
  (state: { futuresMeta: FuturesMetaState }) =>
    state.futuresMeta.universe.find(item => item.name === name);

export const selectAllTiers = (state: { futuresMeta: FuturesMetaState }) =>
  state.futuresMeta.allTiers;

export const selectPricePrecisionBySymbol = (symbol: string) =>
  (state: { futuresMeta: FuturesMetaState }): number | undefined =>
    state.futuresMeta.pricePrecisionMap[symbol];

export const selectTiersBySymbol = (symbol: string) =>
  (state: { futuresMeta: FuturesMetaState }): TickTier[] | undefined =>
    state.futuresMeta.allTiers[symbol];

export const selectMaxLeverageBySymbol = (symbol: string) =>
  (state: { futuresMeta: FuturesMetaState }): number | undefined =>
    state.futuresMeta.maxLeverageMap[symbol];

export const selectSymbolListCtxs = (state: { futuresMeta: FuturesMetaState }) =>
  state.futuresMeta.symbolListCtxs;

export const selectSymbolCtxByMarkPx = (markPx: string) =>
  (state: { futuresMeta: FuturesMetaState }) =>
    state.futuresMeta.symbolListCtxs.find(item => item.markPx === markPx);

export default futuresMetaSlice;
