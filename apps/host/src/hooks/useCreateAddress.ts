import { useMutation } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { CREATE_ADDRESS_MUTATION } from '@/services/hypertrader.service.ts'
import type {
  CreateAddressMutationData,
  CreateAddressMutationVars,
  CreateAddressRequest,
  AddressResponse,
} from '@/pages/supervisory/types.d.ts'

export const useCreateAddress = () => {
  const [mutate, { loading, error, data }] = useMutation<CreateAddressMutationData, CreateAddressMutationVars>(
    CREATE_ADDRESS_MUTATION,
    {
      client: hypertraderClient,
    },
  )

  const createAddress = async (input: CreateAddressRequest): Promise<AddressResponse> => {
    const res = await mutate({
      variables: { input },
      refetchQueries: ["GetAddresses"],
      awaitRefetchQueries: true,
    })

    if (!res.data?.createAddress) {
      throw new Error('createAddress failed: empty response')
    }
    return res.data.createAddress
  }

  return {
    createAddress,
    loading,
    error,
    data: data?.createAddress,
  }
}
