import { gql, useMutation } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { updateAddressGroupGql } from '@/services/hypertrader.service'
import type { UpdateAddressGroupRequest } from '@/services/hypertrader.service'


export type UpdateAddressGroupResp = {
  updateAddressGroup: { id: string; name: string; isDefault: boolean; updatedAt: string }
}

export const useUpdateAddressGroup = () => {
  const [mutate, { loading, error }] = useMutation<UpdateAddressGroupResp>(updateAddressGroupGql, {
    client: hypertraderClient,
  })

  const updateAddressGroup = async (input: UpdateAddressGroupRequest) => {
    const res = await mutate({ variables: { input } })
    return res.data?.updateAddressGroup
  }

  return { updateAddressGroup, loading, error }
}
