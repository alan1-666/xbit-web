// cachedAlias.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export type AliasItem = {
  address: string;
  alias: string;
  timestamp: number; // ms since epoch
};

export type CachedAliasState = {
  byAddress: Record<string, AliasItem>;
};

const initialState: CachedAliasState = {
  byAddress: {},
};

const isExpired = (item: AliasItem, now: number) => now - item.timestamp > EXPIRY_MS;

export const cachedAliasSlice = createSlice({
  name: "cachedAlias",
  initialState,
  reducers: {
    // Upsert a single alias; timestamp auto-injected
    upsertAlias: {
      prepare: (payload: { address: string; alias: string; timestamp?: number }) => ({
        payload: {
          address: payload.address,
          alias: payload.alias,
          timestamp: payload.timestamp ?? Date.now(),
        } as AliasItem,
      }),
      reducer: (state, action: PayloadAction<AliasItem>) => {
        const { address, alias, timestamp } = action.payload;
        state.byAddress[address.toLowerCase()] = { address: address.toLowerCase(), alias, timestamp };
      },
    },

    // Optional: bulk upsert (useful if you hydrate many at once)
    upsertMany: {
      prepare: (items: Array<{ address: string; alias: string; timestamp?: number }>) => ({
        payload: items.map((i) => ({
          address: i.address,
          alias: i.alias,
          timestamp: i.timestamp ?? Date.now(),
        })) as AliasItem[],
      }),
      reducer: (state, action: PayloadAction<AliasItem[]>) => {
        for (const item of action.payload) {
          state.byAddress[item.address.toLowerCase()] = {
            address: item.address.toLowerCase(),
            alias: item.alias,
            timestamp: item.timestamp,
          };
        }
      },
    },

    removeAlias: (state, action: PayloadAction<{ address: string }>) => {
      delete state.byAddress[action.payload.address.toLowerCase()];
    },

    // Clear everything that’s older than 10 minutes.
    // Pass `now` for deterministic tests; defaults to Date.now().
    clearExpired: {
      prepare: (now?: number) => ({ payload: now ?? Date.now() }),
      reducer: (state, action: PayloadAction<number>) => {
        const now = action.payload;
        for (const key of Object.keys(state.byAddress)) {
          const item = state.byAddress[key];
          if (item && isExpired(item, now)) delete state.byAddress[key];
        }
      },
    },

    // Optional: nuke all cache
    resetCachedAlias: () => initialState,
  },
});

export const {
  upsertAlias,
  upsertMany,
  removeAlias,
  clearExpired,
  resetCachedAlias,
} = cachedAliasSlice.actions;

export default cachedAliasSlice.reducer;

// ---------- Selectors ----------
export const selectAlias = (state: { cachedAlias: CachedAliasState }, address?: string) => {
  if (!address) return undefined;
  const item = state.cachedAlias.byAddress[address.toLowerCase()];
  if (!item) return undefined;
  return Date.now() - item.timestamp > EXPIRY_MS ? undefined : item.alias;
};

export const selectAliasItem = (state: { cachedAlias: CachedAliasState }, address?: string) => {
  if (!address) return undefined;
  const item = state.cachedAlias.byAddress[address.toLowerCase()];
  if (!item) return undefined;
  return Date.now() - item.timestamp > EXPIRY_MS ? undefined : item;
};

// Return all items that are still valid (not expired)
export const selectAllValidAliases = (state: { cachedAlias: CachedAliasState }) => {
  const now = Date.now();
  return Object.values(state.cachedAlias.byAddress).filter(
    (item) => now - item.timestamp <= EXPIRY_MS
  );
};

// Optional: get even expired ones too
export const selectAllAliases = (state: { cachedAlias: CachedAliasState }) =>
  Object.values(state.cachedAlias.byAddress);
