import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { cn } from '@/lib/utils.ts'
import { MarketInfo } from '@/modules/prediction/components/shared/order-form/MarketInfo.tsx'

export interface MarketClosedCardProps {
  market?: MarketModel | MarketBase
  className?: string
}

interface WinningOutcome {
  index: number
  label: string
}

export const getWinningOutcome = (market?: MarketModel | MarketBase): WinningOutcome | null => {
  if (!market?.outcomePrices || !market?.outcomes) return null

  const winningIndex = market.outcomePrices.findIndex((price) => +price === 1)

  if (winningIndex === -1) {
    // Find the index of the highest price if no outcome has a price of 1
    const maxPrice = Math.max(...market.outcomePrices.map((price) => +price))
    const maxPriceIndex = market.outcomePrices.findIndex((price) => +price === maxPrice)
    return {
      index: maxPriceIndex,
      label: market.outcomes[maxPriceIndex] || '',
    }
  }

  return {
    index: winningIndex,
    label: market.outcomes[winningIndex] || '',
  }
}

export const MarketClosedCard = (props: MarketClosedCardProps) => {
  const { market, className } = props
  const winningOutcome = getWinningOutcome(market)

  if (!winningOutcome) return null

  const isYes = winningOutcome.index === 0
  const outcomeColorClass = isYes ? 'bg-rise/10 text-rise' : 'bg-fall/10 text-fall'

  return (
    <div className={cn('space-y-4 text-sm', className)}>
      <MarketInfo market={market} showBalance={false} />

      <div className="space-y-2">
        <div className="text-xs text-[#908E98] font-medium">Market Resolved</div>
        <div
          className={cn(
            'h-10.5 flex items-center justify-between rounded-[6px] px-2.5 text-sm font-medium',
            outcomeColorClass,
          )}
        >
          <span>{winningOutcome.label}</span>
          <span>Winner</span>
        </div>
      </div>
    </div>
  )
}
