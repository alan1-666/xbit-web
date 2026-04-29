import { useInfiniteQueryWithLoadMore } from '@/hooks/useInfiniteQueryWithLoadMore'
import { eventsService } from '../services/events.service'

import dayjs from 'dayjs'

const LIMIT = 10
export const useSportLiveGames = (options?: { live?: boolean; fromNow?: boolean; enabled?: boolean }) => {
  const { live, fromNow, enabled = true } = options || {}

  return useInfiniteQueryWithLoadMore({
    queryKey: ['prediction', 'sports', 'games', 'live', live, fromNow],
    queryFn: ({ pageParam }) => {
      const offset = (pageParam - 1) * LIMIT
      return eventsService.getEventsByCategory({
        limit: LIMIT,
        offset,
        filter: {
          tagSlug: 'games',
          active: true,
          closed: false,
          archived: false,
          live: live || undefined,
          startDateFrom: fromNow ? dayjs().toISOString().replace(/\.[0-9]+Z$/, 'Z') : undefined,
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
    enabled,
  })
}
