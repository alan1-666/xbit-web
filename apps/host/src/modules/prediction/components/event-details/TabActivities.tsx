import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext'
import { useEventTradeActivities } from '@/modules/prediction/hooks/useTrades'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Link, useLocation } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'
import { TradeFilterType } from '@/@generated/gql/graphql-prediction'
import { useMemo, useRef, useEffect } from 'react'
import { CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { ChainIds } from '@/types/enums.ts'
import { Loading } from '@/components/common/Loading'

const GLOBE_ICON = '/images/prediction/icon-web.svg'

const formatDateTime = (timestampSeconds: number) => {
  const d = new Date(timestampSeconds * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}:${s}`
}

const formatPriceCents = (price: number | string) => {
  const p = Number(price)
  return `${(p * 100).toLocaleString('en-US')}¢`
}

import { useTranslation } from 'react-i18next'

export const TabActivities = () => {
  const { event } = useEventDetailsPageContext()
  const location = useLocation()
  const { t } = useTranslation()

  const {
    data: activities = [],
    isPending,
    loadMore,
    canLoadMore,
    isFetchingNextPage,
  } = useEventTradeActivities({
    eventId: event?.providerId ? +event.providerId : undefined,
    filterType: TradeFilterType.Cash,
  })

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const groupItemTitles: Record<string, string> = useMemo(() => {
    const markets = event?.markets || []
    const titles: Record<string, string> = {}
    markets.forEach((market) => {
      const conditionId = market.conditionId
      if (conditionId) {
        titles[conditionId] = market.groupItemTitle || ''
      }
    })
    return titles
  }, [event?.markets])

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel || !canLoadMore || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { root: null, rootMargin: '100px', threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [canLoadMore, isFetchingNextPage, loadMore])

  if (isPending) {
    return (
      <div className="w-full space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="w-full">
        <div className="text-center py-10 text-gray-400">{t('prediction.activities.noActivities')}</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3 pb-2">
      {activities.map((activity, index) => {
        const isBuy = activity.side === 'BUY'
        const isYes = activity.outcomeIndex === 0
        const pillColor = isBuy ? 'bg-rise/80' : 'bg-fall/80'

        return (
          <Link
            key={`${activity.transactionHash}-${index}`}
            to={NAVIGATIONS.prediction.portfolioUser(activity.proxyWallet)}
            state={{ from: location }}
            className="block rounded-lg bg-white/5 border border-[#79778C29] hover:bg-white/10 transition-colors overflow-hidden"
          >
            {/* Header: arrow + bold value + pills | globe */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#18181B] ">
              <div className="flex items-center">
                {groupItemTitles[activity.conditionId] && (
                  <span className="text-base font-bold text-white mr-2">{groupItemTitles[activity.conditionId]}</span>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'px-1 py-0.5 rounded text-xs font-medium',
                      isYes ? 'text-white bg-rise/80' : 'text-white bg-fall/80',
                    )}
                  >
                    {activity.outcome}
                  </span>
                  <span className="w-px h-4 bg-white/20" />
                  <span className={cn('px-1 py-0.5 rounded text-xs font-medium text-white', pillColor)}>
                    {isBuy ? t('prediction.orderForm.buy') : t('prediction.orderForm.sell')}
                  </span>
                </div>
              </div>

              <img
                src={GLOBE_ICON}
                alt=""
                className="w-6 h-6 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (activity.transactionHash) {
                    window.open(
                      `${CHAIN_EXPLORER_TX_URLS[ChainIds.Polygon]}${activity.transactionHash}`,
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                }}
              />
            </div>

            {/* Details: 数量, 价格, 时间 */}
            <div className="bg-[#101114] py-1 px-3">
              <div className="flex justify-between items-center text-xs py-2">
                <span className="text-white/50 capitalize leading-none">{t('prediction.activities.shares')}</span>
                <span className="text-white font-medium leading-none">{Number(activity.size).toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2">
                <span className="text-white/50 capitalize leading-none">{t('prediction.activities.price')}</span>
                <span className="text-white font-medium leading-none">{formatPriceCents(activity.price)}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2">
                <span className="text-white/50 capitalize leading-none">{t('prediction.activities.time')}</span>
                <span className="text-[#A9A9B3] font-normal leading-none">{formatDateTime(activity.timestamp)}</span>
              </div>
            </div>
          </Link>
        )
      })}
      {(canLoadMore || isFetchingNextPage) && (
        <div ref={loadMoreRef} className="flex justify-center pt-4 py-6 min-h-12">
          {isFetchingNextPage && <Loading />}
        </div>
      )}
    </div>
  )
}
