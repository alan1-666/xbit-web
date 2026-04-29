import { useMutation } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { DELETE_ADDRESS } from '@/services/hypertrader.service'

type DeleteAddressVars = {
  id: string
  groupId: string
}

type DeleteAddressResp = {
  deleteAddress: boolean
}

export const useDeleteAddress = () => {
  const [mutate, state] = useMutation<DeleteAddressResp, DeleteAddressVars>(DELETE_ADDRESS, {
    client: hypertraderClient,
  })

  const deleteAddress = async (id: string, groupId: string) => {
    const res = await mutate({
      variables: { id, groupId },
    })

    const ok = res.data?.deleteAddress
    if (!ok) {
      throw new Error('deleteAddress failed')
    }

    return ok
  }

  return {
    deleteAddress,
    ...state,
  }
}
