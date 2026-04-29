import { useTrendingEvents } from '@/modules/prediction/hooks/useTrendingEvents.ts'
import { EventsList } from '@/modules/prediction/components/shared/EventsList.tsx'
import { RelatedTags } from '@/modules/prediction/components/events-list/RelatedTags.tsx'
import {
  PredictionFilterProvider,
  usePredictionFilter,
} from '@/modules/prediction/contexts/PredictionFilterContext.tsx'
import { useSearchParams } from 'react-router-dom'
import { EventSortField, SortDirection } from '@/@generated/gql/graphql-prediction.ts'

export const TrendingPageContent = () => {
  const { filters } = usePredictionFilter()
  const [searchParams] = useSearchParams()
  const tag = searchParams.get('tag')
  const { data, isLoading, loadMore, hasNextPage } = useTrendingEvents({
    filters: {
      tagSlug: tag,
      featured: tag ? undefined : filters.sortBy === EventSortField.Volume_24H ? true : undefined,
      frequency: filters.frequency,
      hideCrypto: filters.hideCrypto,
      hideEarning: filters.hideEarnings,
      hideSport: filters.hideSports,
      active: filters.status === 'active' ? true : filters.status === 'resolved' ? false : undefined,
      closed: filters.status === 'active' ? false : filters.status === 'resolved' ? true : undefined,
    },
    sort: {
      field: filters.sortBy,
      direction: SortDirection.Desc,
    },
  })

  return (
    <div className="space-y-3">
      <RelatedTags tagSlug="all" />
      <EventsList isLoading={isLoading} data={data || []} loadMore={loadMore} hasNextPage={hasNextPage} />
    </div>
  )
}

export const TrendingPage = () => {
  return (
    <PredictionFilterProvider>
      <TrendingPageContent />
    </PredictionFilterProvider>
  )
}
