import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ReactComponent as SearchIcon } from '@/components/icon/smart-money/search.svg'
import { IconEmpty } from '@components/icon'
import clsx from 'clsx'
import { useSmartMoneyInfinite } from '@/hooks/useSmartMoneyInfinite'
import { useTranslation } from 'react-i18next'
import { TraderCard, TraderCardSkeleton } from '../Card'
import TagSelector from './TagSelectorDrawer'
import DrawerCheckSelect from '@/components/common/DrawerCheckSelect'
import SearchView from './SearchView'
import { SmartMoneySortField } from '@/types/hypertrader.types'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loading } from '@/components/common/Loading'
import { useGetTraderTagDefinitions } from '@/hooks/useGetTraderTagDefinitions'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { useFetchTopTraders } from '../../hooks'
import TopTraderCard, { TopTraderCardSkeleton } from '../TopTraderCard'
import { useLangKey } from '@/utils/address'
import { ReactComponent as LoadingIcon } from '@/components/icon/smart-money/loading.svg'
import InfoPanel from './InfoPanel'

const timeOptions = [
  { label: '1D', value: '1' },
  { label: '7D', value: '7' },
  { label: '30D', value: '30' },
]

type SortBy = 'NET_PNL' | 'ROI' | 'AVG_WIN_RATE'

const SmartMoney = () => {
  const { t } = useTranslation()
  const lang = useLangKey()
  const navigate = useNavigate()
  const { isDesktop } = useResponsive()
  const location = useLocation()

  const typeOptions = [
    { label: t('smartMoney.latestTrader.winRate'), value: 'AVG_WIN_RATE' },
    { label: t('smartMoney.latestTrader.realizedPnL'), value: 'NET_PNL' },
    { label: 'ROE', value: 'ROI' },
  ]

  const [seletecteType, setSeletctedType] = useState<string>(typeOptions[2].value)
  const [periodDays, setPeriodDays] = useState<number>(1)
  const [tagIds, setTagIds] = useState<string[]>([])
  const [openSearch, setOpenSearch] = useState<boolean>(false)
  const [open, setOpen] = useState(false)
  const [typeDrawer, setTypeDrawer] = useState<'MaxDrawdown' | 'ProfitFactor' | 'SharpeRatio'>('MaxDrawdown')

  const tagIdsNumber = useMemo(() => tagIds.map(Number).filter(Number.isFinite), [tagIds])
  const { data: tagsList, loading: tagsListLoading, error: tagsListError } = useGetTraderTagDefinitions()

  const { list, fetchNextPage, hasNextPage, isFetchingNextPage, status, searchMode } = useSmartMoneyInfinite({
    address: '',
    periodDays,
    recentDays: 1,
    pageSize: isDesktop ? 100 : 10,
    tagIds: tagIdsNumber.length ? tagIdsNumber : undefined,
    sortBy: seletecteType as SortBy,
  })

  const { data: topTraders, loading: topTradersLoading, error } = useFetchTopTraders()

  const handlePeriodChange = (value: string) => {
    setPeriodDays(Number(value || 0))
  }

  const onCardClick = (addr: string) => {
    navigate(`/futures/smart-money/${addr}`, {
      replace: true,
      state: {
        periodDays,
        seletecteType,
        tagIds,
      },
    })
  }

  const onOpen = (type: 'MaxDrawdown' | 'ProfitFactor' | 'SharpeRatio') => {
    setOpen(true)
    setTypeDrawer(type)
  }

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (location.state) {
      setPeriodDays(location.state.periodDays || 1)
      setSeletctedType(location.state.seletecteType || typeOptions[2].value)
      setTagIds(location.state.tagIds || [])
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (!listRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.current

    if (scrollTop + clientHeight >= scrollHeight - 10 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    const currentList = listRef.current
    if (currentList) {
      currentList.addEventListener('scroll', handleScroll)
    }
    return () => {
      if (currentList) {
        currentList.removeEventListener('scroll', handleScroll)
      }
    }
  }, [handleScroll])

  useEffect(() => {
    const handleScroll = () => {
      const mobilePage = document.getElementById('mobile-smart-money-page')
      if (!mobilePage) return

      const { scrollTop, scrollHeight, clientHeight } = mobilePage

      if (scrollTop + clientHeight >= scrollHeight - 10 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }
    const mobilePage = document.getElementById('mobile-smart-money-page')
    if (mobilePage) {
      mobilePage.addEventListener('scroll', handleScroll)
    }
    return () => {
      if (mobilePage) {
        mobilePage.removeEventListener('scroll', handleScroll)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleTypeSeleted = (value: any) => {
    setSeletctedType(value)
  }

  const getLabelByValue = (value: string) => {
    const option = typeOptions.find((opt) => opt.value === value)
    return option ? option.label : ''
  }

  const handleSearch = () => {
    setOpenSearch(!openSearch)
  }

  const handleTagsSelected = (tagId: string) => {
    setTagIds((prev) => {
      if (prev.includes(`${tagId}`)) {
        return prev.filter((id) => id !== tagId)
      }

      return [...prev, tagId]
    })
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="w-full overflow-x-auto">
        <div className="flex gap-3 whitespace-nowrap scroll-smooth">
          {topTradersLoading && (
            <div className="h-[98px] w-full grid place-items-center">
              <TopTraderCardSkeleton />
            </div>
          )}

          {topTraders &&
            topTraders.slice(0, 5).map((item, index) => (
              <div key={index} className="flex-shrink-0">
                <TopTraderCard trader={item} onClick={onCardClick} />
              </div>
            ))}
        </div>
      </div>

      <div className="sticky top-0 z-10 gap-2 mt-3 mb-4">
        <div className="flex w-full h-7 py-[5px] items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <DrawerCheckSelect
              childrenTrigger={
                <div className="flex items-center bg-[#18181D] px-2 py-[5px] min-w-[92px] rounded-[6px] text-white app-font-regular gap-1">
                  <div className="cursor-pointer text-white text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]  app-font-regular w-[calc(100%_-_10px)]">
                    {getLabelByValue(seletecteType)}
                  </div>
                  <img className="ml-1" src="/images/futuresDetail/select-down-icon.svg" />
                </div>
              }
              options={typeOptions}
              value={seletecteType}
              onChange={handleTypeSeleted}
            />

            <DrawerCheckSelect
              childrenTrigger={
                <div className="flex items-center bg-[#18181D] px-2 py-[5px] min-w-[92px] rounded-[6px] text-white app-font-regular gap-1">
                  <div className="cursor-pointer text-white text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]  app-font-regular w-[calc(100%_-_10px)]">
                    {periodDays}D
                  </div>
                  <img className="ml-1" src="/images/futuresDetail/select-down-icon.svg" />
                </div>
              }
              options={timeOptions}
              value={`${periodDays}`}
              onChange={handlePeriodChange}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 px-1 py-[4px] rounded-md inline-flex justify-center items-center gap-1">
              <button
                type="button"
                aria-label="Search"
                onClick={handleSearch}
                className={clsx('grid place-items-center', 'flex-shrink-0')}
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>

            {/* <TagSelector onSelect={(value) => setTagIds(value)} /> */}
          </div>
        </div>
      </div>

      {tagsList.length > 0 && (
        <div className="self-stretch flex items-center gap-2 pb-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {tagsList.map((item, index) => {
            const isSelected = tagIds.includes(`${item.id}`)

            return (
              <button
                key={index}
                className={cn(
                  'inline-flex h-6 px-3 py-1 rounded-md items-center flex-shrink-0',
                  isSelected ? 'bg-[#2A2A33]' : 'bg-[#18181B]',
                )}
                onClick={() => handleTagsSelected(`${item.id}`)}
              >
                <span className="text-[#908E98] text-xs font-normal leading-5">
                  {lang === 'cn' ? item.nameCn : item.name}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-col w-full space-y-4 overflow-y-auto h-[calc(100vh-250px)]" ref={listRef}>
        {status === 'pending' && (
          <div className="h-[calc(100vh-160px)] w-full  flex flex-col gap-3">
            {/* <Loading className="size-7.5" /> */}
            {Array.from({ length: 2 }).map((_, idx) => (
              <div className="p-3 rounded-[16px] border-[0.5px] border-[#ffffff0a] bg-[#141418]">
                <TraderCardSkeleton />
              </div>
            ))}
          </div>
        )}

        {status === 'success' && list.length === 0 && (
          <div className="h-[calc(100vh-160px)] w-full grid place-items-center">
            <div className="flex flex-col items-center gap-2 text-white/60 text-center">
              <IconEmpty />
              <div className="leading-6">{t('common.noData', 'No data')}</div>
            </div>
          </div>
        )}

        {status === 'success' &&
          list.length > 0 &&
          list.map((item, index) => (
            <div>
              <TraderCard
                key={item.user_address}
                id={item.user_address}
                item={item}
                commitMode="debounce"
                onClick={onCardClick}
                periodDays={periodDays}
                portfolioData={item.portfolioData}
                onOpen={onOpen}
              />
            </div>
          ))}

        {isFetchingNextPage && (
          <div className="flex items-center justify-center animate-spin text-purple-500">
            <LoadingIcon className="h-4 w-4" />
          </div>
        )}
      </div>

      {openSearch && (
        <SearchView
          handleBack={() => setOpenSearch(!openSearch)}
          periodDays={periodDays}
          tagIdsNumber={tagIdsNumber}
          seletecteType={seletecteType as SmartMoneySortField}
        />
      )}

      {open && <InfoPanel open={open} setOpen={setOpen} type={typeDrawer} />}
    </div>
  )
}

export default memo(SmartMoney)
