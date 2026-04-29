import FilterSelect from '@components/common/FilterSelect'
import FilterTime, { FilterTimeOption } from '@components/common/FilterTime'
import Container from '@components/common/Container.tsx'
import { useEffect, useMemo, useState } from 'react'
import FilterButton from '@components/listCoin/filter/FilterButton.tsx'
import NewCoinCard from '@components/listCoin/card/NewCoinCard'
import { getNewTokens } from '@services/tokens.service.ts'
import useGetListTokens from '@hooks/useGetListTokens.ts'
import { TokenTrending } from '@/types/token.ts'
import { FilterFormData } from '@components/listCoin/filter/FilterField.tsx'
import BaseListCoins from '@components/listCoin/BaseListCoins.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { LaunchPlatformOptions } from '@/lib/constant.ts'

import { useTranslation } from 'react-i18next'
import { useSubscription } from '@/lib/mqtt'
import dayjs from 'dayjs'
import { useAppSelector } from '@/redux/store'
import { formatLiquidity } from '@/lib/format.ts'

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

function getTradeDetail(token: TokenTrending, time: string, t: any) {
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
      value: '$' + listCoinHelper.getVolumes(token, time),
    },
    {
      label: t('detail.tabs.holders'),
      value: fShortenNumber(token.numberOfHolder),
    },
  ]
}

const TabNewCoin = () => {
  const { t } = useTranslation()

  const { message: mqttMessage } = useSubscription('public/token/new')

  const [currentFilterTimeIndex, setCurrentFilterTimeIndex] = useState<number>(2)
  const [filter, setFilter] = useState<FilterFormData>()
  const [selectedDex, setSelectedDex] = useState<string>('All')

  const selectedChain = useAppSelector((state) => state.newWallet.activeChain)

  const { tokens, loading, fetchMore, updateQuery } = useGetListTokens<TokenTrending>({
    documentNode: getNewTokens,
    timeRange: filterTimeOptions[currentFilterTimeIndex],
    filter: filter as FilterFormData,
    key: 'getNewToken',
    deduplicateFn: (item, index, self) => {
      return self.findIndex((i) => i.token === item.token) === index
    },
  })

  const loadMoreFn = async () => {
    const result = await fetchMore()
    return result.data.getTokenTrending?.data.length === 20
  }

  const selectedTimeRange = `${filterTimeOptions[currentFilterTimeIndex].value}${filterTimeOptions[currentFilterTimeIndex].unit}`

  const handleFilterTimeChange = (index: number) => {
    setCurrentFilterTimeIndex(index)
  }

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

  useEffect(() => {
    const messagePayload = mqttMessage?.message
    if (!messagePayload) return
    const token = JSON.parse(messagePayload.toString()) as TokenTrending
    const tokenExists = tokens.find((item) => item.token === token.token)
    if (!tokenExists && !loading) {
      updateQuery((unsafePreviousData) => {
        if (!unsafePreviousData.getNewToken) return unsafePreviousData
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
          image: token.image ?? null,
        }
        const oldList = unsafePreviousData.getNewToken?.data ?? []
        const newList = [newToken, ...oldList]
          .slice(0, oldList.length)
          .sort((a, b) => dayjs(b.createdTime).unix() - dayjs(a.createdTime).unix())
        return {
          ...unsafePreviousData,
          getNewToken: {
            ...unsafePreviousData.getNewToken,
            data: newList,
          },
        }
      })
    }
  }, [mqttMessage])

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
            onChange={handleFilterTimeChange}
          />
          <FilterButton
            defaultSortLabel={t('listCoin.filters.sortByCreationTimeDesc')}
            defaultDex={selectedDex}
            defaultDexLabel={LaunchPlatformOptions.find((option) => option.value === selectedDex)?.label}
            defaultTimeRange={filterTimeOptions[currentFilterTimeIndex]}
            onFiltered={handleFilterChange}
            defaultValues={filter}
          />
        </div>
      </div>
      <div className="h-[calc(100dvh-72px)] pb-[55px] no-scrollbar">
        <BaseListCoins<TokenTrending>
          loading={loading}
          tokens={tokens}
          useVirtualizedList
          loadMoreFn={loadMoreFn}
          renderItem={(token) => (
            <NewCoinCard
              key={token.token}
              token={token}
              priceChange={findPriceChange(token, selectedTimeRange)}
              tradeDetails={getTradeDetail(token, selectedTimeRange, t)}
              timeframe={selectedTimeRange}
            />
          )}
        />
      </div>
    </Container>
  )
}

export default TabNewCoin
