import * as React from 'react'
import { useMutation } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { IMPORT_ADDRESSES_MUTATION } from '@/services/hypertrader.service'

export type ImportAddressesRequest = {
  text: string
  groupIds?: string[]
  ownerUserId?: string
  followerAddress?: string
}

export type Address = {
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

export type ImportAddressesResponse = {
  totalCount: number
  successCount: number
  failedCount: number
  errors: string[]
  addresses: Address[]
}

type ImportAddressesData = {
  importAddresses: ImportAddressesResponse
}

type ImportAddressesVars = {
  input: ImportAddressesRequest
}

export function useImportAddresses() {
  const [mutate, state] = useMutation<ImportAddressesData, ImportAddressesVars>(IMPORT_ADDRESSES_MUTATION, {
    client: hypertraderClient,
    fetchPolicy: 'network-only',
  })

  const importAddresses = React.useCallback(
    async (input: ImportAddressesRequest) => {
      const cleanedInput: ImportAddressesRequest = {
        text: input.text,
        groupIds: input.groupIds || [],
        ...(input.ownerUserId ? { ownerUserId: input.ownerUserId } : {}),
        ...(input.followerAddress ? { followerAddress: input.followerAddress } : {}),
      }

      const res = await mutate({
        variables: { input: cleanedInput },
      })

      const payload = res.data?.importAddresses
      if (!payload) {
        throw new Error('importAddresses: empty response')
      }

      return payload
    },
    [mutate],
  )

  return {
    importAddresses,
    ...state,
  }
}
