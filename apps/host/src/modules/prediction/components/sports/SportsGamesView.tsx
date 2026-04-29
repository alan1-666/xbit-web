import { PredictionMatchCard } from './PredictionMatchCard'
import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import { Event } from '@/@generated/gql/graphql-prediction'
import { useMemo } from 'react'
import { MatchCardSkeleton } from './MatchCardSkeleton'
import { formatDateHeader } from '@/lib/utils'

interface SportsGamesViewProps {
  events: Event[]
  teams?: TeamModel[]
  isLoading?: boolean
}

// Skeleton Header Component
const MatchHeaderSkeleton = () => (
  <div className="h-11 flex items-center mb-4">
    <div className="h-6 w-32 bg-[#2C3038] rounded animate-pulse" />
  </div>
)

type ListItem = { type: 'header'; date: string } | { type: 'event'; data: Event }

export const SportsGamesView = ({ events, teams, isLoading }: SportsGamesViewProps) => {
  // Group events by date
  const items = useMemo(() => {
    if (isLoading) return []

    const grouped = events.reduce(
      (groups, event) => {
        const dateHeader = formatDateHeader(event.startTime || event.startDate)
        if (!groups[dateHeader]) {
          groups[dateHeader] = []
        }
        groups[dateHeader].push(event)
        return groups
      },
      {} as Record<string, Event[]>,
    )

    const flatList: ListItem[] = []
    Object.entries(grouped).forEach(([date, groupEvents]) => {
      flatList.push({ type: 'header', date })
      groupEvents.forEach((event) => {
        flatList.push({ type: 'event', data: event })
      })
    })
    return flatList
  }, [events, isLoading])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((group) => (
          <div key={group}>
            <MatchHeaderSkeleton />
            <div className="space-y-4">
              <MatchCardSkeleton />
              <MatchCardSkeleton />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) =>
        item.type === 'header' ? (
          <h3 key={`header-${item.date}`} className="text-white font-bold text-lg mt-6 mb-3">
            {item.date}
          </h3>
        ) : (
          <div key={`event-${item.data.id}`} className="mb-2">
            <PredictionMatchCard event={item.data} teams={teams} />
          </div>
        ),
      )}
    </div>
  )
}
