import { TokenDetail } from '@/@generated/gql/graphql-meme2'
import { EVENT_MESSAGE_OHLC_UPDATED } from '@/datafeeds/dataUpdater.ts'
import eventBus from '@/lib/eventBus.ts'
import { formatVolume } from '@/lib/format'
import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice.ts'
import { ChainIds, DisplayPriceType } from '@/types/enums.ts'
import uesDetailTokenTable from '@components/detaiTokenTable/hooks/uesDetailTokenTable.tsx'
import BaseListOrderBook from '@components/orderBook/BaseListOrderBook.tsx'
import ItemLastTransaction from '@components/orderBook/ItemLastTransaction.tsx'
import OrderBookTableHeader from '@components/orderBook/OrderBookTableHeader.tsx'
import { Button } from '@components/ui/button.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover.tsx'
import { useTokenPriceInfo } from '@hooks/useTokenPrice.ts'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useAggregatedTradingTransactions } from '@hooks/meme/useAggregatedTradingTransactions.ts'
import { TradingTransactionInput } from '@/@generated/gql/graphql-meme2.ts'

interface OrderBookProps {
  tokenDetail: TokenDetail
}

const FILTER_OPTIONS = [
  { key: 'all', label: 'orderBook.all', range: [0, Infinity] },
  { key: 'lt1k', label: '< 1K', range: [0, 1000] },
  { key: '1k-3k', label: '1K - 3K', range: [1000, 3000] },
  { key: '3k-10k', label: '3K - 10K', range: [3000, 10000] },
  { key: 'gt10k', label: '> 10K', range: [10000, Infinity] },
]

const OrderBook: React.FC<OrderBookProps> = ({ tokenDetail }) => {
  const { t } = useTranslation()
  const location = useLocation()

  const [lastPrice, setLastPrice] = useState<number>(tokenDetail?.price)

  const tokenAddress = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.at(-1) || ''
  }, [location.pathname])

  const tokenStatistic = useTokenPriceInfo(tokenAddress ?? '')
  // const { data: fallbackPriceData } = useGetPrices({
  //   tokens: [tokenAddress],
  //   chainId: tokenDetail?.chainId ?? ChainIds.Solana,
  // })
  // const fallbackPrice = fallbackPriceData?.getPrices?.[0]?.price ?? 0
  // const price = useTokenPrice(tokenAddress, fallbackPrice?.toString())

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_OHLC_UPDATED, (data: any) => {
      if (data?.data) {
        setLastPrice(data?.data.close)
      }
    })
    return () => {
      eventBus.remove(EVENT_MESSAGE_OHLC_UPDATED)
    }
  }, [])
  const totalSupply = Number(tokenDetail?.circulatingSupply ?? tokenDetail?.totalSupply)

  const marketCap = useMemo(() => {
    if (totalSupply && lastPrice) {
      return totalSupply * Number(lastPrice)
    }
    return tokenDetail?.marketCap
  }, [lastPrice, totalSupply])

  const volume =
    Number(tokenStatistic?.volume24h) > 0 && tokenStatistic?.token === tokenDetail?.address
      ? Number(tokenStatistic?.volume24h)
      : Number(tokenDetail?.volume24h)
  const pool =
    Number(tokenStatistic?.liquidity) > 0 && tokenStatistic?.token === tokenAddress
      ? Number(tokenStatistic?.liquidity)
      : Number(tokenDetail?.liquidity)

  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const { currency, handleChangeCurrency } = uesDetailTokenTable()
  const [priceType, setPriceType] = useState<DisplayPriceType>(DisplayPriceType.MC)
  // const [isShowOverlay, setIsShowOverlay] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  const queryInput = useMemo(() => {
    const filterOption = FILTER_OPTIONS.find((option) => option.key === selectedFilter)
    const input = {
      token: tokenAddress,
      chainId: tokenDetail?.chainId || ChainIds.Solana,
    } as TradingTransactionInput

    if (selectedFilter !== 'all' && filterOption) {
      const [min, max] = filterOption.range
      input.transactionUsdAmountFrom = min
      input.transactionUsdAmountTo = max === Infinity ? null : max
    }

    return input
  }, [tokenAddress, selectedFilter, tokenDetail?.chainId])

  const filterFn = useCallback(
    (tx: RealtimeTransaction) => {
      const filterOption = FILTER_OPTIONS.find((option) => option.key === selectedFilter)
      if (selectedFilter !== 'all' && filterOption) {
        const [min, max] = filterOption.range
        const volumeUsd = Number(tx.volumeUsd)
        return !(volumeUsd < min || (max !== Infinity && volumeUsd > max))
      }
      return true
    },
    [selectedFilter],
  )

  const {
    transactions: filteredTransactions,
    loadMore,
    isPending,
    hasNextPage,
  } = useAggregatedTradingTransactions({
    filterFn: filterFn,
    input: queryInput,
  })

  const handleChangePriceType = () => {
    setPriceType((prev) => (prev === DisplayPriceType.PRICE ? DisplayPriceType.MC : DisplayPriceType.PRICE))
  }

  const maxPriceUsd = useMemo(() => {
    if (!filteredTransactions.length) return 0

    return filteredTransactions.slice(0, 20).reduce((max, tx) => {
      const price = Number(tx?.baseAmount) * Number(tx?.usdPrice)
      return price > max ? price : max
    }, 0)
  }, [filteredTransactions])

  const handleFilterSelect = (filterKey: string) => {
    setSelectedFilter(filterKey)
    setFilterOpen(false)
  }

  const getSelectedFilterLabel = () => {
    const filter = FILTER_OPTIONS.find((option) => option.key === selectedFilter)
    return filter && filter?.key !== 'all' ? filter.label : t('orderBook.all')
  }

  const updateOverlayState = () => {
    const parentDiv = scrollRef.current
    if (!parentDiv) return

    const div = parentDiv.querySelector('.rounded-md.overflow-auto')
    if (!div) return

    // const isOverflowing = div.scrollHeight > div.clientHeight
    // const isAtBottom = div.scrollTop + div.clientHeight >= div.scrollHeight - 1 // slight buffer for rounding

    // setIsShowOverlay(isOverflowing && !isAtBottom)
  }

  const handleScrollToBottom = async () => {
    loadMore()
    return true
  }

  useEffect(() => {
    updateOverlayState() // Initial check

    const parentDiv = scrollRef.current
    if (!parentDiv) return
    const div = parentDiv.querySelector('div.rounded-md.overflow-auto')
    if (!div) return

    div.addEventListener('scroll', updateOverlayState)

    const resizeObserver = new ResizeObserver(updateOverlayState)
    resizeObserver.observe(div)

    return () => {
      div.removeEventListener('scroll', updateOverlayState)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className="w-[calc(36.8%-4px)] flex flex-col absolute left-[10px] top-0 bottom-[10px]">
      <div className="w-full bg-[#17171B] p-1.5 rounded-md text-center">
        <div className="font-330 text-[13px] text-white leading-none">{t('orderBook.currentMarketCap')}</div>
        <div className="mt-1.5 font-[380] text-[18px] text-rise leading-none">
          {formatVolume(marketCap, {
            showCurrency: true,
          })}
        </div>
      </div>
      <div className="mt-1 flex gap-[2px]">
        <div className="w-[calc(50%-1px)] bg-[#17171B] p-1.5 rounded-md text-center">
          <div className="font-380 text-[13px] text-white leading-none">
            {formatVolume(volume, {
              showCurrency: true,
            })}
          </div>
          <div className="mt-1.5 font-[330] text-[10px] text-[#7D7B87] leading-none">{t('orderBook.volume')}</div>
        </div>
        <div className="w-[calc(50%-1px)] bg-[#17171B] p-1.5 rounded-md text-center">
          <div className="font-380 text-[13px] text-white leading-none">
            {formatVolume(pool, {
              showCurrency: true,
            })}
          </div>
          <div className="mt-1.5 font-[330] text-[10px] text-[#7D7B87] leading-none">{t('orderBook.pool')}</div>
        </div>
      </div>
      <div className="mt-2 w-full overflow-auto min-h-[calc(100%-110px)]">
        <div ref={scrollRef} className="flex flex-col overflow-y-auto relative h-full">
          <OrderBookTableHeader
            handleChangeCurrency={handleChangeCurrency}
            priceType={priceType}
            handleChangePriceType={handleChangePriceType}
          />
          <BaseListOrderBook
            loading={isPending}
            hasMore={hasNextPage}
            data={filteredTransactions}
            loadMoreFn={handleScrollToBottom}
            renderItem={(item, index) => (
              <ItemLastTransaction
                key={item?.txHash || index}
                transaction={item}
                currency={currency}
                maxPriceUsd={maxPriceUsd}
                totalSupply={totalSupply}
                priceType={priceType}
                baseSymbol={tokenDetail?.symbol || ''}
                exclusive={!item.isKlineTx}
              />
            )}
          />
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button className="w-full z-1 bg-[#ECECED14] rounded-[4px] p-2 flex items-center justify-between gap-[10px] app-font-medium text-[calc(1rem*(12/16))] text-[#FFFFFF99] leading-[1]">
                <span>{getSelectedFilterLabel()}</span>
                <img src="/images/orderForm/icon-dropdown.svg" className="w-[8.42px] h-[5.14px]" alt="" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#1E1E1E] border-[#333333] rounded-[4px]"
            >
              <div className="flex flex-col w-full">
                {FILTER_OPTIONS.map((option) => (
                  <Button
                    key={option.key}
                    variant="ghost"
                    className={`justify-start px-3 py-2 text-[calc(1rem*(12/16))] hover:bg-[#333333] ${selectedFilter === option.key ? 'text-white' : 'text-[#FFFFFF99]'}`}
                    onClick={() => handleFilterSelect(option.key)}
                  >
                    {option.key === 'all' ? t(option.label) : option.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}

export default OrderBook
