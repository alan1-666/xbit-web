import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import { useMemo } from 'react'
import { IconCheckCircle } from '@components/icon/solid/IconCheckCircle.tsx'
import { IconXCircle } from '@components/icon/solid/IconXCircle.tsx'
import { Link } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'

export interface ClosedEventMarketsProps {
  event: EventModel
}

export const ClosedEventMarkets = (props: ClosedEventMarketsProps) => {
  const { event } = props
  const allMarkets = useMemo(() => event.markets || [], [event])

  const winningMarket = useMemo(() => {
    return allMarkets.find((market) => market.outcomePrices?.[0] === '1')
  }, [allMarkets])

  const isYes = winningMarket?.outcomePrices?.[0] === '1'

  const title = useMemo(() => {
    if (winningMarket) {
      return winningMarket.groupItemTitle || winningMarket.outcomes[0]
    }
    const firstMarket = allMarkets[0]
    return firstMarket?.outcomePrices?.[0] === '1' ? firstMarket.outcomes[0] : firstMarket?.outcomes[1]
  }, [winningMarket])

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex items-center justify-between gap-2 border w-full rounded-[8px] p-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to={NAVIGATIONS.prediction.eventDetails(event.slug || '')}
            className="text-xs font-medium text-white max-w-40 sm:max-w-105 lg:max-w-30 truncate hover:underline"
          >
            {title}
          </Link>
        </div>
        <div className="flex gap-1 items-center shrink-0">
          {isYes ? <IconCheckCircle className="size-5" /> : <IconXCircle className="size-5" />}
        </div>
      </div>
    </div>
  )
}
