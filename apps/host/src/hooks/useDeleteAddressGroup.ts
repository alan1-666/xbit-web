import { useMutation } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { DELETE_ADDRESS_GROUP } from '@/services/hypertrader.service'

type Vars = {
  id: string
}

type Resp = {
  deleteAddressGroup: boolean
}

export const useDeleteAddressGroup = () => {
  const [mutate, { data, loading, error }] = useMutation<Resp, Vars>(DELETE_ADDRESS_GROUP, {
    client: hypertraderClient,
  })

  return {
    deleteAddressGroup: (id: string) =>
      mutate({
        variables: { id },
      }),
    data: data?.deleteAddressGroup,
    loading,
    error,
  }
}
