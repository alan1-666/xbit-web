import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'

export type ClaimUiStatus = 'claiming' | 'succeeded' | 'failed'

type ClaimStatusEntry = {
  status: ClaimUiStatus
  updatedAt: number
}

type ClaimStatusesState = {
  entries: Record<string, ClaimStatusEntry>
}

const CLAIM_STATUS_TTL_MS = 90 * 1000 // 90 seconds

const pruneExpired = (entries: Record<string, ClaimStatusEntry>) => {
  const now = Date.now()
  const pruned: Record<string, ClaimStatusEntry> = {}
  Object.entries(entries).forEach(([key, value]) => {
    if (now - value.updatedAt < CLAIM_STATUS_TTL_MS) {
      pruned[key] = value
    }
  })
  return pruned
}

const initialState: ClaimStatusesState = {
  entries: {},
}

const claimStatusesSlice = createSlice({
  name: 'claimStatuses',
  initialState,
  reducers: {
    setClaimStatus: (
      state,
      action: PayloadAction<{ conditionId: string; tokenId: string; status: ClaimUiStatus }>,
    ) => {
      state.entries = pruneExpired(state.entries)
      const key = `${action.payload.conditionId}:${action.payload.tokenId}`
      state.entries[key] = {
        status: action.payload.status,
        updatedAt: Date.now(),
      }
    },
    clearClaimStatuses: (state) => {
      state.entries = {}
    },
  },
})

export const { setClaimStatus, clearClaimStatuses } = claimStatusesSlice.actions

export default claimStatusesSlice.reducer

export const selectActiveClaimStatuses = createSelector(
  (state: RootState) => state.claimStatuses.entries,
  (entries) => pruneExpired(entries),
)
