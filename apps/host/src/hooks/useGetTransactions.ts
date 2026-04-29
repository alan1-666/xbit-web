import { ChainIds } from '@/types/enums.ts'
import { getFollowedTransactions } from '@services/tokens.service.ts'
import { GetFollowedTransactionsResponse } from '@/types/responses.ts'
import { futureClient, gqlMeme2 } from '@/lib/gql/apollo-client.ts'
import { TransactionInput, TxType as TransactionType } from '@/@generated/gql/graphql-meme2.ts'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'

type useGetTransactionsProps = {
  filter: {
    token: string
    chainId: ChainIds
    type: TransactionType
    address?: string
    transactionUsdAmountFrom?: number
    transactionUsdAmountTo?: number
    timestampFrom?: number
    timestampTo?: number
    sortBy?: string //TODO: example: +timestamp, -timestamp
    lastTimestamp?: string
    transactionVolumeFrom?: number
    transactionVolumeTo?: number
  }
  skipCondition: boolean
}

export type UseFollowedTransactionsOptions = {
  input: TransactionInput
}

/**
 * Hook to fetch followed transactions based on provided filter criteria.
 * @param filter
 * @param skipCondition
 * @deprecated Use `useTransactions` instead.
 */
export const useGetTransactions = ({ filter, skipCondition }: useGetTransactionsProps) => {
  return useInfiniteQuery<GetFollowedTransactionsResponse>({
    queryKey: ['followedTransactions', filter],
    queryFn: async ({ pageParam }) => {
      const { data } = await futureClient.query({
        query: getFollowedTransactions,
        variables: {
          input: {
            ...filter,
            lastTimestamp: pageParam ? `${pageParam}` : undefined,
          }
        },
      })
      return data
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      const fromTimestamp = lastPage?.getFollowedTransactions?.fromTimestamp
      const hasData = lastPage?.getFollowedTransactions?.data?.length > 0
      return hasData && fromTimestamp ? fromTimestamp : undefined
    },
    enabled: !skipCondition && !!filter?.token,
    // staleTime: 5000,
  })
}

export const useFollowedTransactions = (options: UseFollowedTransactionsOptions) => {
  const { input } = options
  const activeWallet = useActiveWallet()
  const query = useInfiniteQuery({
    queryKey: ['followedTransactions', input],
    enabled: activeWallet.isConnected,
    queryFn: async ({ pageParam }) => {
      const res = await gqlMeme2.query({
        query: getFollowedTransactions,
        variables: {
          input: {
            ...input,
            cursor: pageParam,
          },
        },
      })
      return res.data.getFollowedTransactions
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.length < 20) return undefined
      return lastPage.cursor
    },
    select: (data) => {
      return data.pages.flatMap((page) => page.data)
    },
  })

  const { hasNextPage, isFetchingNextPage, isLoading, fetchNextPage } = query
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isLoading])

  return {
    ...query,
    loadMore,
  }
}
