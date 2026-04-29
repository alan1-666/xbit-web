import * as React from 'react'
import { useMutation } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { EXPORT_ADDRESSES_MUTATION } from '@/services/hypertrader.service'

export type ExportAddressesRequest = {
  groupId?: string // 你例子里是 groupId（也可能后端叫 groupId）
}

export type ExportAddressesResponse = {
  format: string
  content: string
  count: number
}

type ExportAddressesData = {
  exportAddresses: ExportAddressesResponse
}

type ExportAddressesVars = {
  input: ExportAddressesRequest
}

export function useExportAddresses() {
  const [mutate, state] = useMutation<ExportAddressesData, ExportAddressesVars>(EXPORT_ADDRESSES_MUTATION, {
    client: hypertraderClient,
    fetchPolicy: 'no-cache',
  })

  const exportAddresses = React.useCallback(
    async (input: ExportAddressesRequest) => {
      const res = await mutate({ variables: { input } })
      const payload = res.data?.exportAddresses
      if (!payload) throw new Error('exportAddresses: empty response')
      return payload
    },
    [mutate],
  )

  return {
    exportAddresses,
    ...state,
  }
}
