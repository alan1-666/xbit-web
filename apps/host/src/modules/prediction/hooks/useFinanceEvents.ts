import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { FinanceType } from '@/@generated/gql/graphql-prediction.ts'

const TAG_TO_FINANCE_TYPE: Record<string, FinanceType> = {
  '': FinanceType.All,
  daily: FinanceType.Daily,
  weekly: FinanceType.Weekly,
  monthly: FinanceType.Monthly,
  stocks: FinanceType.Stocks,
  earnings: FinanceType.Earnings,
  indicies: FinanceType.Indices,
  commodities: FinanceType.Commodities,
  forex: FinanceType.Forex,
  collectibles: FinanceType.Collectibles,
  acquisitions: FinanceType.Acquisitions,
  'earnings-calls': FinanceType.EarningsCalls,
  ipo: FinanceType.Ipos,
  'fed-rates': FinanceType.FedRates,
  'prediction-markets': FinanceType.PredictionMarkets,
  treasuries: FinanceType.Treasuries,
}

const LIMIT = 60

export const useFinanceEvents = (tag: string | null) => {
  return useInfiniteQueryWithLoadMore({
    queryKey: QUERY_KEYS_CONFIGS.eventsList(tag || 'finance', {}),
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam - 1) * LIMIT
      const financeType = TAG_TO_FINANCE_TYPE[tag || ''] || FinanceType.All
      return eventsService.getFinanceEvents({
        financeType,
        offset,
        limit: LIMIT,
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < LIMIT) return undefined
      return lastPageParam + 1
    },
    select: (data) => data.pages.flat(),
  })
}
