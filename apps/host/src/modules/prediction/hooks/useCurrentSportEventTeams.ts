import { useSportEventTeams } from '@/modules/prediction/hooks/useSportEventTeams.ts'
import { useParams } from 'react-router-dom'

export const useCurrentSportEventTeams = () => {
  const params = useParams()
  const slug = params.eventId || ''
  return useSportEventTeams(slug)
}
