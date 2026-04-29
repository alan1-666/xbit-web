import { useLiveEvents } from '@/modules/prediction/hooks/sports/useLiveEvents.ts'
import { useMemo } from 'react'
import { useTeams } from '@/modules/prediction/hooks/sports/useTeams.ts'
import { MatchCardV2 } from '@/modules/prediction/components/sports/MatchCardV2.tsx'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import { extractLeagueAndTeams } from '@/modules/prediction/utils/sportsUtils.ts'

type LeagueRecord = Record<string, string[]>

type Match = EventModel & { teams: [TeamModel, TeamModel] }


export const SportsLivePage = () => {
  const { data } = useLiveEvents()
  const leagues = useMemo<LeagueRecord>(() => {
    if (!data) return {}
    const leagueRecord: LeagueRecord = {}
    data.forEach((event) => {
      const eventSlug = event.slug || ''
      const { league, home, away } = extractLeagueAndTeams(eventSlug)
      if (league && home && away) {
        if (!leagueRecord[league]) {
          leagueRecord[league] = []
        }
        leagueRecord[league].push(home)
        leagueRecord[league].push(away)
      }
    })
    return leagueRecord
  }, [data])

  const teams = useTeams(leagues)

  const matches = useMemo<Match[]>(() => {
    if (!data || !teams) return []
    return data.map((event) => {
      const eventSlug = event.slug || ''
      const { league, home: homeAbbr, away: awayAbbr } = extractLeagueAndTeams(eventSlug)
      const homeTeam = teams.find((team) => team.abbreviation === homeAbbr && team.league === league)
      const awayTeam = teams.find((team) => team.abbreviation === awayAbbr && team.league === league)
      return {
        ...event,
        teams: [homeTeam, awayTeam] as [TeamModel, TeamModel],
      }
    })
  }, [data, teams])

  return (
    <div className="flex flex-col h-full overflow-hidden text-white">
      <div className="grow overflow-y-auto custom-scrollbar xl:pt-2 _hidescrollbar">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Live</h1>
            </div>
          </div>

          <div className="min-h-50">
            {matches.map((match) => (
              <MatchCardV2 event={match} teams={match.teams} live={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
