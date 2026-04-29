import * as React from 'react'
import { useMutation } from '@apollo/client'
import { hypertraderClient } from '@/lib/gql/apollo-client'
import { UPDATE_FLOW_GROUP_ORDER_MUTATION } from '@/services/hypertrader.service'

// 入参：input: { array: [{ groupId, order }] }
export type UpdateFlowGroupOrderItem = {
  groupId: string
  order: number
}

export type UpdateFlowGroupOrderRequest = {
  array: UpdateFlowGroupOrderItem[]
}

export type AddressGroupResponse = {
  id: string
  name: string
  userId?: string | null
  isDefault: boolean
  order: number
  createdAt: string
  updatedAt: string
}

type UpdateFlowGroupOrderData = {
  updateFlowGroupOrder: AddressGroupResponse[]
}

type UpdateFlowGroupOrderVars = {
  input: UpdateFlowGroupOrderRequest
}

export function useUpdateFlowGroupOrder() {
  const [mutate, state] = useMutation<UpdateFlowGroupOrderData, UpdateFlowGroupOrderVars>(
    UPDATE_FLOW_GROUP_ORDER_MUTATION,
    { client: hypertraderClient },
  )

  const updateFlowGroupOrder = React.useCallback(
    async (array: UpdateFlowGroupOrderItem[]) => {
      // 防御：空数组不发请求
      if (!array?.length) return []

      const res = await mutate({
        variables: { input: { array } },
        // refetchQueries: ['ListAddressGroups'],
        // awaitRefetchQueries: true,
      })

      const payload = res.data?.updateFlowGroupOrder
      if (!payload) throw new Error('updateFlowGroupOrder: empty response')

      return payload
    },
    [mutate],
  )

  return {
    updateFlowGroupOrder,
    ...state,
  }
}
