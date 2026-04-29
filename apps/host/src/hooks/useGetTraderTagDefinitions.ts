import { useQuery } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { getTraderTagDefinitionsGql, type GetTraderTagDefinitionsResp } from '@/services/hypertrader.service'

export const useGetTraderTagDefinitions = () => {
  const { data, loading, error } = useQuery<GetTraderTagDefinitionsResp>(getTraderTagDefinitionsGql, {
    client: hypertraderClient,
    fetchPolicy: 'cache-first',
  })

  return {
    data: data?.getTraderTagDefinitions ?? [],
    loading,
    error,
  }
}
