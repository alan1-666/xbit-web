import { Series, PriceCandle } from '@/@generated/gql/graphql-prediction.ts'

import { PastResult } from './PastResult'

interface PastResultsListProps {
  priceResultData: PriceCandle[]
  events?: Series['events']
  recurrence?: string | null
}

export const PastResultsList = ({ priceResultData, events, recurrence }: PastResultsListProps) => {
  if (priceResultData.length === 0 || !events) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span>|</span>
      <div className="flex items-center gap-1 group">
        {priceResultData.map((result) => {
          // Find corresponding event from the events array
          const correspondingEvent = events?.find((e) => e.slug === result.eventSlug || e.id === result.eventSlug)
          return (
            <PastResult
              key={result.eventSlug}
              endTime={result.endTime}
              recurrence={recurrence}
              outcome={result.outcome!}
              slug={result.eventSlug || ''}
              event={correspondingEvent}
            />
          )
        })}
      </div>
    </div>
  )
}
