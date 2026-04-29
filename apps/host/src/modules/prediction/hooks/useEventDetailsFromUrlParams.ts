import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useEventDetailsWithLocationState } from '@/modules/prediction/hooks/useEventDetailsWithLocationState.ts'

export const useEventDetailsFromUrlParams = () => {
  const params = useParams()
  const eventId = useMemo(() => params.eventId || '', [params.eventId])
  return useEventDetailsWithLocationState(eventId)
}
