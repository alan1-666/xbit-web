import { MqttOrderBookPayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { OrderBookModel } from '@/modules/prediction/models/OrderBookModel.ts'

export const orderbookMapper = {
  fromMqttOrderBookPayload(payload: MqttOrderBookPayload): OrderBookModel {
    return {
      __typename: 'OrderBook',
      marketId: payload.m,
      tokenId: payload.t,
      bids: payload.b.map((bid) => ({
        __typename: 'Order',
        price: bid.p,
        size: bid.s,
      })),
      asks: payload.a.map((ask) => ({
        __typename: 'Order',
        price: ask.p,
        size: ask.s,
      })),
      hash: payload.h,
      timestamp: new Date(payload.ts * 1000).toISOString(),
    }
  },
}
