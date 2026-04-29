import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { SportOrderForm } from '@/modules/prediction/components/shared/SportOrderForm.tsx'
import { useEffect, useCallback } from 'react'
import { useSportEventTeams } from '../../hooks/useSportEventTeams'
import { TeamModel } from '@/modules/prediction/models/TeamModel'
import { eventDetailsPageActions } from '@/modules/prediction/hooks/useEventDetailsPageReducer'

export const SportEventOrderForm = () => {
  const { event, selectedOutcome, dispatch } = useEventDetailsPageContext()
  const market = event?.markets?.find((market) => market.sportsMarketType === 'moneyline')
  const { homeTeam, awayTeam } = useSportEventTeams(event?.slug || '')

  useEffect(() => {
    if (market?.outcomes && market.outcomes.length > 0 && !selectedOutcome) {
      dispatch(eventDetailsPageActions.setSelectedOutcome(market.outcomes[0] as any))
    }
  }, [market?.outcomes, selectedOutcome, dispatch])

  const handleSetSelectedOutcome = useCallback(
    (outcome: string) => dispatch(eventDetailsPageActions.setSelectedOutcome(outcome as any)),
    [dispatch],
  )

  if (!market || !selectedOutcome) return null

  const eventTeams = homeTeam || awayTeam ? [homeTeam, awayTeam].filter((t): t is TeamModel => !!t) : undefined

  return (
    <SportOrderForm
      market={market}
      selectedOutcome={selectedOutcome}
      setSelectedOutcome={handleSetSelectedOutcome}
      event={event}
      teams={eventTeams}
    />
  )
}
