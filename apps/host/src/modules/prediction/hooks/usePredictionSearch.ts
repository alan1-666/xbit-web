import { useMemo } from 'react'
import { EventModel } from '@/modules/prediction/models/EventModel'
import { useTrendingEvents } from './useTrendingEvents'
import { useSearchResult } from './useSearchResult'

export const usePredictionSearch = (search: string, enabled: boolean = true) => {
  const shouldFetchTrending = !search && enabled
  const { data: trendingEventsData, isLoading: trendingEventsLoading } = useTrendingEvents({
    enabled: shouldFetchTrending,
  })

  const shouldFetchSearch = !!search && enabled
  const { data: searchData, isLoading: searchLoading } = useSearchResult(search, {
    enabled: shouldFetchSearch,
  })

  const data = useMemo(() => {
    if (search) {
      return (searchData?.events || []) as EventModel[]
    }
    return trendingEventsData || []
  }, [search, searchData, trendingEventsData])

  const isLoading = search ? searchLoading : trendingEventsLoading

  return { data, isLoading }
}
