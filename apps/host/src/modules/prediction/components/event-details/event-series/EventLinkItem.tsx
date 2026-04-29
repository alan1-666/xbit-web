import { useState, useEffect, memo } from 'react'
import { Link } from 'react-router-dom'
import { EventBase } from '@/@generated/gql/graphql-prediction.ts'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { cn } from '@/lib/utils.ts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatEventDate, isLiveEvent } from './utils'
import SeriesTooltipContent from './SerieTooltipContent'
import dayjs from 'dayjs'
import { showLiveChart } from '../Chart'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext'
import { useResponsive } from '@/hooks/useResponsive'

interface EventLinkItemProps {
  event: EventBase
  recurrence?: string | null
  isActive?: boolean
  isNextDayEvent?: boolean
}

const EventLinkItem = ({ event, recurrence, isActive, isNextDayEvent }: EventLinkItemProps) => {
  const { event: eventDetail } = useEventDetailsPageContext()
  const [isLive, setIsLive] = useState(() => isLiveEvent(event, recurrence))
  const { isDesktop } = useResponsive()

  useEffect(() => {
    if (!event.endDate || !recurrence) return
    setIsLive(isLiveEvent(event, recurrence))

    const intervalId = setInterval(() => {
      const currentlyLive = isLiveEvent(event, recurrence)
      setIsLive((prev) => {
        if (prev !== currentlyLive) return currentlyLive
        return prev
      })

      if (dayjs().isAfter(dayjs(event.endDate))) {
        clearInterval(intervalId)
      }
    }, 10000)

    return () => {
      clearInterval(intervalId)
    }
  }, [event.endDate, event.id, recurrence])

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            key={event.id}
            id={event.id}
            to={NAVIGATIONS.prediction.eventDetails(event.slug || event.id)}
            state={{ event, series: showLiveChart(eventDetail) ? 'crypto' : 'market' }}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md border hover:bg-impartal whitespace-nowrap',
              isActive ? 'bg-impartal' : '',
            )}
            replace
          >
            {isLive ? (
              <div className="relative">
                <div className="w-1.5 h-1.5 bg-[#EA3B4F] rounded-full"></div>
                <div
                  className="absolute -inset-0.5 w-2.5 h-2.5 bg-[#EA3B4F] rounded-full opacity-75"
                  style={{ animation: '1.5s cubic-bezier(0, 0, 0.2, 1) 0s infinite normal none running ping' }}
                ></div>
              </div>
            ) : (
              <></>
            )}
            <span className="font-medium text-sm line-clamp-2 whitespace-nowrap">
              {formatEventDate(recurrence, event.endDate || '')}{' '}
              {((!recurrence || recurrence === 'daily' || recurrence === 'weekly' || recurrence === 'monthly') &&
                !isLive) ||
              isNextDayEvent
                ? dayjs(event.endDate).format('MMM DD')
                : ''}
            </span>
          </Link>
        </TooltipTrigger>
        {isDesktop && (
          <TooltipContent className="px-3 py-1 w-fit bg-[#191919] border border-[#ECECED0A]">
            <SeriesTooltipContent endDate={event.endDate || ''} status={isLive ? 'live' : 'upcoming'} />
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

export default memo(EventLinkItem)
