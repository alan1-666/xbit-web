import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useResponsive } from '@/hooks/useResponsive'
import { NAVIGATIONS } from '@/lib/navigations'
import { cn } from '@/lib/utils'
import { CashOutModal } from '@/modules/prediction/components/portfolio/PositionsCellRender/CashOutModal'
import { usePositionRealtimeUpdates } from '@/modules/prediction/hooks/usePositionRealtimeUpdates.ts'
import { useResolvedMarketsListener } from '@/modules/prediction/hooks/useResolvedMarketsListener'
import { useUserActivePositions } from '@/modules/prediction/hooks/useUserActivePositions'
import { selectResolvedMarketIds } from '@/redux/modules/resolvedMarkets.slice'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { DataTable } from '@pages/meme/discover/desktop/components/DataTable.tsx'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useClaimablePositions } from '../../hooks/useClaimablePositions'
import { useMarketsByIds } from '../../hooks/useMarketsByIds'
import { useProxyWallet } from '../../hooks/useProxyWallet'
import { IPortfolioPosition } from '../../models/PortfolioModel'
import LoadingState from '../portfolio/PositionsCellRender/LoadingState'
import { PositionCard } from './PositionCard'
import { usePortfolioColumns } from './usePortfolioColumns'
import { useAppSelector } from '@/redux/store'
import { _userInfo } from '@/redux/modules/newAuth.slice'

const CardSkeleton = () => (
  <div className="flex w-full flex-col gap-4 rounded-lg border-[0.5px] border-[#FFFFFF1A] bg-[#101114] p-4 xl:max-w-81.25">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded bg-white/10" />
        <Skeleton className="h-4 w-16 rounded bg-white/10" />
        <Skeleton className="h-5 w-10 rounded-md bg-white/10" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <Skeleton className="h-4 w-14 rounded bg-white/10" />
        <Skeleton className="h-3 w-10 rounded bg-white/10" />
      </div>
    </div>
    <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-3 w-8 rounded bg-white/10" />
          <Skeleton className="h-3 w-12 rounded bg-white/10" />
        </div>
      ))}
    </div>
    <Skeleton className="h-12 w-full rounded-lg bg-white/10" />
    <div className="flex items-start justify-between border-t border-white/5 pt-3">
      <Skeleton className="h-8 w-20 rounded bg-white/10" />
      <Skeleton className="h-8 w-16 rounded bg-white/10" />
    </div>
  </div>
)

interface PortfolioPositionsTableProps {
  filter?: 'active' | 'closed'
  headerCellClassName?: string
}

export const PortfolioPositionsTable = ({ filter = 'active', headerCellClassName }: PortfolioPositionsTableProps) => {
  const { t } = useTranslation()
  const { activeColumns, closedColumns } = usePortfolioColumns()
  const resolvedMarketIds = useSelector(selectResolvedMarketIds)

  const { data: claimableData } = useClaimablePositions()
  const claimableList = claimableData?.raw?.positions || []

  const proxyWallet = useProxyWallet()
  const { isDesktop } = useResponsive()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isOnAssets =
    pathname.includes('/assets') &&
    (searchParams.get('page') === 'prediction' || pathname.includes('/assets/prediction'))

  const {
    data: activePositions,
    isPending: isActiveLoading,
    refetch: refetchActivePositions,
  } = useUserActivePositions(proxyWallet || '', {
    filter: {
      redeemable: false,
    },
    // refetchInterval: 5000,
  })

  useEffect(() => {
    if (!proxyWallet) return
    const interval = setInterval(() => {
      refetchActivePositions()
    }, 5000)
    return () => clearInterval(interval)
  }, [proxyWallet])

  const marketIds = useMemo(() => {
    if (!activePositions) return []
    return activePositions.map((position) => position.marketId)
  }, [activePositions])

  usePositionRealtimeUpdates(proxyWallet, marketIds)
  useResolvedMarketsListener(marketIds)

  const userId = useAppSelector(_userInfo)?.userId

  const conditionIds = useMemo(() => {
    if (!activePositions) return []
    return [...new Set(activePositions.map((p) => p.conditionId).filter(Boolean))] as string[]
  }, [activePositions])

  const { data: markets = [] } = useMarketsByIds(conditionIds)

  const marketsMap = useMemo(() => {
    const map = new Map<string, any>()
    markets.forEach((m) => {
      if (m.conditionId) {
        map.set(m.conditionId, m)
      }
    })
    return map
  }, [markets])

  const positions = useMemo(() => {
    const items = filter === 'active' ? activePositions || [] : []

    const filtered = items.map((p) => {
      const market = marketsMap.get(p.conditionId)
      return {
        ...p,
        groupItemTitle: market?.groupItemTitle || '',
        title: p.title || market?.question || market?.description || '',
        slug: p.slug || market?.slug || '',
        icon: p.icon || market?.events?.[0]?.image || '',
        eventSlug: p.eventSlug || market?.events?.[0]?.slug || '',
        eventId: p.eventId || market?.events?.[0]?.id || '',
        endDate: p.endDate || market?.endDate || '',
      }
    })

    // Sort by title alphabetically, then by avgPrice descending
    filtered.sort((a, b) => {
      const titleCompare = (a.title || '').localeCompare(b.title || '')
      if (titleCompare !== 0) return titleCompare
      return (Number(b.avgPrice) || 0) - (Number(a.avgPrice) || 0)
    })

    return filtered
  }, [filter, activePositions, marketsMap])

  const isLoading = proxyWallet && filter === 'active' ? isActiveLoading : false

  const columns = filter === 'active' ? activeColumns : closedColumns

  const tableData = useMemo<IPortfolioPosition[]>(() => {
    if (isLoading || positions.length === 0) return []
    return [...positions]
  }, [positions, isLoading])

  const emptyComponent = (
    <div className="flex flex-col h-[300px] w-full items-center justify-center">
      <EmptyList containerClassName="h-auto" emptyText={t('prediction.table.noPositions')} />
      <Button
        className="mt-4 rounded-full h-10 px-6 flex-none"
        variant="gradient"
        onClick={() => navigate(NAVIGATIONS.prediction.home())}
      >
        {t('prediction.history.goToPrediction')}
      </Button>
    </div>
  )

  if (isLoading) {
    if (!isDesktop) {
      return (
        <div className="grid auto-rows-min grid-cols-1 gap-4 px-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )
    }
    return <LoadingState columns={columns} />
  }

  if (tableData.length === 0) {
    return <div className="w-full">{emptyComponent}</div>
  }

  if (!isDesktop) {
    const positionsToShow = tableData.filter((item) => !item.isTotal)
    return (
      <div className="grid auto-rows-min grid-cols-1 gap-4 px-3 pb-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {positionsToShow.map((item, index) => {
          const curPrice = Number(item.curPrice) || 0
          const size = Number(item.size)
          const initialValue = Number(item.initialValue)
          const realtimeCurrentValue = curPrice * size
          const realtimeCashPnl = realtimeCurrentValue - initialValue
          const realtimePercentPnl = initialValue !== 0 ? (realtimeCashPnl / initialValue) * 100 : 0
          const realtimePosition = {
            ...item,
            currentValue: realtimeCurrentValue,
            cashPnl: realtimeCashPnl,
            percentPnl: realtimePercentPnl,
          }
          return (
            <PositionCard
              key={item.marketId ? `${item.marketId}-${item.outcome}-${index}` : index}
              position={realtimePosition}
              showEventHeader={isOnAssets}
              currentTitle={t('prediction.profile.currentSell')}
              renderSellButton={
                filter !== 'closed'
                  ? (pos) => {
                      const isClaimable =
                        claimableList.some((p) => p.conditionId === pos.conditionId && p.tokenId === pos.tokenId) ||
                        (pos.marketId ? resolvedMarketIds.has(pos.marketId) : false)
                      return isClaimable ? (
                        <Button
                          className="mx-3 mt-2 mb-3 h-12 flex items-center justify-center rounded-[6px] bg-green-600/70 font-medium text-white"
                          onClick={() =>
                            toast.info(t('prediction.positionCard.POLYMARKET_ORDER_CREATION_RESOLVED_MARKET'))
                          }
                        >
                          {t('assets.transfers.Processing')}
                        </Button>
                      ) : (
                        <CashOutModal position={pos}>
                          <Button
                            variant="gradient"
                            className="w-[calc(100%-24px)] mx-3 mt-2 mb-3 h-12 rounded-[6px] bg-[#EA3B4F] shadow-[0px_-4px_0px_0px_#0000004D_inset]"
                          >
                            {t('prediction.table.sell')}
                          </Button>
                        </CashOutModal>
                      )
                    }
                  : undefined
              }
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="w-full">
      <DataTable
        data={tableData}
        columns={columns}
        isLoading={false}
        className="border-none"
        headerClassName="bg-transparent border-white/10 text-[#FFFFFF80] text-sm font-[330]"
        headerCellClassName={cn('text-[#FFFFFF80] text-sm font-[330] h-auto pb-2 pt-0.5', headerCellClassName)}
        rowClassName="border-b border-white/5 hover:bg-white/5 h-[65px]"
        noDataComponent={emptyComponent}
      />
    </div>
  )
}
