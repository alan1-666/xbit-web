import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export const useSeriesByID = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS_CONFIGS.seriesByID(id),
    enabled: !!id,
    queryFn: async () => {
      return eventsService.getSeriesByID(id)
    },
  })
}
