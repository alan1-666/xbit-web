import { useLocation } from 'react-router-dom'
import { useEventDetails } from '@/modules/prediction/hooks/useEventDetails.ts'
import { useMemo } from 'react'

import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'

export const useEventDetailsWithLocationState = (eventId: string) => {
  const location = useLocation()
  const { data, ...rest } = useEventDetails(eventId)
  const event = useMemo(() => {
    if (data) return data
    return location.state?.event as typeof data
  }, [location.state, data])

  const teams = useMemo(() => {
    return location.state?.teams as TeamModel[] | undefined
  }, [location.state])

  return {
    event,
    teams,
    ...rest,
  }
}
