import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Series } from '@/@generated/gql/graphql-prediction.ts'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu.tsx'
import { ChevronDown } from 'lucide-react'
import EventLinkItem from './EventLinkItem'
import { dayjsCalendarFormat, formatEventDate } from './utils'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext'
import dayjs from 'dayjs'
import { showLiveChart } from '../Chart'

interface UpcomingDropdownProps {
  events: Series['events']
  recurrence?: string | null
}

export const UpcomingDropdown = (props: UpcomingDropdownProps) => {
  const { events, recurrence } = props
  const { event } = useEventDetailsPageContext()
  const { current, more } = useMemo(() => {
    if (!events) {
      return { current: [], more: [] }
    }
    return {
      current: events.slice(0, 3),
      more: events.length > 3 ? events.slice(3) : [],
    }
  }, [events])
  const { eventId } = useParams()
  if (!events || events.length === 0) return null

  const isFarUpcomingEvent = events.findIndex((e) => event?.endDate == e.endDate) > 2
  const isNextDayEvent = dayjs(event?.endDate).isAfter(dayjs().endOf('day'))

  useEffect(() => {
    if (current?.some((e) => e.slug === eventId) || isFarUpcomingEvent) {
      const container = document.getElementById('event-series-container')
      const activeId = current?.some((e) => e.slug === eventId)
        ? current.find((e) => e.slug === eventId)?.id
        : event?.id

      const activeElement = document.getElementById(activeId || '')

      if (!container || !activeElement) return

      const containerRect = container.getBoundingClientRect()
      const activeRect = activeElement.getBoundingClientRect()
      const offset = (container.clientWidth - activeRect.width) / 2
      container.scrollBy({
        left: activeRect.left - containerRect.left - offset,
        behavior: 'smooth',
      })
    }
  }, [current, isFarUpcomingEvent])

  return (
    <div className="flex items-center gap-3">
      {current.map((event) => (
        <EventLinkItem key={event.id} event={event} recurrence={recurrence} isActive={event.slug === eventId} />
      ))}
      {isFarUpcomingEvent && (
        <EventLinkItem
          key={event?.id}
          event={event as any}
          recurrence={recurrence}
          isActive={true}
          isNextDayEvent={isNextDayEvent}
        />
      )}
      {more.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border transition-colors">
              More
              <ChevronDown className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-auto max-h-60 overflow-y-auto no-scrollbar">
            {more.map((upcomingEvent) => (
              <DropdownMenuItem key={upcomingEvent.id} asChild>
                <Link
                  to={NAVIGATIONS.prediction.eventDetails(upcomingEvent.slug || upcomingEvent.id)}
                  state={{ event: upcomingEvent, series: showLiveChart(event) ? 'crypto' : 'market' }}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                  replace
                >
                  <span className="font-medium text-sm line-clamp-2 flex gap-1">
                    {formatEventDate(recurrence, upcomingEvent.endDate || '')}
                    <span className="text-gray-400">&#183;</span>{' '}
                    <span className="text-gray-400">
                      {dayjs(upcomingEvent.endDate).calendar(dayjs(), dayjsCalendarFormat)}
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
