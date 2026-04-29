import { useEffect, useState } from 'react'
import { useEventDetailsPageContext } from '../../contexts/EventDetailsPageContext'
import { PositionCard } from '../shared/PositionCard'
import { EventDetailsSellButton } from '../shared/PositionCardSellButton'
import { useEventPositions } from '@/modules/prediction/hooks/useEventPositions.ts'
import { useTranslation } from 'react-i18next'
import { usePublicSubscriptionCallback } from '@hooks/mqtt/usePublicSubscriptionCallback.ts'
import { TOPICS } from '@/lib/topics.ts'
import { MqttMarketResolvedPayload } from '@/modules/prediction/types/mqtt-payload.ts'

export const UserPositionsSection = () => {
  const { t } = useTranslation()
  const { event, selectedMarket } = useEventDetailsPageContext()
  const { data: activePositions } = useEventPositions(event?.id || '', event?.markets?.map((m) => m.id) || [])
  const [isResolved, setIsResolved] = useState(false)

  const selectedMarketId = selectedMarket?.id || ''

  useEffect(() => {
    setIsResolved(false)
  }, [selectedMarketId])

  usePublicSubscriptionCallback<MqttMarketResolvedPayload>(TOPICS.prediction.marketResolved(selectedMarketId), {
    shouldSkip: !selectedMarketId,
    onMessage: () => {
      setIsResolved(true)
    },
  })

  if (!activePositions || activePositions.length === 0 || selectedMarket?.closed || isResolved) return null

  const getGridCols = (_count: number) => {
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
  }

  return (
    <div className="bg-card">
      <div className="mb-2">{t('assets.perps.positions')}</div>
      {/* Desktop View */}
      <div className="">
        <div className={`grid gap-3 ${getGridCols(activePositions.length)}`}>
          {activePositions?.map((pos, idx) => (
            <PositionCard
              key={pos.marketId ? `${pos.marketId}-${pos.outcome}-${idx}` : idx}
              position={pos}
              showEventHeader={false}
              currentTitle={t('prediction.profile.currentSell')}
              renderSellButton={() => <EventDetailsSellButton position={pos} />}
              market={event?.markets?.find((m) => m.id === pos.marketId)}
            />
          ))}
        </div>
      </div>

      {/* Mobile View */}
      {/* <div className="w-full xl:hidden">
        <div className="flex w-full flex-col gap-3">
          {activePositions?.map((pos, idx) => (
            <UserPositionMobileCard key={idx} pos={pos} />
          ))}
        </div>
      </div> */}
    </div>
  )
}
