import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { SportMarketItemRegistration } from '@/modules/prediction/components/sport-event-details/SportMarketItemRegistration.tsx'
import { MarketItemContent } from '@/modules/prediction/components/event-details/MarketItemContent.tsx'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { AccordionContent } from '@radix-ui/react-accordion'

export interface SportMarketOrderBookProps {
  market: MarketBase | undefined
}

export const SportMarketOrderBookImpl = (props: SportMarketOrderBookProps) => {
  const { market } = props
  if (!market) return null
  return (
    <AccordionContent>
      <MarketItemContent market={market as MarketModel} />
    </AccordionContent>
  )
}

export const SportMarketOrderBook = (props: SportMarketOrderBookProps) => {
  return (
    <SportMarketItemRegistration slot="details">
      <SportMarketOrderBookImpl {...props} />
    </SportMarketItemRegistration>
  )
}
