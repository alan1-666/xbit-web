import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { CryptoTimeframe } from '@/@generated/gql/graphql-prediction.ts'
import { eventsService } from '@/modules/prediction/services/events.service.ts'

export const getTimeframeFromTag = (tag: string | undefined): CryptoTimeframe | undefined => {
  switch (tag) {
    case '5M':
      return CryptoTimeframe.Crypto_5M
    case '15M':
      return CryptoTimeframe.Crypto_15M
    case '1H':
      return CryptoTimeframe.Crypto_1H
    case '4H':
    case '4h':
      return CryptoTimeframe.Crypto_4H
    case 'daily':
      return CryptoTimeframe.Crypto_1D
    case 'weekly':
      return CryptoTimeframe.Crypto_1W
    case 'monthly':
      return CryptoTimeframe.Crypto_1Mo
    case 'pre-market':
      return CryptoTimeframe.Premarket
    case 'etf':
      return CryptoTimeframe.Etf
    case 'bitcoin':
      return CryptoTimeframe.Bitcoin
    case 'ethereum':
      return CryptoTimeframe.Ethereum
    case 'solana':
      return CryptoTimeframe.Solana
    case 'xrp':
      return CryptoTimeframe.Xrp
    case 'dogecoin':
      return CryptoTimeframe.Dogecoin
    case 'microstrategy':
      return CryptoTimeframe.Microstrategy
    default:
      return undefined
  }
}

const LIMIT = 60

export const useCryptoEvents = (
  tag: string | undefined,
  options?: {
    enabled?: boolean
  },
) => {
  return useInfiniteQueryWithLoadMore({
    queryKey: QUERY_KEYS_CONFIGS.eventsList(tag || 'crypto', {}),
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam - 1) * LIMIT
      const timeframe = getTimeframeFromTag(tag)
      if (timeframe) {
        return eventsService.getCryptoEvents({
          timeframe,
          offset,
          limit: LIMIT,
        })
      } else {
        return eventsService.getEventsByCategory({
          filter: {
            tagSlug: tag || 'crypto',
            active: true,
            archived: false,
            closed: false,
          },
          offset,
          limit: LIMIT,
        })
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < LIMIT) return undefined
      return lastPageParam + 1
    },
    select: (data) => data.pages.flat(),
    enabled: options?.enabled !== false,
  })
}
