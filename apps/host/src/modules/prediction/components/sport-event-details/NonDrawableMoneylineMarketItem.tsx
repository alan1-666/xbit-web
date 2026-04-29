import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { BinaryOutcomes } from '@/modules/prediction/components/sport-event-details/BinaryOutcomes.tsx'
import { SportMarketItem } from '@/modules/prediction/components/sport-event-details/SportMarketItem.tsx'
import { SportMarketItemLabel } from '@/modules/prediction/components/sport-event-details/SportMarketItemLabel.tsx'
import { BinaryTeamsOutcomes } from '@/modules/prediction/components/sport-event-details/BinaryTeamsOutcomes.tsx'
import { SportMarketOrderBook } from '@/modules/prediction/components/sport-event-details/SportMarketOrderBook.tsx'

import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'

export interface NonDrawableMoneylineMarketItemProps {
  market: MarketBase
  title?: string
}

import { PLAYER_PROPS_TYPES } from '@/modules/prediction/hooks/useMarketTabs.ts'

export const NonDrawableMoneylineMarketItem = (props: NonDrawableMoneylineMarketItemProps) => {
  const { market, title } = props
  const { isEnded } = useEventDetailsPageContext()

  const isGenericOutcome =
    market.sportsMarketType === 'both_teams_to_score' ||
    (market.sportsMarketType && PLAYER_PROPS_TYPES.includes(market.sportsMarketType))

  return (
    <SportMarketItem itemKey={market.questionID || 'moneyline'}>
      <SportMarketItemLabel
        title={title}
        type={market.sportsMarketType || 'moneyline'}
        volume={market?.volume ? +market.volume : 0}
      />
      {!isEnded && !isGenericOutcome && <BinaryTeamsOutcomes market={market} />}
      {!isEnded && isGenericOutcome && <BinaryOutcomes market={market} showLine={false} />}
      <SportMarketOrderBook market={market} />
    </SportMarketItem>
  )
}
