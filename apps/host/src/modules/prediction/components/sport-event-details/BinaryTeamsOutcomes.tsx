import { SportMarketItemRegistration } from '@/modules/prediction/components/sport-event-details/SportMarketItemRegistration.tsx'
import { useCurrentSportEventTeams } from '@/modules/prediction/hooks/useCurrentSportEventTeams.ts'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { MarketOutcome, Outcomes } from '@/modules/prediction/components/sport-event-details/Outcomes.tsx'
import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { useMemo } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'

export interface BinaryTeamsOutcomesProps {
  market: MarketBase | undefined
  showLine?: boolean
}

const BinaryTeamsOutcomesImpl = (props: BinaryTeamsOutcomesProps) => {
  const { market, showLine = false } = props
  const { isDesktop } = useResponsive()
  const { homeTeamAbbreviation, awayTeamAbbreviation, homeTeam, awayTeam } = useCurrentSportEventTeams()
  const [homeOutcomePrice, awayOutcomePrice] = market?.outcomePrices || (['0', '0'] as string[])
  const line = Math.abs(market?.line ? +market.line : 0)
  const outcomes: MarketOutcome[] = useMemo(() => {
    return [
      {
        label: homeTeamAbbreviation?.toUpperCase(),
        value: `${Math.ceil(+homeOutcomePrice * 100)}¢`,
        key: 'home',
        color: homeTeam?.color || 'var(--rise)',
        line: showLine ? `+${line}` : undefined,
      },
      {
        label: awayTeamAbbreviation?.toUpperCase(),
        value: `${Math.ceil(+awayOutcomePrice * 100)}¢`,
        key: 'away',
        color: awayTeam?.color || 'var(--fall)',
        line: showLine ? `-${line}` : undefined,
      },
    ]
  }, [
    homeOutcomePrice,
    awayOutcomePrice,
    homeTeamAbbreviation,
    awayTeamAbbreviation,
    homeTeam,
    awayTeam,
    showLine,
    line,
  ])

  const { dispatch } = useEventDetailsPageContext()

  const handleOnSelect = (outcome: MarketOutcome) => {
    dispatch(eventDetailsPageActions.setSelectedOutcome(outcome.label as any))
    if (!isDesktop) {
      dispatch(eventDetailsPageActions.setTradeDrawerOpen(true))
    }
  }

  return <Outcomes outcomes={outcomes} onSelect={handleOnSelect} />
}

export const BinaryTeamsOutcomes = (props: BinaryTeamsOutcomesProps) => {
  return (
    <SportMarketItemRegistration slot="outcomes">
      <BinaryTeamsOutcomesImpl {...props} />
    </SportMarketItemRegistration>
  )
}
