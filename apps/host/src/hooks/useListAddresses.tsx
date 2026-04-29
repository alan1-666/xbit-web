import { useQuery } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { LIST_ADDRESSES_GQL } from '@/services/hypertrader.service'
import type { ListAddressesResp, ListAddressesVars } from '@/pages/supervisory/types.d.ts'

export const useListAddresses = ({
  groupId,
  ownerUserId,
  userId,
  enabled = true,
}: {
  groupId?: string
  ownerUserId?: string
  userId?: string
  enabled?: boolean
}) => {
  const { data, loading, error, refetch } = useQuery<ListAddressesResp, ListAddressesVars>(LIST_ADDRESSES_GQL, {
    client: hypertraderClient,
    skip: !enabled || (!groupId && !ownerUserId && !userId),
    variables: { groupId, ownerUserId, userId },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  return {
    data: data?.listAddresses ?? [],
    loading,
    error,
    refetch,
  }
}
