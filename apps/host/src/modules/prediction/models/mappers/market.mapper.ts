import { MqttMarketPayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'

export const marketMapper = {
  /**
   * Maps MQTT market payload to MarketModel
   * Used for both public/market/new and public/market/{id}/update topics
   */
  fromMqttMarketPayload(payload: MqttMarketPayload): Partial<Omit<MarketModel, '__typename'>> {
    return {
      id: payload.i,
      providerId: payload.pi,
      question: payload.q,
      slug: payload.s,
      image: payload.im,
      active: payload.a,
      closed: payload.c,
      volume: payload.v,
      liquidity: payload.l,
      clobTokenIds: payload.ty && payload.tn ? [payload.ty, payload.tn] : undefined,
      outcomePrices: payload.op,
      // Token-specific best bid/ask (from update topic)
      tokenYesBestBid: payload.tybb,
      tokenYesBestAsk: payload.tyba,
      tokenNoBestBid: payload.tnbb,
      tokenNoBestAsk: payload.tnba,
    }
  },
}
