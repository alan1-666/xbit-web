import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { Outcomes } from '@/modules/prediction/components/sport-event-details/Outcomes.tsx'
import { useMemo } from 'react'
import { SportMarketItemRegistration } from '@/modules/prediction/components/sport-event-details/SportMarketItemRegistration.tsx'

export interface BinaryOutcomesProps {
  market: MarketBase | undefined
  showLine?: boolean
}

const BinaryOutcomesImpl = (props: BinaryOutcomesProps) => {
  const { market, showLine } = props
  const outcomes = useMemo(() => {
    if (!market?.outcomes) return []
    const outcomePrices = market?.outcomePrices?.map((price) => +price) || [0, 0]
    return market?.outcomes.map((outcome, index) => {
      return {
        label: outcome,
        value: `${Math.ceil(outcomePrices[index] * 100)}¢`,
        key: outcome,
        color: index === 0 ? 'var(--rise)' : 'var(--fall)',
        line: showLine ? market.line : undefined,
      }
    })
  }, [market, showLine])

  return <Outcomes outcomes={outcomes} />
}

export const BinaryOutcomes = (props: BinaryOutcomesProps) => {
  return (
    <SportMarketItemRegistration slot="outcomes">
      <BinaryOutcomesImpl {...props} />
    </SportMarketItemRegistration>
  )
}
