import { useQuery } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { GET_FLOW_ADDRESS_ON_GROUP } from '@/services/hypertrader.service'

export type AddressGroupResponse = {
  id: string
  name: string
  userId: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

type Resp = {
  getFlowAddressOngroup: AddressGroupResponse[]
}

type Vars = {
  flowAddress: string
  userId: string
}

export const useGetFlowAddressOnGroup = ({
  flowAddress,
  userId,
  enabled = true,
}: {
  flowAddress?: string
  userId?: string
  enabled?: boolean
}) => {
  const { data, loading, error } = useQuery<Resp, Vars>(GET_FLOW_ADDRESS_ON_GROUP, {
    client: hypertraderClient,
    skip: !enabled || !flowAddress,
    variables: {
      flowAddress: flowAddress!,
      userId: userId!,
    },
    fetchPolicy: 'network-only',
  })

  return {
    data: data?.getFlowAddressOngroup ?? [],
    loading,
    error,
  }
}
