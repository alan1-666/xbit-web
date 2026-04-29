import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { SearchResult } from '@/@generated/gql/graphql-prediction'

export const useSearchResult = (
  query: string,
  options?: Omit<UseQueryOptions<SearchResult>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['prediction', 'search', query],
    queryFn: async () => {
      return eventsService.search(query)
    },
    enabled: !!query,
    ...options,
  })
}
