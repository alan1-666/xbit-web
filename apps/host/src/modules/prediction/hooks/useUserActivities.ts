import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { userService } from '@/modules/prediction/services/user.service.ts'

import { SortDirection, ActivitySortField } from '@/@generated/gql/graphql-prediction'

export const useUserActivities = (
  userAddress: string,
  options?: {
    includePositions?: boolean
    sortBy?: ActivitySortField
    sortDirection?: SortDirection
    limit?: number
  },
) => {
  const { includePositions, sortBy, sortDirection, limit = 20 } = options || {}
  return useInfiniteQueryWithLoadMore({
    queryKey: ['prediction', 'users', userAddress, 'closed-positions', includePositions, sortBy, sortDirection, limit],
    queryFn: async ({ pageParam }) => {
      const offset = (Number(pageParam) - 1) * limit
      return userService.getUserActivities({
        userAddress,
        limit,
        offset,
        includePositions,
        sortBy,
        sortDirection,
      })
    },
    enabled: !!userAddress,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length >= 20) {
        return allPages.length + 1
      }
      return undefined
    },
    select: (data) => data.pages.flat(),
  })
}
