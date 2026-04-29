import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'

export interface PendingClaim {
  walletAddress: string
  amount: number
  transactionHash: string
  conditionId: string
  tokenId: string
  oldTotalPositionValue: number
  oldUsdcBalance: number
  claimedAt: number // Timestamp in milliseconds
  isConfirmed?: boolean
  /** All positions included in this batch claim (for batch claims) */
  positions?: Array<{ conditionId: string; tokenId: string }>
}

interface ClaimedBalanceState {
  pendingClaims: PendingClaim[]
  shouldPoll: boolean
}

const initialState: ClaimedBalanceState = {
  pendingClaims: [],
  shouldPoll: false,
}

// TTL: 30 seconds — after this the pending claim expires and real API data takes over
export const PENDING_CLAIM_TTL_MS = 30000

const pruneExpired = (claims: PendingClaim[]) => claims.filter((c) => Date.now() - c.claimedAt < PENDING_CLAIM_TTL_MS)
const normalizeWallet = (walletAddress: string) => walletAddress.trim().toLowerCase()

const predictionClaimedBalanceSlice = createSlice({
  name: 'predictionClaimedBalance',
  initialState,
  reducers: {
    addPendingPayout: (state, action: PayloadAction<Omit<PendingClaim, 'claimedAt'>>) => {
      state.pendingClaims = pruneExpired(state.pendingClaims)
      const newClaim = {
        ...action.payload,
        claimedAt: Date.now(),
      }

      const existsIndex = state.pendingClaims.findIndex((c) => c.transactionHash === action.payload.transactionHash)

      if (existsIndex >= 0) {
        // Update existing claim if somehow duplicate hash
        state.pendingClaims[existsIndex] = newClaim
      } else {
        state.pendingClaims.push(newClaim)
      }
    },
    removePendingClaim: (state, action: PayloadAction<{ transactionHash: string }>) => {
      state.pendingClaims = pruneExpired(state.pendingClaims)
      state.pendingClaims = state.pendingClaims.filter((c) => c.transactionHash !== action.payload.transactionHash)
    },
    markPendingClaimShouldPoll: (state, action: PayloadAction<boolean>) => {
      state.shouldPoll = action.payload
    },
    clearAllPendingClaims: (state) => {
      state.pendingClaims = []
    },
  },
})

export const { addPendingPayout, removePendingClaim, markPendingClaimShouldPoll, clearAllPendingClaims } =
  predictionClaimedBalanceSlice.actions

export default predictionClaimedBalanceSlice.reducer

/** Selector that returns pending claims for a wallet without TTL pruning (used by fallback polling) */
export const selectPendingClaimsByWallet = createSelector(
  [
    (state: RootState) => state.predictionClaimedBalance.pendingClaims,
    (_state: RootState, walletAddress: string) => walletAddress,
  ],
  (claims, walletAddress) => {
    const normalizedWalletAddress = normalizeWallet(walletAddress)
    if (!normalizedWalletAddress) return []
    return claims.filter((c: any) => normalizeWallet(c.walletAddress) === normalizedWalletAddress)
  },
)

/** Selector that returns only non-expired pending claims for a specific wallet address */
export const selectActivePendingClaims = createSelector(
  [
    (state: RootState) => state.predictionClaimedBalance.pendingClaims,
    (_state: RootState, walletAddress: string) => walletAddress,
  ],
  (claims, walletAddress) => {
    const normalizedWalletAddress = normalizeWallet(walletAddress)
    if (!normalizedWalletAddress) return []
    return pruneExpired(claims).filter((c) => normalizeWallet(c.walletAddress) === normalizedWalletAddress)
  },
)
