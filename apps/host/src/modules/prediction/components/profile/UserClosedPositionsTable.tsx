import { Loading } from '@/components/common/Loading'
import { Skeleton } from '@/components/ui/skeleton'
import { useResponsive } from '@/hooks/useResponsive'
import { formatBalance, formatPercent } from '@/lib/format'
import { roundByTickSize } from '@/utils/helpers'
import { NAVIGATIONS } from '@/lib/navigations'
import { cn } from '@/lib/utils'
import { UserPositionsTable } from '@/modules/prediction/components/profile/UserPositionsTable.tsx'
import { closedPositionsColumns } from '@/modules/prediction/components/profile/columns/closedPositionsColumns.tsx'
import { useUserProfile } from '@/modules/prediction/context/UserProfileContext.tsx'
import { useUserClosedPositions } from '@/modules/prediction/hooks/useUserClosedPositions.ts'
import { ClosedPositionModel } from '@/modules/prediction/models/ClosedPositionModel.ts'
import { EmptyList } from '@components/discover/EmptyList'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CircleCheckIcon, CircleXIcon } from '../icons'

const ClosedPositionMobileRow = ({ position }: { position: ClosedPositionModel }) => {
  const realizedPnl = Number(position.realizedPnl)
  const avgPrice = Number(position.avgPrice)
  const shares = Number(position.totalBought)
  const totalBet = avgPrice * shares
  const amountWon = totalBet + realizedPnl
  const pnlPercent = totalBet > 0 ? realizedPnl / totalBet : 0
  const isLost = realizedPnl < 0

  return (
    <div className="border-b border-white/5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link to={NAVIGATIONS.prediction.eventDetails(position.eventSlug || '')}>
            <Avatar className="h-12 w-12 min-w-12 rounded-sm border border-white/5 cursor-pointer">
              <AvatarImage src={position.icon} alt={position.title} className="object-cover" />
              <AvatarFallback className="rounded-sm text-xs">{position.title?.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={NAVIGATIONS.prediction.eventDetails(position.eventSlug || '')} className="hover:underline">
              <p className="text-sm font-medium text-white line-clamp-2">{position.title}</p>
            </Link>
            <div className="flex items-center gap-1 mt-1">
              {isLost ? (
                <div className="flex items-center gap-1 shrink-0">
                  <CircleXIcon className="text-fall" />
                  <span className="text-xs font-medium text-white">Lost</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 shrink-0">
                  <CircleCheckIcon className="text-rise" />
                  <span className="text-xs font-medium text-white">Won</span>
                </div>
              )}
              <span className="text-xs text-neutral-400 truncate">
                {formatBalance(position.totalBought)} {position.outcome} at{' '}
                {roundByTickSize(
                  avgPrice,
                  position.outcomeIndex === 0 ? position.tokenYesTickSize : position.tokenNoTickSize,
                )}
                ¢
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center my-auto shrink-0">
          <div className="flex flex-col justify-center items-end text-right">
            <span className="font-medium tracking-[0.15px] text-[12px] leading-[18px] text-white">
              {formatBalance(amountWon, { showCurrency: true })}
            </span>
            <span
              className={cn(
                'tracking-[0.15px] whitespace-nowrap text-[10px] leading-[16px]',
                isLost ? 'text-red-500' : 'text-emerald-500',
              )}
            >
              <span className="font-medium">
                {formatBalance(realizedPnl, { showCurrency: true })} ({formatPercent(pnlPercent * 100)})
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const MobileLoadingSkeleton = () => (
  <div>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="border-b border-white/5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-12 w-12 min-w-12 rounded-sm" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-5 w-10 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

export interface UserClosedPositionsTableProps {
  userAddress: string
}

export const UserClosedPositionsTable = (props: UserClosedPositionsTableProps) => {
  const { userAddress } = props
  const { closedSortBy, closedSortDirection } = useUserProfile()
  const { isMobile } = useResponsive()
  const { t } = useTranslation()
  const { data, isPending, hasNextPage, isFetchingNextPage, loadMore } = useUserClosedPositions(userAddress, {
    sortBy: closedSortBy,
    sortDirection: closedSortDirection,
  })

  const parentRef = useRef<HTMLDivElement>(null)
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
      loadMore()
    }
  }, [hasNextPage, isFetchingNextPage, items.length, loadMore, virtualItems])

  if (isMobile) {
    if (isPending) return <MobileLoadingSkeleton />
    if (!data?.length) {
      return (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 pt-2 mb-2">
              <span className="font-light text-[#FFFFFF80] text-sm pl-0">{t('prediction.profile.result')}</span>
              <span className="font-light text-[#FFFFFF80] text-sm">{t('prediction.profile.amountWon')}</span>
            </div>
            <div className="flex h-full w-full items-center justify-center">
              <EmptyList emptyText={t('prediction.profile.noPositionsFound')} />
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 pt-2 mb-2">
            <span className="font-light text-[#FFFFFF80] text-sm pl-0">{t('prediction.profile.result')}</span>
            <span className="font-light text-[#FFFFFF80] text-sm">{t('prediction.profile.amountWon')}</span>
          </div>
          <div
            ref={parentRef}
            className="overflow-y-auto _hidescrollbar"
            style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualItems.map((virtualItem) => {
                const isLoader = virtualItem.index >= items.length
                const position = items[virtualItem.index]

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
                  >
                    {isLoader ? (
                      <div className="h-[50px] flex items-center justify-center">
                        <Loading />
                      </div>
                    ) : (
                      <ClosedPositionMobileRow position={position} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <UserPositionsTable<ClosedPositionModel>
        positions={data || []}
        isLoading={isPending}
        variant="table"
        columns={closedPositionsColumns}
        disableHover
        onLoadMore={loadMore}
        hasNextPage={hasNextPage}
        classNameEmpty="h-[50vh]"
      />
    </div>
  )
}
