import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { usePendingDeductions } from '@/modules/prediction/hooks/usePendingDeductions.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { PositionModel } from '@/modules/prediction/models/PositionModel.ts'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { useMemo } from 'react'
import { mergePendingOrdersIntoPositions, usePendingOrdersByMarkets } from './usePendingPositions'

export const useEventPositions = (eventId: string, marketIds?: string[]) => {
  const proxyWallet = useProxyWallet()
  const pendingOrders = usePendingOrdersByMarkets(marketIds)

  const query = useInfiniteQueryWithLoadMore({
    queryKey: QUERY_KEYS_CONFIGS.userPositions(proxyWallet, eventId, {}),
    enabled: !!eventId && !!proxyWallet,
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam - 1) * 20
      return userService.getCurrentPositions({
        userAddress: proxyWallet,
        limit: 20,
        offset: offset,
        filter: {
          eventId: [eventId],
          redeemable: false,
        },
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 20) {
        return allPages.length + 1
      }
      return undefined
    },
    select: (data) => data.pages.flat(),
  })

  const mergedData = useMemo(() => {
    return mergePendingOrdersIntoPositions(query.data || [], pendingOrders)
  }, [pendingOrders, query.data])

  return { ...query, data: mergedData }
}

export const useEventPositionsWithDeductions = (eventId: string) => {
  const { data: allPositions = [], isPending: isPositionsLoading, ...rest } = useEventPositions(eventId)
  const { data: pendingDeductions = [], isPending: isPendingDeductionsLoading } = usePendingDeductions()

  const isPending = isPositionsLoading || isPendingDeductionsLoading

  const positionsData = useMemo<PositionModel[]>(() => {
    if (isPending) return allPositions

    return allPositions.map((position) => {
      const outcome = position.outcomeIndex === 0 ? 'YES' : 'NO'
      const deductions = pendingDeductions.filter(
        (deduction) => deduction.marketId === position.marketId && deduction.outcome === outcome,
      )
      const totalPendingShares = deductions.reduce((sum, deduction) => sum + deduction.pendingShareAmount, 0)
      return {
        ...position,
        size: position.size - totalPendingShares,
      }
    })
  }, [allPositions, isPending, pendingDeductions])

  return {
    data: positionsData,
    isPending: isPositionsLoading,
    ...rest,
  }
}
