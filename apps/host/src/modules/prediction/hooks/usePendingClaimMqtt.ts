import { usePublicSubscriptionCallback } from '@/hooks/mqtt/usePublicSubscriptionCallback'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { selectPendingClaimsByWallet } from '@/redux/modules/predictionClaimedBalance.slice'
import type { RootState } from '@/redux/store'
import { useAppSelector } from '@/redux/store'
import { useMemo } from 'react'
import { findPendingClaimByTxIdentifiers } from './claimTxMatcher'
import { useHandleClaimStatus } from './useHandleClaimStatus'

/**
 * Listen to MQTT for claim confirmations and fast‑forward pending payouts cleanup.
 * Topic format (public): public/polymarket/position/claim/{user_id}
 * Payload sample:
 * {
 *   type,
 *   relayerTransactionId,
 *   transactionHash,
 *   status, // STATE_CONFIRMED
 *   userId,
 *   walletAddress,
 *   updatedAt
 * }
 */

type ClaimMqttPayload = {
  type?: string
  relayerTransactionId?: string
  transactionHash?: string
  status?: string // example: "STATE_CONFIRMED" or "STATE_FAILED"
  state?: string
  userId?: string | number
  walletAddress?: string
  updatedAt?: string
}

export const usePendingClaimMqtt = (proxyWallet?: string) => {
  const { handleClaimStatus } = useHandleClaimStatus()
  const pendingClaims = useAppSelector((state: RootState) => selectPendingClaimsByWallet(state, proxyWallet || ''))
  const userId = useAppSelector(_userInfo)?.userId

  const topics = useMemo(() => (userId ? [`public/polymarket/position/claim/${userId}`] : []), [userId])

  usePublicSubscriptionCallback<ClaimMqttPayload>(topics, {
    shouldSkip: !userId,
    onMessage: (_, payload) => {
      // console.log('[claim][mqtt] received payload', payload)

      const pendingClaimObj = findPendingClaimByTxIdentifiers(pendingClaims, [
        payload.transactionHash,
        payload.relayerTransactionId,
      ])
      if (!pendingClaimObj) return

      const status = payload.status || payload.state

      if (status) {
        // Always use the identifier stored in Redux (could be relayer tx id or tx hash).
        handleClaimStatus(status, pendingClaimObj.transactionHash, pendingClaimObj)
      }
    },
  })
}
