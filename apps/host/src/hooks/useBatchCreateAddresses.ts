import { useMutation } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { BATCH_CREATE_ADDRESSES } from '@/services/hypertrader.service'

type Vars = {
  input: {
    addresses: Array<{
      address: string
      groupIds: string[]
    }>
  }
}

type Resp = {
  batchCreateAddresses: Array<{
    id: string
    address: string
    groupIds: string[]
    createdAt: string
    updatedAt: string
  }>
}

export const useBatchCreateAddresses = () => {
  const [mutate, { data, loading, error }] = useMutation<Resp, Vars>(BATCH_CREATE_ADDRESSES, {
    client: hypertraderClient,
  })

  return {
    batchCreateAddresses: (vars: Vars) => mutate({ variables: vars }),
    data: data?.batchCreateAddresses,
    loading,
    error,
  }
}
