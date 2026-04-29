import { setClaimStatus } from '@/redux/modules/claimStatuses.slice'
import { addPendingPayout, removePendingClaim, type PendingClaim } from '@/redux/modules/predictionClaimedBalance.slice'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { trackClaimTxResult, type ClaimBatchSummary } from './claimBatchTracker'
import { triggerClaimConfetti } from '../components/portfolio/ClaimConfetti'

export const useHandleClaimStatus = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const showClaimResultToast = ({ succeeded, total }: ClaimBatchSummary) => {
    if (succeeded <= 0) {
      toast.error(t('prediction.claim.failed'))
      return
    }

    if (succeeded < total) {
      toast.success(t('prediction.claim.successPartial', { succeeded, total }))
      return
    }

    const successKey = total > 1 ? 'prediction.claim.successAllPlural' : 'prediction.claim.successAll'
    toast.success(t(successKey, { total }))
  }

  const handleClaimStatus = (status: string, txHash: string, pendingClaimObj: PendingClaim) => {
    // Resolve all positions in the batch (fallback to single position for non-batch claims)
    const allPositions = pendingClaimObj.positions?.length
      ? pendingClaimObj.positions
      : [{ conditionId: pendingClaimObj.conditionId, tokenId: pendingClaimObj.tokenId }]

    if (status === 'STATE_CONFIRMED' || status === 'STATE_MINED') {
      dispatch(removePendingClaim({ transactionHash: txHash }))
      // Switch from waiting to confirmed, which re-adds it with a fresh 20s TTL and isConfirmed bit.
      dispatch(addPendingPayout({ ...pendingClaimObj, isConfirmed: true }))

      allPositions.forEach((pos) => {
        dispatch(setClaimStatus({ conditionId: pos.conditionId, tokenId: pos.tokenId, status: 'succeeded' }))
      })

      const summary = trackClaimTxResult({ txHash, isSuccess: true })
      if (summary) {
        // Use actual position count for toast (not tracker's total which is 1 per txHash)
        showClaimResultToast({ succeeded: allPositions.length, total: allPositions.length })
        triggerClaimConfetti()
      }
    } else if (status === 'STATE_FAILED' || status === 'FAILED') {
      dispatch(removePendingClaim({ transactionHash: txHash }))
      allPositions.forEach((pos) => {
        dispatch(setClaimStatus({ conditionId: pos.conditionId, tokenId: pos.tokenId, status: 'failed' }))
      })

      const summary = trackClaimTxResult({ txHash, isSuccess: false })
      if (summary) {
        // showClaimResultToast(summary)
      }
    }
  }

  return { handleClaimStatus }
}
