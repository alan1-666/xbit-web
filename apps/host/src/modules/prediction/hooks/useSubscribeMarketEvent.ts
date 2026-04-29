import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { useQuery } from '@tanstack/react-query'

export const useSubscribeMarketEvent = (slug: string) => {
  const { data } = useQuery({
    queryKey: ['market-subscription', slug],
    queryFn: () => eventsService.subscribeMarket(slug),
    enabled: !!slug,
  })

  useQuery({
    queryKey: ['renew-subscription', slug],
    queryFn: () => eventsService.renewMarketSubscription(slug),
    enabled: !!slug && data?.success,
    refetchInterval: 4 * 60000,
  })
}

