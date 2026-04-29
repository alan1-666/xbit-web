import { ActivitySortField, SortDirection } from '@/@generated/gql/graphql-prediction'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'
import { Button } from '@/components/ui/button'
import { useProxyWallet } from '../../hooks/useProxyWallet'
import { useUserActivities } from '../../hooks/useUserActivities'
import { IHistoryItem } from '../../models/PortfolioModel'
import ListUserActivity from './ListUserActivity'

export const PortfolioHistory = () => {
  const { t } = useTranslation()
  const proxyWallet = useProxyWallet()
  const navigate = useNavigate()
  const {
    data: activities,
    isLoading,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
  } = useUserActivities(proxyWallet || '', {
    includePositions: true,
    sortBy: ActivitySortField.Timestamp,
    sortDirection: SortDirection.Desc,
    limit: 100,
  })

  const data = useMemo<IHistoryItem[]>(() => {
    return (activities as unknown as IHistoryItem[]) || []
  }, [activities])

  if (isLoading) {
    return (
      <div className="w-full flex flex-col">
        {/* Header */}
        <div className="hidden lg:flex border-b border-white/10 px-4 pb-2 bg-transparent text-[#FFFFFF80] text-sm font-[330]">
          <div className="w-[130px] h-full">
            <span>{t('prediction.table.activity')}</span>
          </div>
          <div className="flex-5">
            <span>{t('prediction.table.market')}</span>
          </div>
          <div className="flex-1 flex items-center justify-end gap-4">
            <div className="text-right w-16 shrink-0">
              <span>{t('prediction.table.value')}</span>
            </div>
            <div className="w-24"></div>
            <div className="w-8 shrink-0"></div>
          </div>
        </div>

        {/* Skeleton Items */}
        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col lg:flex-row items-center px-4 py-3 border-b border-white/10 gap-4">
              {/* Mobile Skeleton */}
              <div className="flex lg:hidden w-full gap-3">
                <Skeleton className="h-12 w-12 rounded-sm bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded bg-white/10" />
                  <Skeleton className="h-3 w-1/2 rounded bg-white/10" />
                </div>
              </div>

              {/* Desktop Skeleton */}
              <div className="hidden lg:flex w-full items-center gap-0">
                <div className="w-[130px] flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full bg-white/10" />
                  <Skeleton className="h-4 w-16 rounded bg-white/10" />
                </div>
                <div className="flex-5 flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-sm bg-white/10 shrink-0" />
                  <div className="flex flex-col gap-2 w-full max-w-[300px]">
                    <Skeleton className="h-4 w-full rounded bg-white/10" />
                    <Skeleton className="h-3 w-1/2 rounded bg-white/10" />
                  </div>
                </div>
                <div className="flex-1 flex justify-end gap-4">
                  <Skeleton className="h-4 w-20 rounded bg-white/10" />
                  <Skeleton className="h-4 w-24 rounded bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col h-[300px] w-full items-center justify-center">
        <EmptyList containerClassName="h-auto" emptyText={t('prediction.table.noTrades')} />
        <Button
          className="mt-4 rounded-full h-10 px-6 flex-none"
          variant="gradient"
          onClick={() => navigate(NAVIGATIONS.prediction.home())}
        >
          {t('prediction.history.goToPrediction')}
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col">
      <div className="hidden xl:flex border-b border-white/10 px-4 pb-2 bg-transparent text-[#FFFFFF80] text-sm font-[330]">
        <div className="w-32.5 h-full">
          <span>{t('prediction.table.activity')}</span>
        </div>
        <div className="flex-5">
          <span>{t('prediction.table.market')}</span>
        </div>
        <div className="flex-1 flex items-center justify-end gap-4">
          <div className="text-right w-16 shrink-0">
            <span>{t('prediction.table.value')}</span>
          </div>
          <div className="w-24"></div>
          <div className="w-8 shrink-0"></div>
        </div>
      </div>
      <ListUserActivity
        data={data}
        className="h-[calc(100vh-130px)] xl:h-[calc(100vh-280px)] -mt-1"
        loadMore={loadMore}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  )
}
