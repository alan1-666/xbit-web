import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { eventsService } from '@/modules/prediction/services/events.service.ts'

const LIMIT = 20

export const useSportGames = (slug: string) => {
  return useInfiniteQueryWithLoadMore({
    queryKey: ['prediction', 'sports', 'games', 'live'],
    queryFn: ({ pageParam }) => {
      const offset = (pageParam - 1) * LIMIT
      return eventsService.getEventsByCategory({
        limit: LIMIT,
        offset,
        filter: {
          tagSlug: slug,
          active: true,
          closed: false,
          archived: false,
        },
      })
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
