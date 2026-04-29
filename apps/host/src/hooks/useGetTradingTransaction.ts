import { TradingTransactionInput } from '@/@generated/gql/graphql-future'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { useQuery } from '@apollo/client'
import { getTradingTransactions } from '@services/tokens.service.ts'

export const useGetTradingTransaction = ({ input, skip }: { input: TradingTransactionInput; skip: boolean }) => {
  return useQuery(getTradingTransactions, {
    client: futureClient,
    skip: skip,
    variables: { input: input },
  })
}
