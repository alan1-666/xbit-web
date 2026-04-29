import { MqttCommentPayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { CommentModel } from '@/modules/prediction/models/CommentModel.ts'
import { Provider, CommentType } from '@/@generated/gql/graphql-prediction.ts'

export const commentMapper = {
  fromMqttCommentPayload(payload: MqttCommentPayload): CommentModel {
    // Map MQTT type to GraphQL CommentType enum
    const typeMap: Record<'event' | 'series' | 'market', CommentType> = {
      event: CommentType.Event,
      series: CommentType.Series,
      market: CommentType.Market,
    }

    return {
      __typename: 'Comment',
      id: payload.i,
      providerId: payload.pi,
      provider: payload.p === 'polymarket' ? Provider.Polymarket : Provider.Polymarket,
      body: payload.b,
      type: typeMap[payload.t],
      parentId: payload.pid,
      userAddress: payload.ua,
      profile:
        payload.pn || payload.pm
          ? {
              __typename: 'CommentProfile',
              name: payload.pn,
              profileImage: payload.pm,
            }
          : undefined,
      reactionCount: payload.rc,
      createdAt: new Date(payload.ca * 1000).toISOString(),
      updatedAt: new Date(payload.ts * 1000).toISOString(),
    }
  },
}
