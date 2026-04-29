import FilterTag from '@components/common/FilterTag'
import FilterSelect from '@components/common/FilterSelect'
import FilterTime, { FilterTimeOption } from '@components/common/FilterTime'
import Container from '@components/common/Container.tsx'
import { useState, ReactNode, memo, useMemo, useEffect } from 'react'
import FilterButton from '@components/listCoin/filter/FilterButton.tsx'
import { LaunchPlatformOptions } from '@/lib/constant'
import MainstreamCard from '@components/listCoin/card/MainstreamCard'
import { getTrendingTokens } from '@services/tokens.service.ts'
import { TokenTrending } from '@/types/token.ts'
import { formatPriceChange } from '@/lib/number.ts'
import { FilterFormData } from '@components/listCoin/filter/FilterField.tsx'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import BaseListCoins from '@components/listCoin/BaseListCoins.tsx'
import useGetListTokens from '@hooks/useGetListTokens.ts'
import { useTranslation } from 'react-i18next'
import { formatLiquidity } from '@/lib/format.ts'
import { useActiveChain } from '@hooks/useActiveChain.ts'

const directions = ['Popular', 'Gainer', 'Loser', 'AiAnalysis'] as const
type Direction = (typeof directions)[number]

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

export interface TradeDetailItem {
  label: string
  value: string | number | ReactNode
}

type TabMainstreamProps = {
  parentTab: string
}

function PriceChange(props: { token: TokenTrending; time: string }) {
  const { token, time } = props
  type PriceChange = 'price1mChange' | 'price5mChange' | 'price1hChange' | 'price6hChange' | 'price24hChange'
  const key = `price${time}Change` as PriceChange
  const priceChange = +token[key]
  const formatted = formatPriceChange(priceChange)
  const isPositive = priceChange >= 0.01
  let color
  if (priceChange > 0.01) {
    color = 'text-rise'
  } else if (priceChange < -0.01) {
    color = 'text-fall'
  } else {
    color = 'text-neutral'
  }
  return (
    <span className={color}>
      {isPositive ? '+' : ''}
      {formatted}
    </span>
  )
}

function getTradeDetail(token: TokenTrending, time: string, t: any): TradeDetailItem[] {
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
      label: t('detail.trading.priceChange'),
      value: <PriceChange token={token} time={time} />,
    },
  ]
}

function getSortBy(direction: Direction, time: string) {
  if (direction === 'Popular') return `-volume${time}`
  if (direction === 'Gainer') return `-price${time}Change`
  if (direction === 'Loser') return `price${time}Change`
  return undefined
}

const TokenTrendingCardMemo = memo(MainstreamCard)

const TabMainstream = ({}: TabMainstreamProps) => {
  const { t } = useTranslation()

  const tagFilters: string[] = [
    t('listCoin.filters.popular'),
    t('listCoin.filters.gainers'),
    t('listCoin.filters.losers'),
    t('listCoin.filters.aiMining'),
  ]

  const [currentTag, setCurrentTag] = useState<string>(tagFilters[0])
  const [currentFilterTimeIndex, setCurrentFilterTimeIndex] = useState<number>(4)
  const [filter, setFilter] = useState<FilterFormData>()
  const [selectedDex, setSelectedDex] = useState<string>('All')

  const handleFilterTimeChange = (index: number) => {
    setCurrentFilterTimeIndex(index)
  }

  const selectedTimeRange = `${filterTimeOptions[currentFilterTimeIndex].value}${filterTimeOptions[currentFilterTimeIndex].unit}`
  const selectedChain = useActiveChain()

  const sortBy = getSortBy(directions[tagFilters.indexOf(currentTag)], selectedTimeRange)
  const { tokens, loading, fetchMore } = useGetListTokens<TokenTrending>({
    documentNode: getTrendingTokens,
    timeRange: filterTimeOptions[currentFilterTimeIndex],
    direction: directions[tagFilters.indexOf(currentTag)],
    filter: filter as FilterFormData,
    key: 'getTokenTrending',
    refreshInterval: 3000,
    defaultSort: sortBy,
    deduplicateFn: (item, index, self) => {
      return self.findIndex((i) => i.token === item.token) === index
    },
  })

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

  const loadMoreFn = async () => {
    const result = await fetchMore()
    return result.data.getTokenTrending?.data.length === 20
  }

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
      <div className="sticky top-9 bg-[#111111] z-20 pt-2">
        <FilterTag tags={tagFilters} className="mb-[8px]" onTagClick={(tag) => setCurrentTag(tag)} />
      </div>
      <div className="flex align-middle justify-between pb-[6px] sticky top-[68px] bg-[#111111] z-20">
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
            defaultSortLabel={t('listCoin.filters.sortByVolumeDesc')}
            defaultDex={selectedDex}
            defaultDexLabel={LaunchPlatformOptions.find((option) => option.value === selectedDex)?.label}
            defaultTimeRange={filterTimeOptions[currentFilterTimeIndex]}
            onFiltered={handleFilterChange}
            defaultValues={filter}
          />
        </div>
      </div>
      <div className="h-[calc(100dvh-106px)] pb-[55px] no-scrollbar">
        <BaseListCoins<TokenTrending>
          loading={loading}
          tokens={tokens}
          useVirtualizedList
          loadMoreFn={loadMoreFn}
          renderItem={(token) => (
            <TokenTrendingCardMemo
              key={token.token}
              token={token}
              tradeDetails={getTradeDetail(token, selectedTimeRange, t)}
              timeframe={selectedTimeRange}
            />
          )}
        />
      </div>
    </Container>
  )
}

export default TabMainstream
