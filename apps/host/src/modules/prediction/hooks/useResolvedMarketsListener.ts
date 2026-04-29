import { usePublicSubscriptionCallback } from '@hooks/mqtt/usePublicSubscriptionCallback.ts'
import { TOPICS } from '@/lib/topics.ts'
import { MqttMarketResolvedPayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { addResolvedMarket } from '@/redux/modules/resolvedMarkets.slice'
import { useAppDispatch } from '@/redux/store'
import { useMemo } from 'react'

/**
 * Subscribes to marketResolved MQTT for multiple markets at once.
 * When any market resolves, stores its marketId in Redux (with TTL).
 */
export const useResolvedMarketsListener = (marketIds: string[]) => {
  const dispatch = useAppDispatch()

  const topics = useMemo(
    () => marketIds.filter(Boolean).map((id) => TOPICS.prediction.marketResolved(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [marketIds.join(',')],
  )

  usePublicSubscriptionCallback<MqttMarketResolvedPayload>(topics, {
    shouldSkip: topics.length === 0,
    onMessage: (_, payload) => {
      if (payload?.m) {
        dispatch(addResolvedMarket(payload.m))
      }
    },
  })
}
