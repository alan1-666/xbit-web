import { useSportTeams } from '@/modules/prediction/hooks/useSportTeams.ts'
import { useMemo } from 'react'
import { LEAGUE_MAP } from '../constants'

export const useSportEventTeams = (slug?: string) => {
  const { league, homeTeamAbbreviation, awayTeamAbbreviation } = useMemo(() => {
    if (!slug) return { league: undefined, homeTeamAbbreviation: undefined, awayTeamAbbreviation: undefined }
    const [rawLeague, home, away] = slug.split('-')
    const league = LEAGUE_MAP[rawLeague as keyof typeof LEAGUE_MAP] || rawLeague
    return {
      league,
      homeTeamAbbreviation: home,
      awayTeamAbbreviation: away,
    }
  }, [slug])

  const abbreviations = useMemo(
    () => [homeTeamAbbreviation, awayTeamAbbreviation].filter((a): a is string => !!a),
    [homeTeamAbbreviation, awayTeamAbbreviation],
  )

  const { data, isPending } = useSportTeams({
    league: league ? [league] : [],
    abbreviation: abbreviations,
    enabled: !!league && abbreviations.length > 0,
  })

  const { homeTeam, awayTeam } = useMemo(() => {
    if (!data) return { homeTeam: undefined, awayTeam: undefined }
    const homeTeam = data.find((team) => team.abbreviation === homeTeamAbbreviation)
    const awayTeam = data.find((team) => team.abbreviation === awayTeamAbbreviation)
    return { homeTeam, awayTeam }
  }, [data])

  return { homeTeam, awayTeam, homeTeamAbbreviation, awayTeamAbbreviation, isPending }
}
