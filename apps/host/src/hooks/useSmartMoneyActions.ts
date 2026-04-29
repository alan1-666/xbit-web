import { ChainType } from '@/@generated/gql/graphql-future.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { mapTimeframeToTimeRange, SmartMoneyFilterType } from '@/types/monitoring.ts'
import { getSmartMoneyActionsV2 } from '@services/smartMoney.service.ts'
import { useInfiniteQuery } from '@tanstack/react-query'
import { get } from 'lodash-es'

export const useSmartMoneyActions = (
  filter: SmartMoneyFilterType,
  selectedChain: ChainType,
  activeWallet: { isConnected: boolean; walletAddress?: string },
) => {
  return useInfiniteQuery({
    queryKey: ['getSmartMoneyActionsV2', filter, selectedChain, activeWallet?.walletAddress],
    enabled: !!selectedChain && activeWallet?.isConnected && filter.address?.length !== 0,
    queryFn: async ({ pageParam = 1 }) => {
      const addresses = filter.address ?? []
      const result = await futureClient.query({
        query: getSmartMoneyActionsV2,
        variables: {
          req: {
            chain: selectedChain,
            limit: 20,
            walletAddresses: addresses.length > 0 ? addresses : undefined,
            minAmountUsd: filter.minAmountUsd,
            maxAmountUsd: filter.maxAmountUsd,
            transactionType: filter.transactionType,
            timeRange: mapTimeframeToTimeRange(filter.timeframe),
            ...(pageParam !== 1 && { cursor: pageParam }),
          },
        },
      })

      const data = get(result, 'data.getSmartMoneyActionsV2')
      const actions = data?.actions ?? []

      return {
        items: actions,
        nextCursor: data?.nextCursor,
        hasMore: !!data?.hasMore,
      }
    },
    initialPageParam: 1,
    refetchInterval: 5000, // poll every 5s
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    staleTime: 30000,
  })
}
