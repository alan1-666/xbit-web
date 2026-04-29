import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { sportsService } from '@/modules/prediction/services/sports.service.ts'

const LIMIT = 20

export const useLiveEvents = () => {
  return useInfiniteQueryWithLoadMore({
    queryKey: ['prediction', 'sports', 'games', 'live'],
    queryFn: ({ pageParam }) => {
      const offset = (pageParam - 1) * LIMIT
      return sportsService.getSportLiveEvents(offset, LIMIT)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length >= LIMIT ? allPages.length + 1 : undefined
    },
    select(data) {
      return data.pages.flat()
    },
  })
}
