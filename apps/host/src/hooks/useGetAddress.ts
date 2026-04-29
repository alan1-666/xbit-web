import { useQuery } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { GET_ADDRESS_QUERY } from '@/services/hypertrader.service'

export type AddressResponse = {
  id: string
  address: string
  remarkName?: string | null
  groupIds: string[]
  ownerUserId: string
  userAddress: string
  profit1d: number
  profit7d: number
  profit30d: number
  createdAt: string
  updatedAt: string
}

type GetAddressData = {
  getAddress: AddressResponse
}

type GetAddressVars = {
  address: string
}

export function useGetAddress(args: { address?: string; enabled?: boolean }) {
  const { address, enabled = true } = args

  const q = useQuery<GetAddressData, GetAddressVars>(GET_ADDRESS_QUERY, {
    client: hypertraderClient,
    variables: address ? { address } : (undefined as any),
    skip: !enabled || !address,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  })

  const safeRefetch = (nextAddress?: string) => {
    const addr = (nextAddress ?? address)?.trim()
    if (!addr) return Promise.reject(new Error('refetchCurrentAddress: address is required'))
    return q.refetch({ address: addr })
  }

  return {
    ...q,
    address: q.data?.getAddress,
    remarkName: q.data?.getAddress?.remarkName,
    refetch: safeRefetch,
  }
}
