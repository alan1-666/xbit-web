import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import {
  PENDING_CLAIM_TTL_MS,
  removePendingClaim,
  type PendingClaim,
} from '@/redux/modules/predictionClaimedBalance.slice'

/**
 * Clears pending claim snapshots after TTL to avoid stale frozen balances
 * (similar to ClearTimerPendingPosition for orders).
 */
const ClearTimerPendingClaims = () => {
  const pendingClaims = useAppSelector((state) => state.predictionClaimedBalance.pendingClaims)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []

    pendingClaims.forEach((claim: PendingClaim) => {
      const timeElapsed = Date.now() - claim.claimedAt
      const timeLeft = Math.max(0, PENDING_CLAIM_TTL_MS - timeElapsed)

      const timeout = setTimeout(() => {
        // Chỉ clear khi đã được đánh dấu isConfirmed (đã nhận confirm nhưng chưa dọn)
        if (claim.isConfirmed) {
          dispatch(removePendingClaim({ transactionHash: claim.transactionHash }))
        }
      }, timeLeft)

      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [pendingClaims, dispatch])

  return null
}

export default ClearTimerPendingClaims
