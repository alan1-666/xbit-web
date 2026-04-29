import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { EventFilter, EventSortField, SortConfig, SortDirection } from '@/@generated/gql/graphql-prediction.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export interface UseTrendingEventsOptions {
  enabled?: boolean
  filters?: EventFilter
  sort?: SortConfig
}

const defaultSort = { field: EventSortField.FeatureOrder, direction: SortDirection.Asc }

const getSort = (tag: string | undefined | null, sort: SortConfig | undefined) => {
  if (tag) return sort
  if (!sort) return defaultSort

  // Default to FeatureOrder if no sort is provided
  if (sort.field === EventSortField.Volume_24H) return undefined
  return sort
}

export const useTrendingEvents = (options?: UseTrendingEventsOptions) => {
  const { filters, enabled = true, sort } = options || {}
  const queryKey = QUERY_KEYS_CONFIGS.trending({ filter: filters, sort: sort || defaultSort })
  return useInfiniteQueryWithLoadMore({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const limit = 60
      const offset = (pageParam - 1) * limit
      const tag = filters?.tagSlug
      return eventsService.getTrendingEvents({
        limit,
        offset,
        filter: filters,
        sort: getSort(tag, sort),
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 60) return undefined
      return allPages.length + 1
    },
    select: (data) => {
      const flatData = data.pages.flat()
      // Deduplicate by ID, keeping first occurrence
      const seen = new Set<string>()
      return flatData.filter((event) => {
        if (seen.has(event.id)) return false
        seen.add(event.id)
        return true
      })
    },
    enabled: enabled,
  })
}
