import { PlaceLimitOrderInput, PlaceMarketOrderInput } from '@/modules/prediction/types'
import { OrderModel } from '@/modules/prediction/models/OrderModel.ts'
import { xpUserClient } from '@/lib/gql/apollo-client.ts'
import { BuyMarketInput, SellMarketInput } from '@/@generated/gql/graphql-xpUser.ts'
import {
  createPolymarketLimitOrder,
  createPolymarketMarketOrder,
  buyPolymarketMarket,
  sellPolymarketMarket,
} from '@/modules/prediction/gql/prediction-user.gql.ts'

interface IOrderService {
  placeMarketOrder: (input: PlaceMarketOrderInput) => Promise<OrderModel | undefined>
  placeBuyMarketOrder: (input: BuyMarketInput) => Promise<OrderModel | undefined>
  placeSellMarketOrder?: (input: SellMarketInput) => Promise<OrderModel | undefined>
  placeLimitOrder: (input: PlaceLimitOrderInput) => Promise<OrderModel | undefined>
}

class OrderService implements IOrderService {
  async placeMarketOrder(input: PlaceMarketOrderInput): Promise<OrderModel | undefined> {
    const res = await xpUserClient.mutate({
      mutation: createPolymarketMarketOrder,
      variables: {
        input,
      },
    })
    return res.data?.createPolymarketMarketOrder
  }

  async placeBuyMarketOrder(input: BuyMarketInput) {
    const res = await xpUserClient.mutate({
      mutation: buyPolymarketMarket,
      variables: {
        input,
      },
    })
    return res.data?.buyPolymarketMarket
  }

  async placeSellMarketOrder(input: SellMarketInput) {
    const res = await xpUserClient.mutate({
      mutation: sellPolymarketMarket,
      variables: {
        input,
      },
    })
    return res.data?.sellPolymarketMarket
  }

  async placeLimitOrder(input: PlaceLimitOrderInput): Promise<OrderModel | undefined> {
    const res = await xpUserClient.mutate({
      mutation: createPolymarketLimitOrder,
      variables: {
        input,
      },
    })
    return res.data?.createPolymarketLimitOrder
  }
}

export const orderService = new OrderService()
