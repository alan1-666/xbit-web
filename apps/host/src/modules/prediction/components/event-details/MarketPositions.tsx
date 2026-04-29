import { useEffect, useState } from 'react'
import { UserPositionsTable } from '@/modules/prediction/components/profile/UserPositionsTable.tsx'
import { useMarketPositions } from '@/modules/prediction/hooks/useUserActivePositions.ts'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { usePublicSubscriptionCallback } from '@hooks/mqtt/usePublicSubscriptionCallback.ts'
import { TOPICS } from '@/lib/topics.ts'
import { MqttMarketResolvedPayload } from '@/modules/prediction/types/mqtt-payload.ts'

export interface MarketPositionsProps {
  market: MarketModel
}

export const MarketPositions = (props: MarketPositionsProps) => {
  const { market } = props
  const { data, isLoading } = useMarketPositions(market)
  const [isResolved, setIsResolved] = useState(false)

  // Reset when market changes
  useEffect(() => {
    setIsResolved(false)
  }, [market.id])

  // Mirror the same MQTT subscription as MarketResolvedAlert
  usePublicSubscriptionCallback<MqttMarketResolvedPayload>(TOPICS.prediction.marketResolved(market.id), {
    shouldSkip: !market.id,
    onMessage: () => {
      setIsResolved(true)
    },
  })

  if (market.closed || isResolved) {
    return <UserPositionsTable positions={[]} isLoading={false} variant="cards" />
  }

  return <UserPositionsTable positions={data || []} isLoading={isLoading} variant="cards" />
}
