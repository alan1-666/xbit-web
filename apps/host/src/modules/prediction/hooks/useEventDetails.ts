import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export const useEventDetails = (eventSlug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS_CONFIGS.eventDetails(eventSlug),
    enabled: !!eventSlug,
    queryFn: async () => {
      return eventsService.getEvent(eventSlug)
    },
  })
}
