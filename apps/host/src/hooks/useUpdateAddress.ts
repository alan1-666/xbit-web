import * as React from 'react'
import { useMutation } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { UPDATE_ADDRESS_MUTATION } from '@/services/hypertrader.service'

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

// 这里把 input 写成 Partial，适配“只更新 remarkName”的场景
export type UpdateAddressRequest = {
  id?: string
  address?: string
  remarkName?: string | null
  groupIds?: string[]
  ownerUserId?: string
  userAddress?: string
}

type UpdateAddressData = {
  updateAddress: AddressResponse
}

type UpdateAddressVars = {
  input: UpdateAddressRequest
}

export function useUpdateAddress() {
  const [mutate, state] = useMutation<UpdateAddressData, UpdateAddressVars>(UPDATE_ADDRESS_MUTATION, {
    client: hypertraderClient,
  })

  const updateAddress = React.useCallback(
    async (input: UpdateAddressRequest) => {
      if (!input?.address) throw new Error('updateAddress: missing address')

      const res = await mutate({
        variables: { input },
      })

      const payload = res.data?.updateAddress
      if (!payload) throw new Error('updateAddress: empty response')

      return payload
    },
    [mutate],
  )

  return {
    updateAddress,
    ...state,
  }
}
