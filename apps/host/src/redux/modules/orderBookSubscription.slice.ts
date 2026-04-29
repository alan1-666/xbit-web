import { LastTransaction } from '@/@generated/gql/graphql-core.ts'
import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'

export interface OrderBookSubscriptionState {
  lastTransactions?: LastTransaction[]
}

const initialState: OrderBookSubscriptionState = {
  lastTransactions: undefined
}

export const orderBookSubscriptionSlice = createSlice({
  name: 'orderBookSubscription',
  initialState,
  reducers: {
    updateOrderBook: (state, action) => {
      if (!action?.payload) return

      state.lastTransactions = action.payload
    },
    clearLastTransactions: (state) => {
      state.lastTransactions = undefined
    }
  }
})

export const {
  updateOrderBook,
  clearLastTransactions
} = orderBookSubscriptionSlice.actions

export const orderBookSubscriptionSelector = (state: RootState) => state.orderBookSubscription as OrderBookSubscriptionState

export default orderBookSubscriptionSlice.reducer;
