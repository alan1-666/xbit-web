import { useQueries } from '@tanstack/react-query'
import { sportsService } from '@/modules/prediction/services/sports.service.ts'
import { Team } from '@/@generated/gql/graphql-prediction.ts'

export const useTeams = (leagues: Record<string, string[]> = {}) => {
  return useQueries({
    queries: Object.entries(leagues).map(([league, abbreviations]) => ({
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
    })),
    combine: (results) => {
      return results.flatMap((result) => result.data || []) as Team[]
    },
  })
}
