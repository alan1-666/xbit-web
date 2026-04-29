import FilterArrowSort from '@components/detaiTokenTable/FilterArrowSort.tsx'
import { setDisplayDateTimeMode, setSortByCreatedAt, TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { useCallback, useContext } from 'react'
import { SortByCreateAtType } from '@/types/enums.ts'
import { TradingTransactionsContext } from '@components/detaiTokenTable/TradingTransactionsContext.ts'
import { cn } from '@/lib/utils.ts'

export const TimeHeaderCell = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const sortByCreatedAt = useAppSelector((state: RootState) => (state.tokenDetail as TokenDetailState).sortByCreatedAt)
  const displayDateTimeMode = useAppSelector(
    (state: RootState) => (state.tokenDetail as TokenDetailState).displayDateTimeMode,
  )
  const startDate = useAppSelector((state: RootState) => (state.tokenDetail as TokenDetailState).startDate)
  const endDate = useAppSelector((state: RootState) => (state.tokenDetail as TokenDetailState).endDate)
  const { datePickerRef } = useContext(TradingTransactionsContext)

  const handleSort = useCallback(() => {
    const currentDirection = sortByCreatedAt
    if (currentDirection === SortByCreateAtType.DESC) {
      dispatch(setSortByCreatedAt(SortByCreateAtType.ASC))
    } else if (currentDirection === SortByCreateAtType.ASC) {
      dispatch(setSortByCreatedAt(SortByCreateAtType.DESC))
    }
  }, [sortByCreatedAt])

  return (
    <div className={cn('flex items-center gap-[2px]', displayDateTimeMode ? 'min-w-[100px]' : 'min-w-[80px]')}>
      <div>{t('detail.tokenDetail.time')}</div>
      <div className="flex items-center cursor-pointer justify-center gap-1">
        <FilterArrowSort sortByCreatedAt={sortByCreatedAt} handleOnclickSort={handleSort} />
        <img
          src="/images/tokenDetail/icon-clock.svg"
          className="w-[12px] h-[12px]"
          alt="icon clock"
          onClick={() => dispatch(setDisplayDateTimeMode(!displayDateTimeMode))}
        />
        <Button
          size="xs"
          className="rounded-full bg-transparent p-0 h-4.5"
          onClick={() => datePickerRef.current?.open()}
        >
          <img
            src={startDate || endDate ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
            className="w-[11px] h-[11px]"
            alt="icon filter"
          />
        </Button>
      </div>
    </div>
  )
}
