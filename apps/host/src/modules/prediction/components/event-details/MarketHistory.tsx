import { IconEmpty } from '@/components/icon'
import { LoadMore } from '@/components/ui/loading-spinner'
import { formatAmount, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { TradeActivityModel } from '@/modules/prediction/models/TradeModel.ts'
import { roundByTickSize } from '@/utils/helpers'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

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

interface MarketHistoryProps {
  activities: TradeActivityModel[]
  className?: string
  loadMore?: () => void
  canLoadMore?: boolean
  isFetchingNextPage?: boolean
}

export const MarketHistory = ({
  activities,
  className,
  loadMore,
  canLoadMore,
  isFetchingNextPage,
}: MarketHistoryProps) => {
  const observerTarget = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && canLoadMore && !isFetchingNextPage) {
          loadMore?.()
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [canLoadMore, isFetchingNextPage, loadMore])

  return (
    <div className={cn('w-full max-h-[400px] overflow-y-auto py-2 xl:pr-1', className)}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 w-full col-span-full">
            <IconEmpty />
            <span className="text-[#FFFFFF80] text-[0.75rem]">{t('history.nodata')}</span>
          </div>
        ) : (
          activities.map((activity, index) => {
            const isBuy = activity.side === 'BUY'
            const isYes = activity.outcomeIndex === 0
            const pillColor = isBuy ? 'bg-rise/80' : 'bg-fall/80'
            const tickSize = isYes ? activity.tokenYesTickSize : activity.tokenNoTickSize

            return (
              <div
                key={`${activity.transactionHash}-${index}`}
                className="rounded-lg bg-white/5 border border-[#79778C29] overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#18181B]">
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="text-base font-bold text-white truncate" title={activity.title}>
                      {activity.title}
                    </span>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span
                        className={cn(
                          'px-1 py-0.5 rounded text-xs font-medium text-white',
                          isYes ? 'bg-rise/80' : 'bg-fall/80',
                        )}
                      >
                        {activity.outcome}
                      </span>
                      <span className="w-px h-4 bg-white/20" />
                      <span className={cn('px-1 py-0.5 rounded text-xs font-medium text-white', pillColor)}>
                        {isBuy ? 'Buy' : 'Sell'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-[#101114] py-1 px-3">
                  <div className="flex justify-between items-center text-sm py-2">
                    <span className="text-white/50">{t('prediction.filters.shares')}</span>
                    <span className="text-white font-medium">{formatAmount(activity.size)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2">
                    <span className="text-white/50">{t('prediction.orderBook.header.price')}</span>
                    <span className="text-white font-medium">
                      {formatPrice(roundByTickSize(activity.price, tickSize))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2">
                    <span className="text-white/50">{t('prediction.profile.time')}</span>
                    <span className="text-[#A9A9B3] font-normal">{formatDateTime(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Loading Indicator & Intersection Observer Target */}
      <div ref={observerTarget} className="w-full flex justify-center py-4 mt-2 h-10">
        {isFetchingNextPage && <LoadMore className="" />}
      </div>
    </div>
  )
}
