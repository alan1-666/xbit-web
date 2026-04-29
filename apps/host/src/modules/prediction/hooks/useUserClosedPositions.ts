import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { ClosedPositionSortField, SortDirection } from '@/@generated/gql/graphql-prediction.ts'

export interface UseUserClosedPositionsOptions {
  sortBy?: ClosedPositionSortField
  sortDirection?: SortDirection
}

export const useUserClosedPositions = (userAddress: string, options: UseUserClosedPositionsOptions = {}) => {
  const { sortBy = ClosedPositionSortField.Realizedpnl, sortDirection = SortDirection.Desc } = options
  return useInfiniteQueryWithLoadMore({
    queryKey: ['prediction', 'users', userAddress, 'closed-positions', sortBy, sortDirection],
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam - 1) * 20
      return userService.getClosedPositions({
        userAddress,
        limit: 20,
        offset,
        sortBy,
        sortDirection,
      })
    },
    enabled: !!userAddress,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 20) {
        return allPages.length + 1
      }
      return undefined
    },
    select: (data) => data.pages.flat(),
  })
}
