import { useMutation } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import {
  updateAddressGroupsForAddressGql,
  type UpdateAddressGroupsForAddressRequest,
  type UpdateAddressGroupsForAddressResp,
} from '@/services/hypertrader.service'

export const useUpdateAddressGroupsForAddress = () => {
  const [mutate, { loading, error }] = useMutation<UpdateAddressGroupsForAddressResp>(
    updateAddressGroupsForAddressGql,
    { client: hypertraderClient },
  )

  const updateAddressGroupsForAddress = async (input: UpdateAddressGroupsForAddressRequest) => {
    const res = await mutate({ variables: { input } })
    return res.data?.updateAddressGroupsForAddress
  }

  return { updateAddressGroupsForAddress, loading, error }
}
