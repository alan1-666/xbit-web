import { useQuery } from '@apollo/client'
import {getPollTxInfo} from '@/services/tokens.service'
import {futureClient} from "@/lib/gql/apollo-client.ts";

interface UseGetPoolTxInfoProps {
  token: string
  chainId: number
  skipCondition?: boolean
}

export const useGetPoolTxInfo = ({ token, chainId, skipCondition = false }: UseGetPoolTxInfoProps) => {
  const { data, loading, error } = useQuery(getPollTxInfo, {
    variables: {
      input: {
        token,
        chainId,
      }
    },
    skip: skipCondition || !token || !chainId,
    errorPolicy: 'all',
    client: futureClient,
  })

  return {
    data: data?.getPoolTransactions,
    loading,
    error,
  }
}
