import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { TradeFilterType } from '@/@generated/gql/graphql-prediction.ts'

const PAGE_SIZE = 100
const MAX_PAGE = 1

export interface UseEventTradeOptions {
  user?: string
  eventId?: number
  conditionId?: string
  filterType?: TradeFilterType
  enabled?: boolean
}

export const useEventTradeActivities = (options: UseEventTradeOptions) => {
  const { eventId, conditionId, filterType, user, enabled = true } = options

  return useInfiniteQueryWithLoadMore({
    queryKey: ['prediction', 'trades', user, eventId, conditionId, filterType],
    queryFn: async ({ pageParam }) => {
      const offset = (Number(pageParam) - 1) * PAGE_SIZE
      return userService.getTrades({
        eventId: [eventId].filter(Boolean) as number[],
        conditionIDs: conditionId ? [conditionId] : undefined,
        limit: PAGE_SIZE,
        offset,
        filterType,
        user,
      })
    },
    enabled: enabled && (!!eventId || !!(conditionId)),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === PAGE_SIZE && allPages.length < MAX_PAGE) {
        return allPages.length + 1
      }
      return undefined
    },
    select: (data) => data.pages.flat(),
  })
}
