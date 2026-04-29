import { useInfiniteQuery } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getTradingTransactions } from '@services/tokens.service.ts'
import { QueryGetTradingTransactionsArgs } from '@/@generated/gql/graphql-future.ts'
import { RealtimeTransactionMapper } from '@/utils/mappers/realtimeTransactionMapper.ts'
import { useCallback } from 'react'

export interface UseTradingTransactionsOptions {
  input: QueryGetTradingTransactionsArgs['input']
}

const LIMIT_PER_PAGE = 20

export const useTradingTransactions = (options: UseTradingTransactionsOptions) => {
  const { input } = options
  const { token, chainId } = input
  const query = useInfiniteQuery({
    queryKey: ['lastTransactions', chainId, token, input],
    enabled: !!token && !!chainId,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await futureClient.query({
        query: getTradingTransactions,
        variables: {
          input: {
            // lastTimestamp: pageParam ? `${pageParam}` : undefined,
            cursor: pageParam,
            limit: LIMIT_PER_PAGE,
            ...input,
          },
        },
      })
      return res.data.getTradingTransactions
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.data.length < LIMIT_PER_PAGE) {
        return undefined // No more pages
      }
      return lastPage.cursor // Use the last transaction's timestamp as the next page param
    },
    select: (data) => {
      return data.pages.flatMap((page) => {
        return page.data.map((item) => RealtimeTransactionMapper.fromTradingTransaction(item))
      })
    },
  })

  const { fetchNextPage, isLoading, hasNextPage, isFetchingNextPage } = query

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isLoading) return
    fetchNextPage().then(() => {})
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage])

  return {
    ...query,
    loadMore,
    transactions: query.data || [],
  }
}
