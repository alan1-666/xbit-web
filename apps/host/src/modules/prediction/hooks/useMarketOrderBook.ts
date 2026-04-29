import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export interface UseMarketOrderBookOptions {
  marketId: string
  tokenId: string
}

export const useMarketOrderBook = (options: UseMarketOrderBookOptions) => {
  const { tokenId, marketId } = options
  return useQuery({
    queryKey: QUERY_KEYS_CONFIGS.marketOrderBook(marketId, tokenId),
    enabled: !!tokenId && !!marketId,
    queryFn: async () => {
      return eventsService.getOrderBook({
        marketID: marketId,
        tokenId: tokenId,
      })
    },
  })
}
