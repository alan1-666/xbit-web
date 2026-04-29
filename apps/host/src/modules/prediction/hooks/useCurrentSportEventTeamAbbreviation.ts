import { useParams } from 'react-router-dom'
import { useMemo } from 'react'

export const useCurrentSportEventTeamAbbreviation = () => {
  const params = useParams()
  const slug = params.eventId || ''
  const [league, home, away] = useMemo(() => {
    return slug.split('-')
  }, [slug])
  return {
    league,
    homeTeamAbbreviation: home,
    awayTeamAbbreviation: away,
  }
}
