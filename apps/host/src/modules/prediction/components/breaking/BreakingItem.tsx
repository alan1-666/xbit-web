import { useMemo } from 'react'
import { LineChart } from '@/modules/prediction/components/shared/LineChart.tsx'
import { Market } from '@/@generated/gql/graphql-prediction.ts'
import { BreakingIndex } from '@/modules/prediction/components/breaking/BreakingIndex.tsx'
import { BreakingItemAvatar } from '@/modules/prediction/components/breaking/BreakingItemAvatar.tsx'
import { BreakingItemTitle } from '@/modules/prediction/components/breaking/BreakingItemTitle.tsx'
import { BreakingItemPriceChange } from '@/modules/prediction/components/breaking/BreakingItemPriceChange.tsx'
import { ChevronRight } from 'lucide-react'
import { NAVIGATIONS } from '@/lib/navigations'
import { Link } from 'react-router-dom'

export interface BreakingItemProps {
  market: Market
  index: number
}

export const BreakingItem = (props: BreakingItemProps) => {
  const { market, index } = props
  const event = market.__typename === 'Market' ? market.events?.[0] : undefined
  const image = market.image || event?.image
  const chance = useMemo(() => {
    const price = market.outcomePrices?.[0]
    if (!price) return '<1'
    const percent = price * 100
    return percent.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }, [market])
  const priceHistory = useMemo(() => {
    if (!market.priceHistory?.history) return []
    return market.priceHistory.history.map((item) => item.p)
  }, [market])
  return (
    <div className="@container group hover:bg-black/50 relative border border-[#1E1E1E] rounded-[8px] px-3 py-4">
      <div className="flex flex-col gap-2 pl-0 pr-1 relative">
        <div className="flex items-center justify-between cursor-pointer relative">
          <div className="flex-1">
            <div className="flex-1 flex items-center @max-[600px]:items-center">
              <BreakingIndex index={index} />
              <BreakingItemAvatar image={image} />
              <div className="flex-1 min-w-0 flex flex-row items-center xl:items-start justify-between xl:flex-col xl:gap-2">
                <BreakingItemTitle title={market.question || ''} eventSlug={event?.slug || ''} />
                <BreakingItemPriceChange
                  oneDayPriceChange={market.oneDayPriceChange ? +market.oneDayPriceChange : 0}
                  chance={chance}
                />
              </div>
            </div>
          </div>
          <LineChart data={priceHistory} className="w-25 h-8.5 hidden xl:block" />
          <div className="flex gap-4 items-center ml-4">
            <Link to={NAVIGATIONS.prediction.eventDetails(event?.slug || '')}>
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
