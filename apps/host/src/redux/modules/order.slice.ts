import { createSlice } from '@reduxjs/toolkit'
import { createThunk } from './common'
import { tradingClient } from '@/lib/gql/apollo-client'
import { createOrderByWeb3Mutation, createOrderMutation } from '@/services/order.service'
import {
  CreateOrderInput as NewCreateOrderInput,
  Order,
  OrderType,
  SaveWeb3OrderInput,
} from '@/@generated/gql/graphql-trading'
import eventBus from '@/lib/eventBus.ts'
import { REFETCH_PENDING_ORDERS } from '@/lib/eventMessages.ts'

export interface OrderState {
  order: Order
}

const initialState: OrderState = {
  order: {} as Order,
}

export const newCreateOrder = createThunk('order/newCreateOrder', async ({ input }: { input: NewCreateOrderInput }) => {
  const resp = await tradingClient?.mutate<any>({
    mutation: createOrderMutation,
    variables: {
      input: input,
    },
  })
  return resp?.data
})

export const createOrderByWeb3 = createThunk(
  'order/createOrderByWeb3',
  async ({ input }: { input: SaveWeb3OrderInput }) => {
    const resp = await tradingClient?.mutate<any>({
      mutation: createOrderByWeb3Mutation,
      variables: {
        input: input,
      },
    })
    return resp?.data
  },
)

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(newCreateOrder.fulfilled, (state, action) => {
      const orderType = action.payload?.createOrder?.type
      if (orderType === OrderType.Limit || orderType === OrderType.TrailingTpsl) {
        eventBus.dispatch(REFETCH_PENDING_ORDERS, {
          data: {
            needRefetch: true,
          }
        })
      }
    });
  },
})

export const orderActions = { ...orderSlice.actions, newCreateOrder, createOrderByWeb3 }
export default orderSlice
