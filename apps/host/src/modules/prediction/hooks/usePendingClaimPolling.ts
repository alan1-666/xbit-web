import { userService } from '@/modules/prediction/services/user.service'
import type { RelayerStatusResponse } from '@/modules/prediction/types'
import {
  markPendingClaimShouldPoll,
  removePendingClaim,
  selectPendingClaimsByWallet,
  type PendingClaim,
} from '@/redux/modules/predictionClaimedBalance.slice'
import { useAppSelector, type RootState } from '@/redux/store'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import { useHandleClaimStatus } from './useHandleClaimStatus'
import { findPendingClaimByTxIdentifiers } from './claimTxMatcher'
import { useDispatch } from 'react-redux'
import { setClaimStatus } from '@/redux/modules/claimStatuses.slice'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const FALLBACK_POLL_DELAY_MS = 20_000

/**
 * Poll relayer status cho các pending claims (fallback khi không có MQTT).
 */
export const usePendingClaimPolling = (proxyWallet?: string): PendingClaim[] => {
  const { handleClaimStatus } = useHandleClaimStatus()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const pendingClaims = useAppSelector((state: RootState) => selectPendingClaimsByWallet(state, proxyWallet || ''))
  const waitingPendingClaims = useMemo<PendingClaim[]>(
    () => pendingClaims.filter((claim: PendingClaim) => !claim.isConfirmed),
    [pendingClaims],
  )
  const shouldPoll = useAppSelector((state: RootState) => state.predictionClaimedBalance.shouldPoll)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-start polling nếu MQTT không tới sau 30s kể từ khi có pending
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (waitingPendingClaims.length === 0 || shouldPoll) return

    timerRef.current = setTimeout(() => {
      dispatch(markPendingClaimShouldPoll(true))
    }, FALLBACK_POLL_DELAY_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [waitingPendingClaims.length, shouldPoll, dispatch])

  // Ngắt polling khi không còn pending claim
  useEffect(() => {
    if (shouldPoll && waitingPendingClaims.length === 0) {
      dispatch(markPendingClaimShouldPoll(false))
    }
  }, [shouldPoll, waitingPendingClaims.length, dispatch])

  const { data, error } = useQuery({
    queryKey: [
      'prediction',
      'relayer-status-batch',
      proxyWallet,
      waitingPendingClaims.map((p) => p.transactionHash).sort(),
    ],
    queryFn: async (): Promise<RelayerStatusResponse[]> => {
      const txIds = waitingPendingClaims.map((p) => p.transactionHash)
      if (txIds.length === 0) return []
      const res = await userService.getRelayerStatus({ transactionIds: txIds })
      return res || []
    },
    enabled: shouldPoll,
    refetchInterval: 3000,
  })

  useEffect(() => {
    if (!data || data.length === 0) return
    data.forEach((tx) => {
      const claim = findPendingClaimByTxIdentifiers(waitingPendingClaims, [tx.transactionHash, tx.transactionId])
      if (!claim) return

      if (tx.state) {
        handleClaimStatus(tx.state, claim.transactionHash, claim)
      }
    })

    dispatch(markPendingClaimShouldPoll(false))
  }, [data, waitingPendingClaims, handleClaimStatus])

  useEffect(() => {
    if (!error || waitingPendingClaims.length === 0) return
    console.error('[claim][polling] relayer status error', error)
    waitingPendingClaims.forEach((claim) => {
      dispatch(removePendingClaim({ transactionHash: claim.transactionHash }))
      dispatch(setClaimStatus({ conditionId: claim.conditionId, tokenId: claim.tokenId, status: 'failed' }))
    })
    toast.error(t('prediction.claim.failed'))
  }, [error, waitingPendingClaims, dispatch, t])

  return waitingPendingClaims
}
