import { Avatar, AvatarImage } from '@components/ui/avatar.tsx'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'
import { EventMarkets } from '@/modules/prediction/components/shared/EventMarkets.tsx'
import { formatVolume } from '@/lib/format.ts'
import { Link } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { useMemo } from 'react'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import dayjs from 'dayjs'
import { EventChanceChart } from '@/modules/prediction/components/shared/EventChanceChart.tsx'
import { useTranslation } from 'react-i18next'
import { ClosedEventMarkets } from '@/modules/prediction/components/shared/ClosedEventMarkets.tsx'
import {
  TopicTradeEvent,
  TradeEventMonitorSplit,
} from '@/modules/prediction/components/shared/TradeEventMonitorSplit.tsx'

export interface EventCardProps {
  event: EventModel
  volumeData?: TopicTradeEvent[]
}

export const EventCard = (props: EventCardProps) => {
  const { event, volumeData = [] } = props
  const { t } = useTranslation()
  const markets = useMemo(() => {
    if (!event.markets) return []
    const activeMarkets = event.markets.filter((market) => market?.active && !market.closed)
    return activeMarkets.sort((a, b) => {
      const aYesPrice = a.outcomePrices?.[0] || 0
      const bYesPrice = b.outcomePrices?.[0] || 0
      return +bYesPrice - aYesPrice
    })
  }, [event.markets])

  const isEventEnded = useMemo(() => {
    return event.closed === true
  }, [event.closed])

  const isLive = useMemo(() => {
    const now = dayjs()
    const startTime = dayjs(event.startTime)
    const endDate = dayjs(event.endDate)
    const isCryptoEvent = event.tags?.some((tag) => tag.slug === 'crypto-prices')
    return now.isAfter(startTime) && now.isBefore(endDate) && isCryptoEvent
  }, [event.startTime, event.endDate])

  const latestVolume = useMemo(() => {
    if (!volumeData?.length) return event.volume || 0
    const latest = volumeData[volumeData.length - 1]
    return (latest as any).volume || event.volume || 0
  }, [volumeData, event.volume])
  return (
    <div className="bg-[#060606] xl:bg-transparent xl:bg-linear-to-b xl:from-[#17171b] xl:to-[#0a0a0a] border border-[#1e1e1e] rounded-[8px] pt-3 px-3 pb-2 h-full flex flex-col">
      <div className="flex items-center gap-2.5 h-9">
        <Avatar className="rounded-[8px] size-9 shrink-0">
          <AvatarImage src={event.image || undefined} className="object-cover" />
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-white line-clamp-2 leading-[1.3] hover:underline">
            <Link to={NAVIGATIONS.prediction.eventDetails(event.slug || '')} state={{ event }}>
              {event.title}
            </Link>
          </div>
        </div>
        <EventChanceChart event={event} />
      </div>
      <div className="h-16 overflow-y-auto no-scrollbar relative mt-2 mb-2">
        {isEventEnded ? (
          <ClosedEventMarkets event={event} />
        ) : (
          <>
            <TradeEventMonitorSplit trades={volumeData} />
            <EventMarkets
              markets={markets as MarketModel[]}
              isEventEnded={isEventEnded}
              enableQuickBuy={false}
              eventSlug={event.slug || ''}
            />
          </>
        )}
      </div>
      <div className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-2">
          {Number(event.volume || 0) === 0 ? (
            <div className="text-[10px] bg-[#230D43] text-[#AB70FF] px-2 py-0.5 rounded-full font-medium">
              {t('prediction.eventCard.new')}
            </div>
          ) : (
            <div className="text-[11px] text-[#838385] leading-none">
              ${formatVolume(latestVolume)} {t('prediction.eventCard.vol')}
            </div>
          )}
          {isLive ? (
            <div className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-medium">
              {t('prediction.eventCard.live')}
            </div>
          ) : null}
        </div>
        {/* <FavoriteEventButton eventId={event.id || ''} initialIsFavorite={event.isFavorite || false} /> */}
      </div>
    </div>
  )
}
