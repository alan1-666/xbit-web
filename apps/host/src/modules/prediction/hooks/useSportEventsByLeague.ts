import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { eventsService } from '@/modules/prediction/services/events.service.ts'

export const useSportEvents = () => {
  return useInfiniteQueryWithLoadMore({
    queryKey: ['prediction', 'events', 'sports'],
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam - 1) * 20
      return eventsService.getEventsByCategory({
        limit: 20,
        offset,
        filter: {
          tagSlug: 'sports',
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
}
// export const useSportEventsByLeague = () => {
//   return use
// }
