import { useNewestEvents } from '@/modules/prediction/hooks/useNewestEvents.ts'
import { EventsList } from '@/modules/prediction/components/shared/EventsList.tsx'
import { useNewEventSubscription } from '@/modules/prediction/hooks/useNewEventSubscription.ts'

export const NewPage = () => {
  const { data, isPending, loadMore, hasNextPage } = useNewestEvents()
  useNewEventSubscription()
  return <EventsList isLoading={isPending} data={data || []} loadMore={loadMore} hasNextPage={hasNextPage} />
}
