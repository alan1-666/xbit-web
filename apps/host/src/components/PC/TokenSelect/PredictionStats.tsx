import { formatPercent } from '@/lib/format'
import { getWinningOutcome } from '@/modules/prediction/components/shared/MarketClosedCard'
import { EventModel } from '@/modules/prediction/models/EventModel'
import { MarketModel } from '@/modules/prediction/models/MarketModel'
import { CheckCircle2 } from 'lucide-react'
import { memo } from 'react'

export const PredictionStats = memo(({ event }: { event: EventModel }) => {
  if (!event.markets || event.markets.length === 0) return null

  const bestMarket = event.markets.reduce((prev, current) => {
    const prevPrice = Number(prev?.outcomePrices?.[0] || 0)
    const currentPrice = Number(current?.outcomePrices?.[0] || 0)
    return currentPrice > prevPrice ? current : prev
  }, event.markets[0])

  if (!bestMarket || !bestMarket.outcomePrices?.[0]) return null

  const maxPrice = Number(bestMarket.outcomePrices[0]) * 100
  // @ts-ignore
  const outcomeTitle = bestMarket.groupItemTitle || bestMarket.title || ''

  return (
    <div className="shrink-0 ml-auto flex flex-col items-end group-data-[ended=true]:opacity-40 group-data-[ended=true]:gap-1">
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium text-right whitespace-nowrap text-lg group-data-[ended=true]:text-sm text-white">
          {maxPrice < 1 && maxPrice > 0 ? '<1%' : formatPercent(maxPrice)}
        </p>
      </div>
      <p className="text-xs font-normal leading-none text-text-secondary ml-0.5 whitespace-nowrap text-right text-white/50 max-w-[100px] truncate">
        {outcomeTitle}
      </p>
    </div>
  )
})

export const ClosedEventWinner = memo(({ event }: { event: EventModel }) => {
  if (!event.markets || event.markets.length === 0) {
    return (
      <div className="shrink-0 ml-auto">
        <CheckCircle2 className="w-5 h-5 text-[#00CE89]" />
      </div>
    )
  }

  // Find the winning outcome across all markets using the shared getWinningOutcome logic
  let winnerLabel = ''
  let winnerGroupTitle = ''
  let highestWinnerPrice = -1

  for (const market of event.markets) {
    const winningOutcome = getWinningOutcome(market as MarketModel)
    if (!winningOutcome || !market.outcomePrices) continue

    const winnerPrice = Number(market.outcomePrices[winningOutcome.index] || 0)
    if (winnerPrice > highestWinnerPrice) {
      highestWinnerPrice = winnerPrice
      winnerLabel = winningOutcome.label
      // @ts-ignore
      winnerGroupTitle = market.groupItemTitle || ''
    }
  }

  // Use groupItemTitle if available (multi-market events), otherwise use the outcome label
  const displayTitle = winnerGroupTitle || winnerLabel

  return (
    <div className="shrink-0 ml-auto flex items-center gap-2">
      {displayTitle && <p className="text-xs text-white/50 whitespace-nowrap max-w-[100px] truncate">{displayTitle}</p>}
      <CheckCircle2 className="w-5 h-5 text-[#00CE89] shrink-0" />
    </div>
  )
})
