import { FuturesCard } from './FuturesCard'
import { FuturesCardSkeleton } from './FuturesCardSkeleton'

import { Event } from '@/@generated/gql/graphql-prediction'

interface SportsPropsViewProps {
  events?: Event[]
  isLoading?: boolean
}

export const SportsPropsView = ({ events = [], isLoading }: SportsPropsViewProps) => {
  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <FuturesCardSkeleton key={i} />
          ))}
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {events.map((event, index) => (
        <FuturesCard key={`${event?.slug}_${index}`} event={event} />
      ))}
    </div>
  )
}
