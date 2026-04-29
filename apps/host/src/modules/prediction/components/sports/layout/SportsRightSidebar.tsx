import { usePredictionMatchCard } from '@/modules/prediction/hooks/usePredictionMatchCard'
import { SportOrderForm } from '@/modules/prediction/components/shared/SportOrderForm.tsx'
import { useEffect, useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useSportEventTeams } from '@/modules/prediction/hooks/useSportEventTeams'
import { useSportsSelection } from '@/modules/prediction/contexts/SportsSelectionContext'
import { TeamModel } from '@/modules/prediction/models/TeamModel'

export const SportsRightSidebar = () => {
  const { selectedEvent } = useSportsSelection()

  const activeEvent = selectedEvent || undefined

  const { homeTeam, awayTeam } = useSportEventTeams(activeEvent?.slug || '')

  const eventTeams = useMemo(() => {
    return [homeTeam, awayTeam].filter((t): t is TeamModel => !!t)
  }, [homeTeam, awayTeam])

  const {
    mainMarket,
    isLoading: isLoadingCard,
    foundTeams,
  } = usePredictionMatchCard({
    event: activeEvent,
    teams: eventTeams,
  })

  const [selectedOutcome, setSelectedOutcome] = useState<string>('')

  // Set default selected outcome
  useEffect(() => {
    if (mainMarket?.outcomes?.[0] && !selectedOutcome) {
      setSelectedOutcome(mainMarket.outcomes[0])
    } else if (mainMarket?.outcomes && !mainMarket.outcomes.includes(selectedOutcome)) {
      setSelectedOutcome(mainMarket.outcomes[0])
    }
  }, [mainMarket, selectedOutcome])

  if (isLoadingCard) {
    return (
      <div className="w-[370px] hidden xl:flex flex-col border-l border-border h-[calc(100vh-64px)] overflow-y-auto sticky top-[64px] bg-card p-4 gap-4">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    )
  }

  if (!activeEvent || !mainMarket) {
    return null
  }

  return (
    <div className="w-[370px] hidden xl:flex flex-col border-l border-border h-[calc(100vh-64px)] overflow-y-auto sticky top-[64px] bg-card">
      <div className="p-4">
        <SportOrderForm
          market={mainMarket}
          selectedOutcome={selectedOutcome}
          setSelectedOutcome={setSelectedOutcome}
          event={activeEvent}
          teams={foundTeams}
        />
      </div>
    </div>
  )
}
