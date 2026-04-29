import { EventCardSkeleton } from '@/modules/prediction/components/shared/EventCardSkeleton.tsx'
import { EventCard } from '@/modules/prediction/components/shared/EventCard.tsx'
import { LoadMoreTrigger } from '@/modules/prediction/components/shared/LoadMoreTrigger.tsx'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import { cn } from '@/lib/utils'
import { BlankState } from '@components/v2/ui-shared/components/BlankState.tsx'
import { TopicTradeEvent } from './TradeEventMonitorSplit'

export interface EventsListProps {
  isLoading: boolean
  data: EventModel[]
  loadMore: () => void
  hasNextPage: boolean
  classNameList?: string
  blankStateText?: string
  topicDataMap?: Map<string, TopicTradeEvent[]>
}

export const EventsList = (props: EventsListProps) => {
  const { isLoading, data, loadMore, hasNextPage, classNameList, blankStateText, topicDataMap } = props
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 lg:grid-cols-2 pc:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 gap-3',
          classNameList,
        )}
      >
        {Array.from({ length: 24 }).map((_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (data.length === 0)
    return (
      <div className="py-20">
        <BlankState text={blankStateText} />
      </div>
    )

  return (
    <div className="pb-9">
      <div
        className={cn(
          'grid grid-cols-1 lg:grid-cols-2 pc:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 gap-3',
          classNameList,
        )}
      >
        {data?.map((event) => {
          const volumeData = topicDataMap?.get(`public/crypto-event/${event.slug}/volume`) || []
          return <EventCard key={event.slug} event={event} volumeData={volumeData} />
        })}
      </div>
      <LoadMoreTrigger onLoadMore={loadMore} hasMore={hasNextPage} />
    </div>
  )
}
