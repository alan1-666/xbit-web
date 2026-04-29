import { useMyActivePositions } from '@/modules/prediction/hooks/useUserActivePositions.ts'
import { useParams } from 'react-router-dom'
import { PositionItem } from './PositionItem'
import { PositionsLoadingSkeleton } from './PositionsLoadingSkeleton'
import { EmptyPositionsState } from './EmptyPositionsState'

export const MyOpenPositions = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const { data, isPending } = useMyActivePositions({ filter: { eventId: [eventId || ''] }, enabled: !!eventId })

  const eventPositions = data || []

  if (isPending) {
    return <PositionsLoadingSkeleton />
  }

  if (eventPositions.length === 0) {
    return <EmptyPositionsState />
  }

  return (
    <div className="space-y-2">
      {eventPositions.map((position) => (
        <PositionItem key={position.conditionId} position={position} />
      ))}
    </div>
  )
}
