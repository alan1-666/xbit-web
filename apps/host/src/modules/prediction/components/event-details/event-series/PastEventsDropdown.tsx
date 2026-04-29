import { Link } from 'react-router-dom'
import { PriceCandle, PriceCandleOutcome, Series } from '@/@generated/gql/graphql-prediction.ts'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu.tsx'
import { ChevronDown } from 'lucide-react'
import { PastResultsList } from './PastResultsList'
import { dayjsCalendarFormat, formatEventDate } from './utils'
import dayjs from 'dayjs'
import { SolidArrowDownIcon, SolidArrowUpIcon } from '../../icons'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext'
import { showLiveChart } from '../Chart'
import { EventBaseResult } from '@/modules/prediction/hooks/useEventSeriesData'

interface PastEventsDropdownProps {
  events: Series['events']
  recurrence?: string | null
  eventResults: EventBaseResult[]
  prevPastResults: PriceCandle[]
}

export const PastEventsDropdown = (props: PastEventsDropdownProps) => {
  const { events, recurrence, eventResults, prevPastResults } = props
  const { event: eventDetail } = useEventDetailsPageContext()
  if (!events || events.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border transition-colors">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1">
            Past
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-auto max-h-60 overflow-y-auto no-scrollbar">
          {eventResults?.map((event) => (
            <DropdownMenuItem key={event.id} asChild>
              <Link
                to={NAVIGATIONS.prediction.eventDetails(event.slug || event.id)}
                state={{ event, series: showLiveChart(eventDetail) ? 'crypto' : 'market' }}
                className="flex items-start gap-1 p-3 cursor-pointer hover:bg-gray-50"
                replace
              >
                {event.outcome !== null ? (
                  event.outcome == PriceCandleOutcome.Up ? (
                    <div className="flex items-center justify-center rounded-full w-5 h-5 shrink-0 cursor-pointer transition-opacity bg-rise">
                      <SolidArrowUpIcon />{' '}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-full w-5 h-5 shrink-0 cursor-pointer transition-opacity bg-fall">
                      <SolidArrowDownIcon />
                    </div>
                  )
                ) : (
                  <div className="w-5"></div>
                )}
                <span className="font-medium text-sm line-clamp-2 flex gap-1">
                  {formatEventDate(recurrence, event.endDate || '')}
                  <span className="text-gray-400">&#183;</span>{' '}
                  <span className="text-gray-400">{dayjs(event.endDate).calendar(dayjs(), dayjsCalendarFormat)}</span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <PastResultsList events={events} recurrence={recurrence} priceResultData={prevPastResults} />
    </div>
  )
}
