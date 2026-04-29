import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { PositionSortField, SortDirection, UserPositionFilter } from '@/@generated/gql/graphql-prediction.ts'
import { usePendingDeductions } from '@/modules/prediction/hooks/usePendingDeductions.ts'
import { useMemo } from 'react'

export interface UseMyPositionsOptions {
  filter?: UserPositionFilter
  enabled?: boolean
  refetchInterval?: number | false
  sortBy?: PositionSortField
  sortDirection?: SortDirection
}

export const useMyPositions = (options: UseMyPositionsOptions) => {
  const { filter, enabled, refetchInterval, sortBy, sortDirection } = options
  const userAddress = useProxyWallet()
  return useInfiniteQueryWithLoadMore({
    queryKey: QUERY_KEYS_CONFIGS.myPositions(filter, sortBy, sortDirection),
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam - 1) * 20
      return userService.getCurrentPositions({
        userAddress,
        limit: 20,
        offset,
        filter,
        sortBy,
        sortDirection,
      })
    },
    enabled: !!userAddress && enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 20) {
        return allPages.length + 1
      }
      return undefined
    },
    select: (data) => data.pages.flat(),
    refetchInterval,
  })
}

export const useMyPositionsWithDeductions = (options: UseMyPositionsOptions) => {
  const { data: positions, ...rest } = useMyPositions(options)
  const { data: pendingDeductions } = usePendingDeductions()
  const aggregatedPositions = useMemo(() => {
    if (!pendingDeductions || pendingDeductions.length === 0) return positions
    const newPositions = positions?.slice() || []
    pendingDeductions.forEach((deduction) => {
      const outcomeIndex = deduction.outcome === 'YES' ? 0 : 1
      const matchingPositionIndex = newPositions.findIndex(
        (position) => position.conditionId === deduction.conditionId && position.outcomeIndex === outcomeIndex,
      )
      if (matchingPositionIndex !== -1) {
        const matchingPosition = newPositions[matchingPositionIndex]
        newPositions[matchingPositionIndex] = {
          ...matchingPosition,
          size: matchingPosition.size - deduction.pendingShareAmount,
        }
      } else {
        // If no matching position is found, we can add a new position with negative size to represent the pending deduction
      }
    })
  }, [positions, pendingDeductions])
  return {
    data: aggregatedPositions,
    ...rest,
  }
}
