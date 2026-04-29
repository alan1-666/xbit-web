import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { eventsService, DEFAULT_NEW_EVENTS_FILTER, DEFAULT_NEW_EVENTS_SORT } from '@/modules/prediction/services/events.service.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

const LIMIT = 60

export const useNewestEvents = () => {
  return useInfiniteQueryWithLoadMore({
    queryKey: QUERY_KEYS_CONFIGS.new({ filter: DEFAULT_NEW_EVENTS_FILTER, sort: DEFAULT_NEW_EVENTS_SORT }),
    queryFn: async ({ pageParam }) => {
      return eventsService.getNewEvents({
        limit: LIMIT,
        offset: (pageParam - 1) * LIMIT,
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length >= LIMIT) {
        return allPages.length + 1
      }
      return undefined
    },
    select: (data) => data.pages.flat(),
  })
}
