import { TradingTransactionInput } from '@/@generated/gql/graphql-future'
import { TransactionDto } from '@/@generated/gql/graphql-meme2'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getTradingTransactions } from '@services/tokens.service.ts'
import { useInfiniteQuery } from '@tanstack/react-query'

const PAGE_SIZE = 20

export const useGetTradingTransactionInfinite = ({
  input,
  skip,
}: {
  input: TradingTransactionInput
  skip: boolean
}) => {
  return useInfiniteQuery({
    queryKey: ['tradingTransactions', input.token, input.chainId, input.addresses, input.sortBy, input.type],
    enabled: !skip,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await futureClient.query({
        query: getTradingTransactions,
        variables: {
          input: {
            ...input,
            lastTimestamp: pageParam ?? undefined,
            limit: PAGE_SIZE,
          },
        },
        fetchPolicy: 'no-cache',
      })
      return res.data.getTradingTransactions.data as TransactionDto[]
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined
      const lastItem = lastPage[lastPage.length - 1]
      return lastItem?.timestamp ? String(lastItem.timestamp) : undefined
    },
    refetchOnWindowFocus: false,
  })
}

