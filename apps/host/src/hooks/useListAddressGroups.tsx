import { useQuery } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { getListAddressGroups, type ListAddressGroupsResp } from '@/services/hypertrader.service'

export const useListAddressGroups = () => {
  const query = useQuery<ListAddressGroupsResp>(getListAddressGroups, {
    client: hypertraderClient,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    
  })

  return {
    data: query.data?.listAddressGroups ?? [],
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  }
}
