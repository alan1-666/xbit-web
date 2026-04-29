import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { NonDrawableMoneylineMarketItem } from '@/modules/prediction/components/sport-event-details/NonDrawableMoneylineMarketItem.tsx'
import { DrawableMoneylineMarketItem } from '@/modules/prediction/components/sport-event-details/DrawableMoneylineMarketItem.tsx'

export const MoneylineMarketsGroup = ({ type = 'moneyline' }: { type?: string }) => {
  const { event } = useEventDetailsPageContext()
  const moneylineMarkets = event?.markets?.filter((market) => market.sportsMarketType === type)

  if (!moneylineMarkets || moneylineMarkets.length === 0) return null
  if (moneylineMarkets.length === 1) return <NonDrawableMoneylineMarketItem market={moneylineMarkets[0]} />
  return <DrawableMoneylineMarketItem markets={moneylineMarkets} type={type} />
}
