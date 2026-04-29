import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { EventsSkeleton } from './event-series/EventsSkeleton'
import { PastEventsDropdown } from './event-series/PastEventsDropdown'
import { UpcomingDropdown } from './event-series/UpcomingDropdown'
import { CurrentEvent } from '@/modules/prediction/components/event-details/event-series/CurrentEvent.tsx'
import useEventSeriesData from '../../hooks/useEventSeriesData'


interface EventSeriesComponentProps {
  seriesId: string
  symbol: string
}

const EventSeriesComponent = ({ seriesId, symbol }: EventSeriesComponentProps) => {
  const {
    event,
    recurrence,
    past,
    upcoming,
    currentEventIsPast,
    prevPastResults,
    eventResults,
    isPending
  } = useEventSeriesData(seriesId, symbol)

  if (isPending) {
    return <EventsSkeleton />
  }

  return (
    <div className="flex items-center gap-3 md:flex-wrap">
      <PastEventsDropdown
        events={past}
        recurrence={recurrence}
        eventResults={eventResults}
        prevPastResults={prevPastResults}
      />
      {currentEventIsPast && event && <CurrentEvent />}
      <UpcomingDropdown events={upcoming} recurrence={recurrence} />
    </div>
  )
}

export const EventSeries = ({ symbol }: { symbol: string }) => {
  const { event, isFetching } = useEventDetailsPageContext()
  const series = event?.series

  if (isFetching) return <EventsSkeleton />
  if (!series?.length) return null

  return <EventSeriesComponent seriesId={series[0].id} symbol={symbol} />
}
