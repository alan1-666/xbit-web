import FilterSelect from '@components/common/FilterSelect'
import FilterTime, { FilterTimeOption } from '@components/common/FilterTime'
import Container from '@components/common/Container.tsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import FilterButton from '@components/listCoin/filter/FilterButton.tsx'
import WatchlistCard from '@components/listCoin/card/WatchlistCard.tsx'
import { useTranslation } from 'react-i18next'
import { LaunchPlatformOptions } from '@/lib/constant'
import { FilterFormData } from '@components/listCoin/filter/FilterField.tsx'
import useGetListTokens from '@hooks/useGetListTokens.ts'
import { TokenTrending } from '@/types/token.ts'
import { getFavoriteTokens } from '@services/tokens.service.ts'
import BaseListCoins from '@components/listCoin/BaseListCoins.tsx'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { motion } from 'framer-motion'
import { formatHolders, formatLiquidity } from '@/lib/format.ts'
import { throttle } from 'lodash-es'
import { useStickyScroll } from '@hooks/useStickyScroll.ts'
import { useAppSelector } from '@/redux/store'
import { IconSpinner } from '@components/icon'
import { useActiveChain } from '@hooks/useActiveChain.ts'

const filterTimeOptions: FilterTimeOption[] = [
  {
    value: '1',
    unit: 'm',
  },
  {
    value: '5',
    unit: 'm',
  },
  {
    value: '1',
    unit: 'h',
  },
  {
    value: '6',
    unit: 'h',
  },
  {
    value: '24',
    unit: 'h',
  },
]

function getTradeDetail(time: string, token: TokenTrending, t: any) {
  return [
    {
      label: t('listCoin.fields.liquidityPool'),
      value: formatLiquidity(token.liquidity),
    },
    {
      label: t('detail.trading.transactions', { time }),
      value: listCoinHelper.getNumOfTransactions(token, time),
    },
    {
      label: t('detail.trading.volume', { time }),
      value: `$${listCoinHelper.getVolumes(token, time)}`,
    },
    {
      label: t('detail.tabs.holders'),
      value: token.numberOfHolder ? formatHolders(token.numberOfHolder) : '--',
    },
  ]
}

function findPriceChange(token: TokenTrending, time: string) {
  switch (time) {
    case '1m':
      return token.price1mChange
    case '5m':
      return token.price5mChange
    case '1h':
      return token.price1hChange
    case '6h':
      return token.price6hChange
    case '24h':
      return token.price24hChange
    default:
      return 0
  }
}

const ListCoins = BaseListCoins<TokenTrending>

const TabWatchlist = () => {
  const { t } = useTranslation()
  const [selectedDex, setSelectedDex] = useState<string>('All')
  const [filter, setFilter] = useState<FilterFormData>()
  const containerRef = useRef<HTMLDivElement>(null)
  const page = useRef(1)
  const lastPage = useRef(1)
  const hasMoreRef = useRef(true)
  const stickyRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const [fetchingMore, setFetchingMore] = useState(false)

  const [currentFilterTimeIndex, setCurrentFilterTimeIndex] = useState<number>(2)

  const selectedChain = useActiveChain()

  const handleFilterChange = (filter: FilterFormData) => {
    setFilter(filter)
    if (filter && filter.dex) {
      setSelectedDex(filter.dex.data)
    }

    if (filter && filter.period) {
      const timeRange = filterTimeOptions.find(
        (option) => option.value === filter.period.value && option.unit === filter.period.unit,
      )
      if (timeRange) {
        setCurrentFilterTimeIndex(filterTimeOptions.indexOf(timeRange))
      }
    }
  }

  const { tokens, loading, updateQuery, fetchMore } = useGetListTokens<TokenTrending>({
    documentNode: getFavoriteTokens,
    timeRange: filterTimeOptions[currentFilterTimeIndex],
    filter: filter as FilterFormData,
    key: 'getFavoriteToken',
    deduplicateFn: (item, index, self) => {
      return self.findIndex((i) => i.token === item.token) === index
    },
  })

  const selectedTimeRange = `${filterTimeOptions[currentFilterTimeIndex].value}${filterTimeOptions[currentFilterTimeIndex].unit}`

  const handleOnItemRemoved = (token: string) => {
    const newList = tokens.filter((item) => item.token !== token)
    updateQuery((data) => {
      return {
        ...data,
        getFavoriteToken: {
          ...data.getFavoriteToken,
          data: newList,
        },
      }
    })
  }

  const fetchMoreFn = () => {
    const hasMore = hasMoreRef.current
    if (!hasMore && loading && lastPage.current === page.current && !fetchingMore) {
      return
    }
    setFetchingMore(true)
    lastPage.current = page.current
    const newPage = page.current + 1
    fetchMore(newPage)
      .then((result) => {
        const newTokens = result.data.getFavoriteToken.data
        page.current = newPage
        hasMoreRef.current = newTokens.length === 20
      })
      .finally(() => {
        setFetchingMore(false)
      })
  }

  useEffect(() => {
    const scrollElement = containerRef.current
    if (!scrollElement) return
    const handleScroll = throttle(() => {
      // handle scroll to bottom, over 75% of the scroll should trigger load more
      const scrollOffset = scrollElement.scrollTop
      const viewportHeight = scrollElement.clientHeight
      const scrollBottom = scrollOffset + viewportHeight
      const scrollHeight = scrollElement.scrollHeight
      const scrolledRatio = scrollBottom / scrollHeight
      if (scrolledRatio > 0.75 && hasMoreRef.current) {
        fetchMoreFn()
      }
    }, 200)
    scrollElement.addEventListener('scroll', handleScroll)
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [fetchingMore])

  useEffect(() => {
    const stickyElement = document.getElementById('sticky-line') as HTMLDivElement
    const outerElement = document.getElementById('main-content') as HTMLDivElement
    if (stickyElement) {
      stickyRef.current = stickyElement
    }
    if (outerElement) {
      outerRef.current = outerElement
    }
  }, [])

  useStickyScroll({
    innerRef: containerRef,
    outerRef: outerRef,
    stickyRef: stickyRef,
  })

  const dexOptions = useMemo(() => {
    const options = LaunchPlatformOptions.map((option) => ({
      ...option,
      label: option.value === 'All' ? t('constant.all') : option.label,
    }))

    if (selectedChain === 'eth') {
      // Filter out non-Ethereum DEX options
      return options.slice(0, 1)
    }

    return options
  }, [selectedChain])

  useEffect(() => {
    if (dexOptions.some((option) => selectedDex !== option.value)) {
      setSelectedDex(dexOptions[0].value)
    }
  }, [dexOptions])

  return (
    <Container className="bg-[#111111] w-full max-h-full flex-1 flex flex-col relative">
      <div className="flex items-center justify-between pt-2 pb-[6px] gap-[10px] sticky top-9 bg-[#111111] z-20">
        <FilterSelect
          options={dexOptions}
          selectValueProps={{
            placeholder: t('listCoin.filters.all'),
          }}
          value={selectedDex}
          onValueChange={(value) => setSelectedDex(value)}
        />
        <div className="flex align-middle gap-[6px]">
          <FilterTime
            options={filterTimeOptions}
            defaultSelectedIndex={currentFilterTimeIndex}
            onChange={(index) => setCurrentFilterTimeIndex(index)}
          />
          <FilterButton
            defaultSortLabel={t('listCoin.filters.sortByWatchlistTimeDesc')}
            defaultDex={selectedDex}
            defaultDexLabel={LaunchPlatformOptions.find((option) => option.value === selectedDex)?.label}
            defaultTimeRange={filterTimeOptions[currentFilterTimeIndex]}
            onFiltered={handleFilterChange}
            defaultValues={filter}
          />
        </div>
      </div>
      <div
        ref={containerRef}
        className="max-h-[calc(100dvh-72px)] min-h-[calc(100dvh-350px)] pb-[75px] overflow-y-auto no-scrollbar"
      >
        <ListCoins
          loading={loading}
          tokens={tokens}
          animatePresence
          renderItem={(token) => (
            <motion.div
              key={token.token}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-[5px]"
            >
              <WatchlistCard
                token={token}
                priceChange={+findPriceChange(token, selectedTimeRange)}
                tradeDetails={getTradeDetail(selectedTimeRange, token, t)}
                onRemoved={() => handleOnItemRemoved(token.token)}
                timeframe={selectedTimeRange}
              />
            </motion.div>
          )}
        />
        {fetchingMore && (
          <div className="flex justify-center items-center py-3">
            <IconSpinner className="animate-spin size-4" />
          </div>
        )}
      </div>
    </Container>
  )
}

export default TabWatchlist
