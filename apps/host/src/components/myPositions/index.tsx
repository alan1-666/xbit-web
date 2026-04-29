import { HoldingState, setLoadingMore, setPage, setIsShowOnlyCurrentCurrency } from '@/redux/modules/holding.slice.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import Container from '@components/common/Container.tsx'
import { IconEmpty } from '@components/icon'
import MyPositionsCard from '@components/myPositions/MyPositionsCard.tsx'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { isArray, throttle } from 'lodash-es'
import { HTMLAttributes, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loading } from '@components/common/Loading.tsx'
import SortHolding, { SORT_OPTIONS } from './SortHolding.tsx'
import FilterHolding from './FilterHolding.tsx'
import CheckboxWithLabel from '../common/CheckboxWithLabel.tsx'
import { useHoldingData } from './useHoldingData.tsx'
import { useParams } from 'react-router-dom'
import { useNewHoldingData } from './hook/useNewHoldingData.tsx'

// Loading spinner for 'Load More' state
const LoadMore = (props: HTMLAttributes<HTMLDivElement>) => (
  <div className="h-full w-full flex justify-center items-center" {...props}>
    <Loading />
  </div>
)

// Placeholder loading cards
const ListCardSkeleton = () => (
  <div className="mt-2.5 space-y-1.5">
    {[...Array(2)].map((_, i) => (
      <Skeleton key={i} className="h-40" />
    ))}
  </div>
)

// Empty state UI
const EmptyList = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-80">
      <IconEmpty />
      <span className="text-[#FFFFFF80] text-[0.75rem] text-center max-w-[320px]">
        {t('detail.myPositions.noData')}
      </span>
    </div>
  )
}

const MyPositions = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { address } = useParams()

  const { loading, hasMore, page, loadingMore, isShowOnlyCurrentCurrency, sortBy } = useAppSelector(
    (state: RootState) => state.holding as HoldingState,
  )

  const [isFetching, setIsFetching] = useState(false)
  // const { filteredData, listFallbackPrices } = useHoldingData()
  const { filteredData, listFallbackPrices } = useNewHoldingData()
  const [openSortPopup, setOpenSortPopup] = useState(false)
  const [openFilterPopup, setOpenFilterPopup] = useState(false)

  const loadMoreFn = async () => {
    if (loading || loadingMore || !hasMore) return false
    dispatch(setLoadingMore(true))
    dispatch(setPage(page + 1))
    return hasMore
  }
  

  const renderContent = useMemo(() => {
    if (loading && filteredData.length === 0) return <ListCardSkeleton />
    if (filteredData.length === 0) return <EmptyList />

    return (
      <div className="mt-2.5 flex flex-col gap-2">
        {filteredData.map((item, index) => {
          const fallBackPrice = listFallbackPrices.find((price) => price?.token === item.token)?.price || item?.price
          const isCurrentToken = item.token === address
          return (
            <MyPositionsCard
              item={item}
              key={`${item.token}-${index}`}
              isProcessing={item?.isProcessing}
              fallBackPrice={isCurrentToken ? item?.price : fallBackPrice}
            />
          )
        })}
        {loadingMore && <LoadMore />}
      </div>
    )
  }, [filteredData, loading, loadingMore, listFallbackPrices])

  useEffect(() => {
    const throttled = throttle(() => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const LOAD_MORE_SCROLL_THRESHOLD = 0.75

      if ((scrollTop + windowHeight) / docHeight >= LOAD_MORE_SCROLL_THRESHOLD && !isFetching && hasMore) {
        setIsFetching(true)
        loadMoreFn().finally(() => setIsFetching(false))
      }
    }, 200)

    window.addEventListener('scroll', throttled)
    return () => window.removeEventListener('scroll', throttled)
  }, [isFetching, hasMore, loadMoreFn])

  const sortByToLabel = useMemo(() => {
    const option = SORT_OPTIONS.find(
      (opt) => opt.value === sortBy.replace('-', '') || opt.value === sortBy.replace('+', ''),
    )
    let label = t('assets.funding.holding')
    if (option) {
      label = t(option.label)
    }
    const sortDirection = sortBy.startsWith('-') ? t('holding.sort.descending') : t('holding.sort.ascending')
    return `${label} ${sortDirection}`
  }, [sortBy])

  const handleOnChangeShowOnlyCurrentCurrency = (status?: boolean) => {
    dispatch(setPage(1))
    dispatch(setIsShowOnlyCurrentCurrency(!!status))
  }

  // useEffect(() => {
  //   dispatch(setIsShowOnlyCurrentCurrency(false))
  // }, [address])

  return (
    <Container className="mt-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-[330] text-[12px] text-[#908E98] leading-none">{t('holding.sort.sorting')}:</span>
          <div
            className="flex items-center gap-0.5 cursor-pointer"
            onClick={() => {
              setOpenSortPopup(true)
            }}
          >
            <span className="font-[330] text-[12px] text-white">{sortByToLabel}</span>
            <img
              src="/images/icons/arrow-down2.svg"
              alt="arrown"
              className={`w-4 h-4 cursor-pointer transition-all duration-100 ${openSortPopup ? 'rotate-180' : ''}`}
            />
          </div>
          <SortHolding open={openSortPopup} setOpen={setOpenSortPopup} />
        </div>
        <CheckboxWithLabel
          label={t('detail.myPositions.showOnlyCurrentCurrency')}
          defaultChecked={isShowOnlyCurrentCurrency}
          checked={isShowOnlyCurrentCurrency}
          onChange={handleOnChangeShowOnlyCurrentCurrency}
          labelWrapperClassName="font-[330] text-[12px]"
          containerClassName="ml-auto mr-2"
        />
        <span
          className="bg-[#18181D] px-2 py-1 rounded-full cursor-pointer"
          onClick={() => {
            setOpenFilterPopup(true)
          }}
        >
          <img src="/images/icons/more2.svg" alt="filter" className="size-4 min-w-4" />
        </span>
        <FilterHolding open={openFilterPopup} setOpen={setOpenFilterPopup} />
      </div>
      {renderContent}
    </Container>
  )
}

export default MyPositions
