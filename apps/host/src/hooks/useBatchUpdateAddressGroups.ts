import { useMutation } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { BATCH_UPDATE_ADDRESS_GROUPS } from '@/services/hypertrader.service'

export type AddressGroupInput = { id: string; name: string; isDefault?: boolean }

export type BatchUpdateAddressGroupsVars = {
  input: {
    groups: AddressGroupInput[]
  }
}

export type BatchUpdateAddressGroupsResp = {
  batchUpdateAddressGroups: Array<{
    id: string
    name: string
    userId: string | null
    isDefault: boolean
    createdAt: string
    updatedAt: string
  }>
}

export const useBatchUpdateAddressGroups = () => {
  const [mutate, { data, loading, error }] = useMutation<BatchUpdateAddressGroupsResp, BatchUpdateAddressGroupsVars>(
    BATCH_UPDATE_ADDRESS_GROUPS,
    {
      client: hypertraderClient,
      fetchPolicy: 'network-only',
    },
  )

  const batchUpdateAddressGroups = (vars: BatchUpdateAddressGroupsVars) => mutate({ variables: vars })

  return {
    batchUpdateAddressGroups,
    data: data?.batchUpdateAddressGroups,
    loading,
    error,
  }
}
