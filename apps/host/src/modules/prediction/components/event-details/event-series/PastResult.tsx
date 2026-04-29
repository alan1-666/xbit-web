import { Link } from 'react-router-dom'
import { PriceCandleOutcome, EventBase } from '@/@generated/gql/graphql-prediction.ts'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { SolidArrowDownIcon, SolidArrowUpIcon } from '../../icons'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getTooltipContent } from './utils'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext'
import { showLiveChart } from '../Chart'
import { useResponsive } from '@/hooks/useResponsive'

interface PastResultProps {
  endTime: number
  recurrence: string | null | undefined
  slug: string
  outcome: PriceCandleOutcome
  event?: EventBase
}

export const PastResult = ({ endTime, slug, outcome, recurrence, event }: PastResultProps) => {
  const { event: eventDetail } = useEventDetailsPageContext()
  const { isDesktop } = useResponsive()
  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={NAVIGATIONS.prediction.eventDetails(slug)}
            state={{ series: showLiveChart(eventDetail) ? 'crypto' : 'market', event }}
            className="transition-opacity group-hover:opacity-50 hover:opacity-100!"
            replace
          >
            {outcome == PriceCandleOutcome.Up ? (
              <div className="flex items-center justify-center rounded-full w-5 h-5 shrink-0 cursor-pointer transition-opacity bg-rise">
                <SolidArrowUpIcon />{' '}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-full w-5 h-5 shrink-0 cursor-pointer transition-opacity bg-fall">
                <SolidArrowDownIcon />
              </div>
            )}
          </Link>
        </TooltipTrigger>
        {isDesktop && (
          <TooltipContent className="px-3 py-1 w-fit bg-[#191919] border-b! border-[#ECECED0A]!">
            {getTooltipContent(recurrence, endTime)}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
