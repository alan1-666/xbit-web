import { useMutation } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import {
  createAddressGroupGql,
  type CreateAddressGroupRequest,
  type CreateAddressGroupResp,
} from '@/services/hypertrader.service'

export const useCreateAddressGroup = () => {
  const [mutate, { loading, error }] = useMutation<CreateAddressGroupResp>(createAddressGroupGql, {
    client: hypertraderClient,
  })

  const createAddressGroup = async (input: CreateAddressGroupRequest) => {
    const res = await mutate({ variables: { input } })
    return res.data?.createAddressGroup ?? null
  }

  return { createAddressGroup, loading, error }
}
