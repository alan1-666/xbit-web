import { useQuery } from '@apollo/client'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getSmartMoneyTradeHistories } from '@services/smartMoney.service.ts'
import { SmartMoneyTradeHistoryResponse, TokenReq } from '@/types/tokenDetail.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { useCallback } from 'react'

type useGetSmartMonetTradeHistoriesProps = {
  token: TokenReq
  skipCondition: boolean
  page?: number
  limit?: number
  duration?: number
}

export const useGetSmartMonetTradeHistories = ({
  token,
  page,
  limit,
  duration,
  skipCondition = false,
}: useGetSmartMonetTradeHistoriesProps) => {
  const { data, loading, error } = useQuery<SmartMoneyTradeHistoryResponse>(getSmartMoneyTradeHistories, {
    client: futureClient,
    skip: skipCondition || !token?.address,
    variables: {
      req: {
        token,
        page,
        limit,
        duration,
      },
    },
  })

  return { data, loading, error }
}

export interface UseSmartMonetTradeHistoriesOptions {
  token: TokenReq
  duration?: number
  enabled?: boolean
}

// Version with react-query
export const useSmartMonetTradeHistories = (options: UseSmartMonetTradeHistoriesOptions) => {
  const { token, duration, enabled } = options
  const result = useInfiniteQuery({
    queryKey: ['getSmartMoneyTradeHistories'],
    queryFn: async ({ pageParam }) => {
      const { data } = await futureClient.query({
        query: getSmartMoneyTradeHistories,
        variables: {
          req: {
            token,
            duration,
            page: pageParam,
            limit: 20,
          },
        },
      })
      return data.getSmartMoneyTradeHistories ?? []
    },
    enabled: !enabled && !!token?.address,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length + 1
    },
  })

  const loadMore = useCallback(() => {
    const { isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = result
    if (!isLoading && hasNextPage && !isFetchingNextPage) {
      fetchNextPage().catch(console.error)
    }
  }, [result.isLoading, result.hasNextPage, result.isFetchingNextPage])

  return {
    ...result,
    loadMore,
  }
}
