import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'

export const useMarketsByIds = (conditionIds: string[]) => {
  return useQuery({
    queryKey: ['prediction', 'markets-by-ids', conditionIds],
    queryFn: async () => {
      if (conditionIds.length === 0) return []

      return eventsService.getMarkets({
        limit: conditionIds.length,
        offset: 0,
        filter: {
          conditionIds: conditionIds,
        },
      })
    },
    enabled: conditionIds.length > 0,
  })
}
