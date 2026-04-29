import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export interface UseFavoriteEventsOptions {
    enabled?: boolean
}

export const useFavoriteEvents = (options?: UseFavoriteEventsOptions) => {
    const { enabled = true } = options || {}
    return useInfiniteQueryWithLoadMore({
        queryKey: QUERY_KEYS_CONFIGS.favorites(),
        queryFn: async ({ pageParam }) => {
            const limit = 20
            const offset = (pageParam - 1) * limit
            return eventsService.getFavoriteEvents({
                limit,
                offset,
            })
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 20) return undefined
            return allPages.length + 1
        },
        select: (data) => {
            return data.pages.flat()
        },
        enabled: enabled,
    })
}
