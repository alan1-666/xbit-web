import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'
import { MqttPolymarketTxStatusPayload } from '@/modules/prediction/types/mqtt-payload.ts'

export type PendingOrderStatus = 'PENDING' | 'MATCHED' | 'MINED'

export interface PendingOrder {
  orderId: string
  marketId: string
  tokenId: string
  conditionId: string
  outcome: 'yes' | 'no'
  outcomeLabel: string
  side: 'buy' | 'sell'
  orderType: 'market' | 'limit'
  size: number
  price: number
  status: PendingOrderStatus
  createdAt: number
  outcomeIndex: number
}

export interface PendingOrdersState {
  orders: Record<string, PendingOrder>
  total: number // backward-compat: used by Futures/Meme pending orders counter
}

const initialState: PendingOrdersState = {
  orders: {},
  total: 0,
}

export const pendingOrdersSlice = createSlice({
  name: 'pendingOrders',
  initialState,
  reducers: {
    addPendingOrder: (state, action: PayloadAction<PendingOrder>) => {
      state.orders[action.payload.orderId] = action.payload
    },
    updateOrderByMatchedTx: (state, action: PayloadAction<MqttPolymarketTxStatusPayload>) => {
      const orderId = action.payload.orderId
      const order = state.orders[orderId]
      if (!order) return // Order not found, do nothing

      const meta = action.payload.meta

      state.orders[orderId] = {
        ...order,
        price: meta.avgFillPrice,
        size: meta.matchedSize,
      }
    },
    updateOrderByUserTx: (state, action: PayloadAction<{ orderId: string; price: number; size: number }>) => {
      const { orderId, price, size } = action.payload
      const order = state.orders[orderId]

      // state.orders = {
      //   ...state.orders,
      //   [orderId]: {
      //     ...order,
      //     price,
      //     size,
      //     status: 'MATCHED',
      //   },
      // }

      if (!order) return

      state.orders[orderId] = {
        ...order,
        price,
        size,
        status: 'MATCHED',
      }
    },
    updatePendingOrderStatus: (state, action: PayloadAction<{ orderId: string; status: PendingOrderStatus }>) => {
      const order = state.orders[action.payload.orderId]
      if (order) {
        order.status = action.payload.status
      }
    },
    removePendingOrder: (state, action: PayloadAction<string>) => {
      delete state.orders[action.payload]
    },
    clearAllPendingOrders: (state) => {
      state.orders = {}
    },
    // backward-compat: used by Futures/Meme usePendingOrders.ts & PendingOrdersCounter.tsx
    updateTotalPendingOrders: (state, action: PayloadAction<number>) => {
      state.total = action.payload
    },
  },
})

export const {
  addPendingOrder,
  updatePendingOrderStatus,
  removePendingOrder,
  clearAllPendingOrders,
  updateTotalPendingOrders,
  updateOrderByMatchedTx,
  updateOrderByUserTx,
} = pendingOrdersSlice.actions

// backward-compat selector for Futures/Meme
export const selectTotalPendingOrders = (state: RootState) => state.pendingOrders?.total

// Selectors
const selectPendingOrdersState = (state: RootState): Record<string, PendingOrder> => state.pendingOrders?.orders ?? {}

export const selectAllPendingOrders = createSelector(selectPendingOrdersState, (orders): PendingOrder[] =>
  Object.values(orders),
)

export const selectPendingOrdersByMarket = (marketId: string) =>
  createSelector(selectPendingOrdersState, (orders): PendingOrder[] =>
    Object.values(orders).filter((o) => o.marketId === marketId),
  )

export const selectPendingOrdersCount = createSelector(selectPendingOrdersState, (orders) => Object.keys(orders).length)

export const selectPendingOrdersByTokenId = (tokenId: string) =>
  createSelector(selectPendingOrdersState, (orders): PendingOrder[] =>
    Object.values(orders).filter((o) => o.tokenId === tokenId && o.side === 'buy'),
  )

export default pendingOrdersSlice
