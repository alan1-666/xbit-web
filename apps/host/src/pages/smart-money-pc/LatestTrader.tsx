import { useMemo, useCallback } from 'react'
import { CardGrid } from './components/CardGrid'
import { ListTable } from './components/ListTable'
import useDebounceValue from '@/hooks/useDebounceValue'
import { useTranslation } from 'react-i18next'
import { useSmartMoneyInfinite } from '@/hooks/useSmartMoneyInfinite'
import type { ViewMode } from '@/components/ViewToggle'
import { Loading } from '@components/common/Loading.tsx'
import { IconEmpty } from '@components/icon'

type SortBy = 'NET_PNL' | 'ROI' | 'AVG_WIN_RATE'

type Props = {
  layout: ViewMode
  keyword: string
  sortBy: SortBy
  periodDays: number
  recentDays: number
  tagIds: number[]
}

const LatestTrader = ({ layout, keyword, sortBy, periodDays, recentDays, tagIds }: Props) => {
  const debouncedAddr = useDebounceValue(keyword, 400)
  const { t } = useTranslation()

  const tagIdsNumber = useMemo(
    () =>
      tagIds
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b),
    [tagIds],
  )

  const { list, fetchNextPage, hasNextPage, isFetchingNextPage, status, searchMode } = useSmartMoneyInfinite({
    address: debouncedAddr,
    periodDays,
    recentDays,
    pageSize: 100,
    tagIds: tagIdsNumber.length ? tagIdsNumber : undefined,
    sortBy,
  })

  const onCardClick = useCallback((addr: string) => {
    window.open(`/futures/smart-money/${addr}`, '_blank')
  }, [])

  const handleEnd = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (status === 'pending') {
    return (
      <div className="h-[calc(100vh-160px)] w-full grid place-items-center">
        <Loading className="size-7.5" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="h-[calc(100vh-160px)] w-full grid place-items-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/images/icons/transfer-fail.svg" alt="Failed" className="w-10 h-10" />
          <div className="text-white/80 text-sm">{t('common.loadingFailed', 'Loading failed')}</div>
          <div className="text-white/50 text-xs">{t('common.tryAgainLater', 'Please try again later...')}</div>
        </div>
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <div className="h-[calc(100vh-160px)] w-full grid place-items-center">
        <div className="flex flex-col items-center gap-2 text-white/60 text-center">
          <IconEmpty />
          <div className="leading-6">{t('common.noData', 'No data')}</div>
        </div>
      </div>
    )
  }

  return layout === 'card' ? (
    <CardGrid data={list} onEndReached={handleEnd} onCardClick={onCardClick} />
  ) : (
    <ListTable data={list} onEndReached={handleEnd} onRowClick={onCardClick} />
  )
}

export default LatestTrader
