import { Event } from '@/@generated/gql/graphql-prediction'
import { fShortenNumber } from '@/lib/number'
import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import dayjs from 'dayjs'
import { usePredictionMatchCard } from '../../hooks/usePredictionMatchCard'
import { MarketItemContent } from '../event-details/MarketItemContent'
import { MatchCard } from './MatchCard'
import { MatchCardSkeleton } from './MatchCardSkeleton'

interface PredictionMatchCardProps {
  event: Event
  teams?: TeamModel[]
  onClick?: (e: React.MouseEvent) => void
}

export const PredictionMatchCard = ({ event, teams, onClick }: PredictionMatchCardProps) => {
  const { matchCardProps, mainMarket, isLoading } = usePredictionMatchCard({ event, teams })

  if (isLoading) {
    return <MatchCardSkeleton />
  }

  return (
    <MatchCard
      slug={event.slug || '#'}
      live={!!event.live}
      startTime={event.live ? 'LIVE' : dayjs(event.startTime).format('HH:mm')} 
      volume={fShortenNumber(event.volume || '0')}
      teams={matchCardProps.teams}
      odds={matchCardProps.odds}
      event={event}
      sourceTeams={teams}
      onClick={onClick}
    >
      {mainMarket && <MarketItemContent market={mainMarket} />}
    </MatchCard>
  )
}
