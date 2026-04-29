import { keepPreviousData } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { EventFilters } from '../contexts/PredictionFilterContext'
import { EventFrequency, EventSortField, SortDirection } from '@/@generated/gql/graphql-prediction'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { getTagSlugByCategoryValue } from '@/modules/prediction/data/event-category-tabs'

const LIMIT = 60

export const useEventsByCategoryId = (
  categoryId: string,
  filters?: EventFilters,
  /** When on elections page, pass sub-tab value to use its tagSlug (e.g. 'primaries' -> 'house-primary') */
  electionsSubTab?: string,
) => {
  const tagSlug =
    categoryId?.toLowerCase() === 'elections' && electionsSubTab
      ? getTagSlugByCategoryValue(electionsSubTab)
      : categoryId

  return useInfiniteQueryWithLoadMore({
    queryKey: QUERY_KEYS_CONFIGS.eventsList(
      electionsSubTab ? `${categoryId}:${electionsSubTab}` : categoryId,
      { filter: filters },
    ),
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam - 1) * LIMIT
      return eventsService.getEventsByCategory(
        {
          offset: offset,
          limit: LIMIT,
          filter: {
            tagSlug,
            active: filters?.status === 'active',
            closed: filters?.status === 'resolved',
            frequency: filters?.frequency as EventFrequency,
            hideCrypto: filters?.hideCrypto,
            hideSport: filters?.hideSports,
            hideEarning: filters?.hideEarnings,
          },
          sort: {
            field: filters?.sortBy ?? (EventSortField.Volume_24H as EventSortField),
            direction: SortDirection.Desc,
          },
        },
        electionsSubTab === 'trump' ? { preserveMarketOrder: true } : undefined,
      )
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < LIMIT) return undefined
      return allPages.length + 1
    },
    select: (data) => data.pages.flat(),
    placeholderData: keepPreviousData,
  })
}
