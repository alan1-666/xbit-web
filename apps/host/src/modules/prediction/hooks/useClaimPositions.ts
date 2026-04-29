import { userService } from '@/modules/prediction/services/user.service'
import { addPendingPayout } from '@/redux/modules/predictionClaimedBalance.slice'
import { setClaimStatus } from '@/redux/modules/claimStatuses.slice'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createClaimBatchId, registerClaimBatch, type ClaimBatchSummary } from './claimBatchTracker'
import type { ClaimResults, ClaimStatus, FilteredClaimableData } from './claimablePositions.types'

type Params = {
  filteredData: FilteredClaimableData
  claimStatuses: Record<string, { status: ClaimStatus; updatedAt: number }>
  proxyWallet?: string
  dispatch: ReturnType<typeof import('react-redux').useDispatch>
  queryClient: ReturnType<typeof useQueryClient>
  setPauseRefetch: (value: boolean) => void
}

type ClaimMutationParams = {
  targetPositionKeys?: string[]
}

export const useClaimPositions = ({
  filteredData,
  claimStatuses,
  proxyWallet,
  dispatch,
  queryClient,
  setPauseRefetch,
}: Params) => {
  const [claimingStatuses, setClaimingStatuses] = useState<Record<string, ClaimStatus>>({})
  const [claimingErrors, setClaimingErrors] = useState<Record<string, string>>({})
  const { t } = useTranslation()

  const resetClaimingStatuses = useCallback(() => {
    setClaimingStatuses({})
    setClaimingErrors({})
  }, [])

  const showClaimResultToast = useCallback(
    ({ succeeded, total }: ClaimBatchSummary) => {
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
    },
    [t],
  )

  const { mutateAsync: runClaim, isPending: isClaiming } = useMutation<ClaimResults, unknown, ClaimMutationParams>({
    mutationFn: async (params): Promise<ClaimResults> => {
      const allPositions = filteredData.positions || []
      const targetKeys = new Set((params?.targetPositionKeys || []).filter(Boolean))

      // Filter out positions already marked succeeded to avoid double-claim
      const succeededSet = new Set(
        Object.entries(claimStatuses || {})
          .filter(([, v]) => v.status === 'succeeded')
          .map(([key]) => key),
      )

      const remaining = allPositions.filter((p) => !succeededSet.has(`${p.conditionId}:${p.tokenId}`))
      const positionsToClaim =
        targetKeys.size > 0
          ? remaining.filter((p) => targetKeys.has(`${p.conditionId}:${p.tokenId}`))
          : remaining

      if (positionsToClaim.length === 0) return { total: 0, succeeded: [], failed: [] }

      const batchId = createClaimBatchId()

      // Clear local errors; status is tracked in claimStatuses slice
      setClaimingStatuses({})
      setClaimingErrors({})

      const results: ClaimResults = {
        batchId,
        total: positionsToClaim.length,
        succeeded: [],
        failed: [] as Array<{ position: (typeof positionsToClaim)[0]; error: string }>,
      }

      // Mark all positions as 'claiming'
      positionsToClaim.forEach((position) => {
        dispatch(setClaimStatus({ conditionId: position.conditionId, tokenId: position.tokenId, status: 'claiming' }))
      })

      try {
        // Single batch API call for all positions
        const res = await userService.claimPositions({
          positions: positionsToClaim.map((p) => ({
            conditionId: p.conditionId,
            tokenId: p.tokenId,
          })),
        })

        const txHash = res?.transactionHash
        if (!txHash) {
          const errorMessage = t('prediction.claim.failed')
          positionsToClaim.forEach((position) => {
            const key = `${position.conditionId}:${position.tokenId}`
            results.failed.push({ position, error: errorMessage })
            setClaimingErrors((prev) => ({ ...prev, [key]: errorMessage }))
            dispatch(setClaimStatus({ conditionId: position.conditionId, tokenId: position.tokenId, status: 'failed' }))
          })
          return results
        }

        // Batch success — all positions share the same txHash
        positionsToClaim.forEach((position) => {
          results.succeeded.push({ position, txHash })
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('prediction.claim.failed')

        positionsToClaim.forEach((position) => {
          const key = `${position.conditionId}:${position.tokenId}`
          results.failed.push({ position, error: errorMessage })
          setClaimingErrors((prev) => ({ ...prev, [key]: errorMessage }))
          dispatch(setClaimStatus({ conditionId: position.conditionId, tokenId: position.tokenId, status: 'failed' }))
        })
      }

      return results
    },
    onSuccess: (results) => {
      if (results.succeeded.length === 0) return

      // Batch returns a single txHash for all positions
      const txHash = results.succeeded[0]?.txHash
      if (!txHash || !proxyWallet) {
        if (results.total > 0) {
          showClaimResultToast({ succeeded: results.succeeded.length, total: results.total })
        }
        return
      }

      // Calculate total amount across all claimed positions
      const totalAmount = results.succeeded.reduce(
        (acc, item) => acc + (item.position.size || item.position.currentValue || 0),
        0,
      )

      const oldUsdcBalance = queryClient.getQueryData<number>(['prediction', 'usdc-balance', proxyWallet]) || 0
      const oldTotalPositionValue =
        queryClient.getQueryData<number>(['prediction', 'users', proxyWallet, 'position-total']) || 0

      // Single pending payout for the entire batch
      dispatch(
        addPendingPayout({
          walletAddress: proxyWallet,
          amount: totalAmount,
          transactionHash: txHash,
          conditionId: results.succeeded[0].position.conditionId,
          tokenId: results.succeeded[0].position.tokenId,
          oldUsdcBalance,
          oldTotalPositionValue,
          isConfirmed: false,
          positions: results.succeeded.map((item) => ({
            conditionId: item.position.conditionId,
            tokenId: item.position.tokenId,
          })),
        }),
      )

      // Pause refetchInterval to prevent stale backend data from overwriting optimistic cache
      setPauseRefetch(true)
      setTimeout(() => {
        setPauseRefetch(false)
      }, 4000)

      const summary = registerClaimBatch({
        batchId: results.batchId || createClaimBatchId(),
        total: 1, // batch API = 1 txHash = 1 trackable unit
        preResolved: results.failed.length,
        txHashes: [txHash],
      })

      if (summary) {
        showClaimResultToast(summary)
      }
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : t('prediction.claim.failed'))
    },
  })

  const claim = useCallback((targetPositionKeys?: string[]) => runClaim({ targetPositionKeys }), [runClaim])

  return { claim, isClaiming, claimingStatuses, claimingErrors, resetClaimingStatuses }
}
