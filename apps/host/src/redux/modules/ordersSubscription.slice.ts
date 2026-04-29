import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'
import { FillWeb3OrderFailed, Order, OrderSubmitFailed } from '@/@generated/gql/graphql-trading.ts'

export interface OrdersSubscriptionState {
  orderUpdated?: Order
  orderSubmitFailed?: OrderSubmitFailed
  fillWeb3OrderFailed?: FillWeb3OrderFailed
}

const initialOrdersSubscriptionState: OrdersSubscriptionState = {}

export const ordersSubscriptionSlice = createSlice({
  name: 'ordersSubscription',
  initialState: initialOrdersSubscriptionState,
  reducers: {
    updateOrderUpdated: (state, action: PayloadAction<Order>) => {
      if (!action.payload) return

      state.orderUpdated = action.payload
    },
    clearOrderUpdated: (state) => {
      state.orderUpdated = undefined
    },
    updateOrderSubmitFailed: (state, action: PayloadAction<OrderSubmitFailed>) => {
      if (!action.payload) return

      state.orderSubmitFailed = action.payload
    },
    clearOrderSubmitFailed: (state) => {
      state.orderSubmitFailed = undefined
    },
    updateFillWeb3OrderFailed: (state, action: PayloadAction<FillWeb3OrderFailed>) => {
      if (!action.payload) return

      state.fillWeb3OrderFailed = action.payload
    },
    clearFillWeb3OrderFailed: (state) => {
      state.fillWeb3OrderFailed = undefined
    },
  },
})

export const selectOrderUpdated = (state: RootState) => state.ordersSubscription?.orderUpdated
export const selectOrderSubmitFailed = (state: RootState) => state.ordersSubscription?.orderSubmitFailed
export const selectFillWeb3OrderFailed = (state: RootState) => state.ordersSubscription?.fillWeb3OrderFailed

export const {
  updateOrderUpdated,
  clearOrderUpdated,
  updateOrderSubmitFailed,
  clearOrderSubmitFailed,
  updateFillWeb3OrderFailed,
  clearFillWeb3OrderFailed,
} = ordersSubscriptionSlice.actions

export default ordersSubscriptionSlice
