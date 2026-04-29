import { selectActiveClaimStatuses } from '@/redux/modules/claimStatuses.slice'
import { useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { ClaimablePositionsData } from './claimablePositions.types'
import { useClaimablePositionsQuery } from './useClaimablePositionsQuery'
import { useClaimPositions } from './useClaimPositions'
import { usePendingClaimPolling } from './usePendingClaimPolling'
import { useProxyWallet } from './useProxyWallet'
import { usePendingClaimMqtt } from './usePendingClaimMqtt'

export type { ClaimablePositionsData, ClaimStatus } from './claimablePositions.types'

export const useClaimablePositions = (): Omit<UseQueryResult, 'data'> & { data: ClaimablePositionsData } => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const claimStatusMap = useSelector(selectActiveClaimStatuses)
  const proxyWallet = useProxyWallet()
  const [pauseRefetch, setPauseRefetch] = useState(false)

  usePendingClaimMqtt(proxyWallet)
  usePendingClaimPolling(proxyWallet)

  const { query, filteredData, images } = useClaimablePositionsQuery(proxyWallet, pauseRefetch)

  const { claim, isClaiming, claimingStatuses, claimingErrors, resetClaimingStatuses } = useClaimPositions({
    filteredData,
    claimStatuses: claimStatusMap,
    proxyWallet,
    dispatch,
    queryClient,
    setPauseRefetch,
  })

  const mappedQuery: Omit<typeof query, 'data'> & { data: ClaimablePositionsData } = {
    ...query,
    data: {
      marketsWon: filteredData.totalClaimable,
      totalReturn: 0,
      proceeds: filteredData.totalValue,
      images,
      raw: filteredData,
      claim,
      isClaiming,
      claimingStatuses,
      claimingErrors,
      resetClaimingStatuses,
    },
  }

  return mappedQuery
}
