import { formatBalance, formatPercent } from '@/lib/format'
import { roundByTickSize } from '@/utils/helpers'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useResponsive'
import { NAVIGATIONS } from '@/lib/navigations'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyList } from '@components/discover/EmptyList'
import { UserPositionsTable } from '@/modules/prediction/components/profile/UserPositionsTable.tsx'
import { UserProfileActivePositionsColumns } from '@/modules/prediction/components/profile/columns/activePositionsColumns.tsx'
import { useUserProfile } from '@/modules/prediction/context/UserProfileContext.tsx'
import { usePositionRealtimeUpdates } from '@/modules/prediction/hooks/usePositionRealtimeUpdates.ts'
import { useUserActivePositions } from '@/modules/prediction/hooks/useUserActivePositions.ts'
import { PositionModel } from '@/modules/prediction/models/PositionModel'
import React, { useMemo, useRef, useEffect } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { Loading } from '@/components/common/Loading'
import { useTranslation } from 'react-i18next'

const ActivePositionMobileRow = ({ position }: { position: PositionModel }) => {
  const { t } = useTranslation()
  const isPositive = Number(position.cashPnl) >= 0

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
              <div
                className="text-xs font-medium py-0.5 px-1 rounded w-fit flex shrink-0"
                style={
                  {
                    '--team-color': position.outcomeIndex === 0 ? '#00CE89' : '#EA3B4F',
                    backgroundColor: 'color-mix(in srgb, var(--team-color) 15%, transparent)',
                    color: 'var(--team-color)',
                  } as React.CSSProperties
                }
              >
                {position.outcome.length > 15 ? `${position.outcome.slice(0, 15)}...` : position.outcome}
              </div>
              <span className="text-xs text-neutral-400 truncate">
                {formatBalance(position.size)} {t('prediction.profile.shares')} {t('prediction.profile.at')}{' '}
                {roundByTickSize(Number(position.avgPrice), position.tickSize)}¢
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center my-auto shrink-0">
          <div className="flex flex-col justify-center items-end text-right">
            <span className="font-medium tracking-[0.15px] text-[12px] leading-[18px] text-white">
              {formatBalance(position.currentValue, { showCurrency: true })}
            </span>
            <span
              className={cn(
                'tracking-[0.15px] whitespace-nowrap text-[10px] leading-[16px]',
                isPositive ? 'text-emerald-500' : 'text-red-500',
              )}
            >
              <span className="font-medium">
                {formatBalance(position.cashPnl, { showCurrency: true })} ({formatPercent(position.percentPnl)})
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
    {Array.from({ length: 10 }).map((_, i) => (
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

export interface UserActivePositionsTableProps {
  userAddress: string
}

export const UserActivePositionsTable = (props: UserActivePositionsTableProps) => {
  const { t } = useTranslation()
  const { userAddress } = props
  const { activeSortBy, activeSortDirection } = useUserProfile()
  const { isMobile } = useResponsive()
  const { data, isPending, hasNextPage, isFetchingNextPage, loadMore } = useUserActivePositions(userAddress, {
    sortBy: activeSortBy,
    sortDirection: activeSortDirection,
  })

  const marketIds = useMemo(() => {
    if (!data) return []
    return data.map((position) => position.marketId)
  }, [data])

  usePositionRealtimeUpdates(userAddress, marketIds)

  const parentRef = useRef<HTMLDivElement>(null)
  const items = data || []

  const virtualizer = useWindowVirtualizer({
    count: hasNextPage ? items.length + 1 : items.length,
    estimateSize: () => 80,
    overscan: 5,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
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
              <span className="font-light text-[#FFFFFF80] text-sm pl-0">{t('prediction.profile.market')}</span>
              <span className="font-light text-[#FFFFFF80] text-sm">{t('prediction.profile.value')}</span>
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
            <span className="font-light text-[#FFFFFF80] text-sm pl-0">{t('prediction.profile.market')}</span>
            <span className="font-light text-[#FFFFFF80] text-sm">{t('prediction.profile.value')}</span>
          </div>
          <div ref={parentRef}>
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
                      transform: `translateY(${virtualItem.start - virtualizer.options.scrollMargin}px)`,
                    }}
                  >
                    {isLoader ? (
                      <div className="h-[50px] flex items-center justify-center">
                        <Loading />
                      </div>
                    ) : (
                      <ActivePositionMobileRow position={position} />
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
    <div className="flex flex-col gap-4 xl:h-[calc(100vh-420px)] xl:overflow-y-auto no-scrollbar [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-[#0a0a0a]">
      <UserPositionsTable
        positions={data || []}
        isLoading={isPending}
        variant="table"
        columns={UserProfileActivePositionsColumns}
        disableHover
        onLoadMore={loadMore}
        hasNextPage={hasNextPage}
        classNameEmpty="h-[50vh]"
      />
    </div>
  )
}
