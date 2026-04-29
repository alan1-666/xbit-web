import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service'

export const useGetResolution = (questionID: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['prediction', 'resolution', questionID],
    queryFn: () => eventsService.getResolution(questionID),
    enabled: enabled && !!questionID,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  })
}
