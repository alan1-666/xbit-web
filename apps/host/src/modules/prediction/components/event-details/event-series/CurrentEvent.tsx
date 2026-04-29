import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatEventDate } from './utils'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useMemo } from 'react'
import SeriesTooltipContent from './SerieTooltipContent'
import dayjs from 'dayjs'

export const CurrentEvent = () => {
  const { event } = useEventDetailsPageContext()
  const recurrence = useMemo(() => {
    const series = event?.series?.[0]
    if (!series) return null
    return series.recurrence
  }, [event?.series])
  if (!event) return null

  const isDifferentDayEvent = useMemo(() => {
    if (!event.endDate) return false
    const endDate = new Date(event.endDate)
    const now = new Date()
    return (
      endDate.getDate() !== now.getDate() ||
      endDate.getMonth() !== now.getMonth() ||
      endDate.getFullYear() !== now.getFullYear()
    )
  }, [event.endDate])
  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-impartal whitespace-nowrap">
            <span className="font-medium text-sm line-clamp-2">
              Ended: {formatEventDate(recurrence, event.endDate || '')}{' '}
              {isDifferentDayEvent ? dayjs(event.endDate).format('MMM DD') : ''}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="px-3 py-1 w-fit bg-[#191919] border border-[#ECECED0A]">
          <SeriesTooltipContent endDate={event.endDate || ''} status="ended" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
