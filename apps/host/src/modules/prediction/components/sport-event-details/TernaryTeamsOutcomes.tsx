import { SportMarketItemRegistration } from '@/modules/prediction/components/sport-event-details/SportMarketItemRegistration.tsx'
import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { MarketOutcome, Outcomes } from '@/modules/prediction/components/sport-event-details/Outcomes.tsx'
import { useCallback, useMemo } from 'react'
import { useCurrentSportEventTeams } from '@/modules/prediction/hooks/useCurrentSportEventTeams.ts'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { useResponsive } from '@/hooks/useResponsive'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'

export interface TernaryTeamsOutcomesProps {
  markets: MarketBase[]
  onSelect: (market: MarketBase) => void
}

export const TernaryTeamsOutcomesImpl = (props: TernaryTeamsOutcomesProps) => {
  const { markets, onSelect } = props
  const { homeTeam, awayTeam, homeTeamAbbreviation, awayTeamAbbreviation } = useCurrentSportEventTeams()
  const { dispatch } = useEventDetailsPageContext()
  const { isDesktop } = useResponsive()

  const handleOnSelectOutcome = useCallback(
    (outcome: MarketOutcome) => {
      const selectedSlug = outcome.key
      // Logic: If mobile, open drawer.

      if (!isDesktop) {
        dispatch(eventDetailsPageActions.setTradeDrawerOpen(true))
      }

      const selectedMarket = markets.find((market) => market.slug === selectedSlug)
      if (selectedMarket) {
        onSelect(selectedMarket)
        // Also ensure we set the outcome if needed?
        // For Drawable, the "Outcome" is actually the Market itself (since it's typically binary Yes/No inside each team market, OR the market IS the team).
        // Let's assume onSelect handles the market selection which might propagate or just be local to that component group.
      }
    },
    [markets, onSelect, dispatch, isDesktop],
  )
  const outcomes = useMemo(() => {
    const [homeMarket, drawMarket, awayMarket] = markets
    return [
      {
        label: homeTeamAbbreviation.toUpperCase(),
        value: `${Math.ceil((homeMarket?.outcomePrices?.[0] ? +homeMarket.outcomePrices[0] : 0) * 100)}¢`,
        key: homeMarket?.slug || 'home',
        color: homeTeam?.color || 'var(--rise)',
      },
      {
        label: 'DRAW',
        value: `${Math.ceil((drawMarket?.outcomePrices?.[0] ? +drawMarket.outcomePrices[0] : 0) * 100)}¢`,
        key: drawMarket?.slug || 'draw',
        color: 'gray',
      },
      {
        label: awayTeamAbbreviation.toUpperCase(),
        value: `${Math.ceil((awayMarket?.outcomePrices?.[0] ? +awayMarket.outcomePrices[0] : 0) * 100)}¢`,
        key: awayMarket?.slug || 'away',
        color: awayTeam?.color || 'var(--fall)',
      },
    ]
  }, [markets, homeTeam, awayTeam, homeTeamAbbreviation, awayTeamAbbreviation])

  return <Outcomes outcomes={outcomes} onSelect={handleOnSelectOutcome} />
}

export const TernaryTeamsOutcomes = (props: TernaryTeamsOutcomesProps) => {
  return (
    <SportMarketItemRegistration slot="outcomes">
      <TernaryTeamsOutcomesImpl {...props} />
    </SportMarketItemRegistration>
  )
}
