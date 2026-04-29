import { Event } from '@/@generated/gql/graphql-prediction.ts'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import { MqttEventPayload } from '@/modules/prediction/types/mqtt-payload.ts'

export const eventMapper = {
  fromGraphQL(event: Event): EventModel {
    return {
      ...event,
    }
  },

  fromMqttEventPayload(payload: MqttEventPayload): EventModel {
    return {
      id: payload.i,
      providerId: payload.pi,
      provider: { name: payload.p },
      title: payload.t,
      slug: payload.s,
      description: payload.d,
      image: payload.im,
      active: payload.a,
      closed: payload.c,
      volume: payload.v,
      liquidity: payload.l,
      createdAt: new Date(payload.ts * 1000).toISOString(),
    } as EventModel
  },
}
