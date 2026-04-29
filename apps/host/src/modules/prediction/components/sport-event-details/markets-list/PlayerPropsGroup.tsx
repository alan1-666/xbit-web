import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { NonDrawableMoneylineMarketItem } from '@/modules/prediction/components/sport-event-details/NonDrawableMoneylineMarketItem.tsx'
import { MarketSection } from './MarketSection'

interface PlayerPropsGroupProps {
  type: string // 'points', 'assists', 'rebounds'
}

export const PlayerPropsGroup = ({ type }: PlayerPropsGroupProps) => {
  const { event } = useEventDetailsPageContext()

  const markets = event?.markets?.filter((m) => m.sportsMarketType === type) || []

  if (markets.length === 0) return null
  const getTitle = (market: any) => {
    if (!market.question) return undefined
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
    const parts = market.question.split(typeLabel)
    if (parts.length > 0) {
      return parts[0].trim()
    }
    return market.question
  }

  return (
    <MarketSection>
      <div className="flex flex-col gap-4">
        {markets.map((market) => (
          <NonDrawableMoneylineMarketItem
            key={market.questionID || market.slug}
            market={market}
            title={getTitle(market)}
          />
        ))}
      </div>
    </MarketSection>
  )
}
