import { Event } from '@/@generated/gql/graphql-prediction'
import { fShortenNumber } from '@/lib/number'
import { TeamModel } from '@/modules/prediction/models/TeamModel'
import dayjs from 'dayjs'
import { usePredictionMatchCard } from '../../hooks/usePredictionMatchCard'
import TickerItem from './TickerItem'

interface TickerItemContainerProps {
  event: Event
  teams?: TeamModel[]
}

export const TickerItemContainer = ({ event, teams }: TickerItemContainerProps) => {
  const { matchCardProps } = usePredictionMatchCard({ event, teams })

  const isLive = !!event.live
  const startTime = isLive ? 'LIVE' : dayjs(event.startTime).format('h:mm A')

  // Map matchCardProps to TickerItem expected format
  const team1 = matchCardProps.teams[0]
  const team2 = matchCardProps.teams[1]
  const odd1 = matchCardProps.odds.team1
  const odd2 = matchCardProps.odds.team2

  const tickerTeams = [
    {
      name: team1.name,
      price: odd1.value > 0 ? `${odd1.value}¢` : '-',
      logo: team1.logo || '',
    },
    {
      name: team2.name,
      price: odd2.value > 0 ? `${odd2.value}¢` : '-',
      logo: team2.logo || '',
    },
  ]

  return (
    <TickerItem
      status={
        isLive ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> LIVE
          </>
        ) : (
          <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">{startTime}</span>
        )
      }
      statusColor={isLive ? 'text-red-500' : 'text-muted-foreground'}
      volume={fShortenNumber(event.volume || 0)}
      teams={tickerTeams}
    />
  )
}
