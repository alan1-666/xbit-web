import FilterSelect, { FilterSelectOption } from '@components/common/FilterSelect'
import Container from '@components/common/Container.tsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import MovingBgFilterTags from '@components/common/MovingBgFilterTags.tsx'
import FilterButton from '@components/listCoin/filter/FilterButton.tsx'
import MemeCard from '@components/listCoin/card/MemeCard'
import { LaunchPlatformOptions } from '@/lib/constant.ts'
import useGetListTokens from '@hooks/useGetListTokens.ts'
import { TokenTrending } from '@/types/token.ts'
import { getMemeTokens } from '@services/tokens.service.ts'
import { FilterFormData } from '@components/listCoin/filter/FilterField.tsx'
import BaseListCoins from '@components/listCoin/BaseListCoins.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { FilterTimeOption, TimeUnit } from '@components/common/FilterTime'
import { useTranslation } from 'react-i18next'
import { useSubscription } from '@/lib/mqtt'
import dayjs from 'dayjs'
import AIAnalysisDrawer, { AIAnalysisDrawerHandle } from '@components/listCoin/AIAnalysisDrawer.tsx'
import { formatLiquidity } from '@/lib/format.ts'

const filterSelectOptions: FilterSelectOption[] = [
  LaunchPlatformOptions.find((option) => option.value === 'Pumpfun')!,
  LaunchPlatformOptions.find((option) => option.value === 'Moonshot')!,
]

function getTradeDetail(token: TokenTrending, time: string, tagIndex: number, t: any) {
  return [
    tagIndex === 2
      ? {
          label: t('detail.trading.marketCap', { time: '5m' }),
          value: <span className="text-[#00FFB4]">{listCoinHelper.get5mMarketCapChange(token)}</span>,
        }
      : {
          label: t('listCoin.fields.liquidityPool'),
          value: formatLiquidity(token.liquidity),
        },
    {
      label: t('detail.trading.transactions', { time }),
      value: listCoinHelper.getNumOfTransactions(token, time),
    },
    {
      label: t('detail.trading.volume', { time }),
      value: '$' + listCoinHelper.getVolumes(token, time),
    },
    {
      label: t('detail.tabs.holders'),
      value: fShortenNumber(token.numberOfHolder),
    },
  ]
}

const getLifecycleStates = (tag: string, tagFilters: string[]) => {
  const index = tagFilters.indexOf(tag)
  switch (index) {
    case 0:
      return 'newCreation'
    case 1:
      return 'completing'
    case 2:
      return 'soaring'
    case 3:
      return 'completed'
    default:
      return 'newCreation'
  }
}

const ListCoins = BaseListCoins<TokenTrending>

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
      return '0'
  }
}

function getSortBy(index: number) {
  switch (index) {
    case 0:
      return '-createdTime'
    case 1:
      return '-internalMarketProgress'
    case 2:
      return '-marketCap5mChangeUsd'
    case 3:
      return '-createdTime'
    default:
      return undefined
  }
}

const TabMeme = () => {
  const { t } = useTranslation()

  const { message } = useSubscription('public/meme/new')

  const tagFilters: string[] = [
    t('listCoin.filters.newListing'),
    t('listCoin.filters.almostFull'),
    t('listCoin.filters.pumping'),
    t('listCoin.filters.launched'),
  ]

  const [currentTab, setCurrentTab] = useState<string>(tagFilters[0])
  const [filter, setFilter] = useState<FilterFormData>()
  const [selectedDex, setSelectedDex] = useState<string>('Pumpfun')
  const aiAnalysisDrawerRef = useRef<AIAnalysisDrawerHandle>(null)

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const defaultSort = useMemo(() => {
    const currentIndex = tagFilters.indexOf(currentTab)
    switch (currentIndex) {
      case 0:
        return t('listCoin.filters.sortByInternalProgressDesc')
      case 1:
        return t('listCoin.filters.sortByInternalProgressDesc')
      case 2:
        return t('listCoin.filters.sortBy5minMarketCapChangeDesc')
      case 3:
        return t('listCoin.filters.sortByCreationTimeDesc')
      default:
        return ''
    }
  }, [currentTab])

  const timeRange: FilterTimeOption = useMemo(() => {
    if (!filter) return { value: '1', unit: 'h' }
    return { value: filter.period.value.toString(), unit: filter.period.unit as TimeUnit }
  }, [filter])

  const timeRangeString = `${timeRange.value}${timeRange.unit}`

  const normalizedFilters = useMemo(() => {
    if (!filter) return filter
    return filter
  }, [filter])

  const { tokens, loading, fetchMore, updateQuery } = useGetListTokens<TokenTrending>({
    documentNode: getMemeTokens,
    timeRange: timeRange,
    filter: normalizedFilters as FilterFormData,
    key: 'getMemeToken',
    refreshInterval: 3000,
    additionalParams: {
      dex: 'All',
      lifecycleStates: getLifecycleStates(currentTab, tagFilters),
      launchpad: filter?.dex?.data ?? 'Pumpfun',
    },
    defaultSort: getSortBy(tagFilters.indexOf(currentTab)),
    deduplicateFn: (item, index, self) => {
      return self.findIndex((i) => i.token === item.token) === index
    },
  })

  const loadMoreFn = async () => {
    const result = await fetchMore()
    return result.data.getTokenTrending?.data.length === 20
  }

  const handleFilterChange = (filter: FilterFormData) => {
    setFilter(filter)
    if (filter && filter.dex) {
      setSelectedDex(filter.dex.data)
    }
  }

  useEffect(() => {
    if (message && message.message) {
      const data = JSON.parse(message.message.toString())
      const token = JSON.parse(data.toString()) as TokenTrending
      const tokenExists = tokens.find((item) => item.token === token.token)
      if (!tokenExists && !loading) {
        updateQuery((unsafePreviousData) => {
          if (!unsafePreviousData.getMemeToken) return unsafePreviousData
          const newToken: TokenTrending = {
            ...token,
            Txs1h: 0,
            Txs1m: 0,
            Txs24h: 0,
            Txs5m: 0,
            Txs6h: 0,
            buyTxs1m: 1,
            buyTxs1h: 0,
            buyTxs24h: 0,
            buyTxs5m: 0,
            buyTxs6h: 0,
            isFavorite: false,
            price1hAgo: 0,
            sellTxs1h: 0,
            sellTxs1m: 0,
            sellTxs24h: 0,
            sellTxs5m: 0,
            sellTxs6h: 0,
            txs1h: 0,
            txs1m: 0,
            txs24h: 0,
            txs5m: 0,
            txs6h: 0,
            dexes: [],
            ohlc: [],
            marketCap5mChangeUsd: '0',
            image: token.image ?? null,
          }
          const oldList = unsafePreviousData.getMemeToken?.data ?? []
          const newList = [newToken, ...oldList]
            .slice(0, oldList.length)
            .sort((a, b) => dayjs(b.createdTime).unix() - dayjs(a.createdTime).unix())
          return {
            ...unsafePreviousData,
            getMemeToken: {
              ...unsafePreviousData.getMemeToken,
              data: newList,
            },
          }
        })
      }
    }
  }, [])

  const ignoreDexes = LaunchPlatformOptions.filter((item) => item.value !== 'Pumpfun' && item.value !== 'Moonshot').map(
    (item) => item.value,
  )

  const showAiAnalysis = () => {
    aiAnalysisDrawerRef.current?.open()
  }

  return (
    <Container className="bg-[#111111] w-full max-h-full flex-1 flex flex-col relative">
      <AIAnalysisDrawer ref={aiAnalysisDrawerRef} includeTrigger={false} />
      <div className="flex items-center justify-between pt-2 pb-[6px] gap-[10px] sticky top-9 bg-[#111111] z-20">
        <FilterSelect
          options={filterSelectOptions}
          selectTriggerProps={{
            className: 'w-[112px] min-w-[112px]',
          }}
          value={selectedDex}
          onValueChange={(value) => setSelectedDex(value)}
        />
        <div className="flex items-center gap-[6px] min-w-0">
          <MovingBgFilterTags
            tabs={tagFilters}
            defaultTab={tagFilters[0]}
            activeTab={currentTab}
            onTabChange={handleTabChange}
            containerId="meme-new-pairs"
            containerClassName="h-[24px] w-[calc(100%-36px)] overflow-x-auto no-scrollbar"
          />
          <FilterButton
            defaultSortLabel={defaultSort}
            onFiltered={handleFilterChange}
            defaultDex={selectedDex}
            defaultDexLabel={LaunchPlatformOptions.find((option) => option.value === selectedDex)?.label}
            ignoreDexes={ignoreDexes}
            defaultValues={filter}
          />
        </div>
      </div>
      <div className="h-[calc(100dvh-72px)] pb-[55px] no-scrollbar">
        <ListCoins
          loading={loading}
          tokens={tokens}
          useVirtualizedList
          loadMoreFn={loadMoreFn}
          renderItem={(token) => (
            <MemeCard
              key={token.token}
              token={token}
              lifecycleState={getLifecycleStates(currentTab, tagFilters)}
              tradeDetails={getTradeDetail(token, timeRangeString, tagFilters.indexOf(currentTab), t)}
              priceChange={findPriceChange(token, timeRangeString)}
              timeframe={timeRangeString}
              onAiAnalysisClick={showAiAnalysis}
            />
          )}
        />
      </div>
    </Container>
  )
}

export default TabMeme
