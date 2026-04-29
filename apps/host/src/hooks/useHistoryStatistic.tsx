import { useQuery } from '@apollo/client'
import { tradingClient } from '@/lib/gql/apollo-client'
import { getHistoryStatistic } from '@/services/order.service'

export const useHistoryStatistic = (address: string, userAddress: string | null, isXStock: boolean) => {
  const { data, loading, error } = useQuery(getHistoryStatistic, {
    skip: !address || !userAddress,
    variables: {
      input: {
        baseAddress: address,
        userAddress: userAddress!,
        isXStock: isXStock
      }
    },
    fetchPolicy: 'no-cache',
    client: tradingClient,
  })

  return {
    data: data?.historyStatistic,
    loading,
    error,
  }
}
