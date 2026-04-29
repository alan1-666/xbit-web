import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { eventsService } from '@/modules/prediction/services/events.service.ts'

export const useBreakingMarkets = () => {
  return useInfiniteQueryWithLoadMore({
    queryKey: ['prediction', 'breaking-markets'],
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam - 1) * 20
      return eventsService.getBreakingMarkets({
        limit: 20,
        offset,
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
}
