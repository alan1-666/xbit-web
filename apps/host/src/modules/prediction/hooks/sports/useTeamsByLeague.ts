import { useQuery } from '@tanstack/react-query'
import { sportsService } from '@/modules/prediction/services/sports.service.ts'

export const useTeamsByLeague = (league: string, abbreviations: string[]) => {
  return useQuery({
    queryKey: ['prediction', 'sports', 'teams', league, abbreviations],
    queryFn: async () => {
      return sportsService.getTeams({
        filter: {
          leagues: [league],
          abbreviations: abbreviations,
        },
      })
    },
    enabled: !!league && abbreviations.length > 0,
  })
}
