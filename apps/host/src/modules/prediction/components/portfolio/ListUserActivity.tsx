import { TFunction } from 'i18next'
import { useState } from 'react'
import { IHistoryItem } from '../../models/PortfolioModel'
import { CircleArrowDownIcon, CircleCheckIcon, CircleMinusIcon, CirclePlusIcon, CircleXIcon } from '../icons'
import { UserActivityDesktopRow } from './UserActivityDesktopRow'
import { UserActivityMobileRow } from './UserActivityMobileRow'

const getActivityDetails = (item: IHistoryItem, t: TFunction) => {
  const isDeposit = item.type === 'DEPOSIT'
  const isTrade = item.type === 'TRADE'
  const isRedeem = item.type === 'REDEEM'
  const isBuy = item.side === 'BUY'

  let isLost = false

  let activityLabel = ''
  let ActivityIcon = CircleCheckIcon
  let iconColor = ''

  if (isDeposit) {
    activityLabel = t('prediction.history.labels.deposited')
    ActivityIcon = CircleArrowDownIcon
    iconColor = 'text-[#899cb2]'
  } else if (isTrade) {
    if (isBuy) {
      activityLabel = t('prediction.history.labels.bought')
      ActivityIcon = CirclePlusIcon
    } else {
      activityLabel = t('prediction.history.labels.sold')
      ActivityIcon = CircleMinusIcon
    }
    iconColor = 'text-[#899cb2]'
  } else if (item.isLost) {
    activityLabel = t('prediction.history.labels.lost')
    isLost = true
    ActivityIcon = CircleXIcon
    iconColor = 'text-fall'
  } else if (isRedeem) {
    activityLabel = t('prediction.history.labels.claimed')
    ActivityIcon = CircleCheckIcon
    iconColor = 'text-rise'
  }

  return {
    isDeposit,
    isTrade,
    isRedeem,
    isBuy,
    activityLabel,
    ActivityIcon,
    iconColor,
    isLost,
  }
}

import { cn } from '@/lib/utils'

import { Loading } from '@/components/common/Loading'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const ListUserActivity = ({
  data,
  className,
  loadMore,
  hasNextPage,
  isFetchingNextPage,
}: {
  data: IHistoryItem[]
  className?: string
  loadMore?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}) => {
  const { t } = useTranslation()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const items = data || []
  const virtualizer = useVirtualizer({
    count: hasNextPage ? items.length + 1 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })

  const virtualItems = virtualizer.getVirtualItems()

  useEffect(() => {
    const isLoaderVisible = virtualItems.some((v) => v.index === items.length)
    if (isLoaderVisible && hasNextPage && !isFetchingNextPage) {
      loadMore?.()
    }
  }, [hasNextPage, isFetchingNextPage, items.length, loadMore, virtualItems])

  return (
    <div ref={parentRef} className={cn('w-full h-full overflow-y-auto _hidescrollbar', className)}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const isLoader = virtualItem.index >= items.length
          const item = items[virtualItem.index]

          if (isLoader) {
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="w-full flex justify-center py-4"
              >
                <Loading />
              </div>
            )
          }

          const { isDeposit, isTrade, isBuy, isLost, activityLabel, ActivityIcon, iconColor } = getActivityDetails(
            item,
            t,
          )

          const valueColor = item.usdcSize < 0 || (isTrade && isBuy) || isLost ? 'text-white' : 'text-emerald-500'
          const absUsdcSize = item.usdcSize
          const displaySign = (isTrade && isBuy) || item.usdcSize < 0 || isLost ? '-' : '+'
          const isExpanded = expandedIndex === virtualItem.index

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className="w-full"
            >
              <UserActivityDesktopRow
                item={item}
                activityLabel={activityLabel}
                ActivityIcon={ActivityIcon}
                isDeposit={isDeposit}
                isTrade={isTrade}
                isBuy={isBuy}
                valueColor={valueColor}
                displaySign={displaySign}
                absUsdcSize={absUsdcSize}
                iconColor={iconColor}
              />
              <UserActivityMobileRow
                item={item}
                activityLabel={activityLabel}
                isDeposit={isDeposit}
                isTrade={isTrade}
                isBuy={isBuy}
                valueColor={valueColor}
                displaySign={displaySign}
                absUsdcSize={absUsdcSize}
                isExpanded={isExpanded}
                toggleExpand={() => toggleExpand(virtualItem.index)}
                iconColor={iconColor}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ListUserActivity
