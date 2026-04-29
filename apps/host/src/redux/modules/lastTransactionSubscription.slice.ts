import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'
import { LastTransaction } from '@/@generated/gql/graphql-core.ts'

export interface LastTransactionSubscriptionState {
  lastTransactionUpdated: LastTransaction[]
}

const initialLastTransactionSubscriptionState: LastTransactionSubscriptionState = {
  lastTransactionUpdated: []
}

export const lastTransactionSubscriptionSlice = createSlice({
  name: 'lastTransactionSubscription',
  initialState: initialLastTransactionSubscriptionState,
  reducers: {
    updateLastTransactionUpdated: (state, action: PayloadAction<LastTransaction[]>) => {
      if (!action.payload) return

      state.lastTransactionUpdated = action.payload
    },
  },
})

export const selectLastTransactionUpdated = (state: RootState) =>
  state.lastTransactionSubscription?.lastTransactionUpdated as LastTransaction[]

export const {
  updateLastTransactionUpdated,
} = lastTransactionSubscriptionSlice.actions

export default lastTransactionSubscriptionSlice
