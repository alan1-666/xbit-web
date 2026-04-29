import { useQuery } from '@apollo/client'
import { getPoolTransactions } from '@/services/tokens.service.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { GetPoolTransactionsResponse } from '@/types/responses.ts'

export type PoolTransactionInput = {
  token: string
  chainId: number
  type?: string
  address?: string
  transactionVolumeFrom?: number
  transactionVolumeTo?: number
  timestampFrom?: number
  timestampTo?: number
  transactionUsdAmountFrom?: number
  transactionUsdAmountTo?: number
  sortBy?: string
  lastTimestamp?: number
  classification?: string
}

export const useGetPoolTransactions = ({
  filter,
  skipCondition = false,
}: {
  filter: PoolTransactionInput
  skipCondition?: boolean
}) => {
  const { data, loading, error } = useQuery<GetPoolTransactionsResponse>(getPoolTransactions, {
    client: futureClient,
    skip: skipCondition || !filter?.token || !filter?.chainId,
    variables: {
      input: filter,
    },
  })

  return { data, loading, error }
}
