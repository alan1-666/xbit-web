import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore'
import { eventsService } from '@/modules/prediction/services/events.service'
import { EventSortField, SortDirection } from '@/@generated/gql/graphql-prediction'

const ELECTIONS_TAG_SLUG = 'world-elections'

const PAGE_SIZE = 24

export const useElectionEvents = () => {
  return useInfiniteQueryWithLoadMore({
    queryKey: ['prediction', 'electionsPage', 'elections', ELECTIONS_TAG_SLUG],
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam - 1) * PAGE_SIZE
      return eventsService.getEventsByCategory({
        offset,
        limit: PAGE_SIZE,
        filter: {
          tagSlug: ELECTIONS_TAG_SLUG,
          active: true,
          closed: false,
        },
        sort: {
          field: EventSortField.Volume_24H,
          direction: SortDirection.Desc,
        },
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return allPages.length + 1
    },
    select: (data) => data.pages.flat(),
  })
}

