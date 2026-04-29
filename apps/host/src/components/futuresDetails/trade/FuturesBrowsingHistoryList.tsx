import Text from '@/components/common/Text'
import { LeverageBadge } from '@/components/futuresDiscover/table/crypto-table'
import { APP_PATH } from '@/lib/constant.ts'
import { formatPercentageChange } from '@/lib/format.ts'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { GET_FAVORITE_SYMBOLS, GET_SYMBOL_LIST } from '@/services/symbol.dex.service'
import { formatMoney, formatNumberWithCommas } from '@/utils/helpers'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import ConfirmCollectToken from '../tokenSearchDrawer/ConfirmCollectToken'

const PriceChange = (props: { value: number }) => {
  const { value } = props
  const formatted = formatPercentageChange(value).label
  const isNegative = value < -0.01

  return (
    <div
      className={cn(
        'w-16 py-1.5 text-[calc(1rem*(12/16))] text-[#FFFFFF] leading-[calc(1rem*(12/16))] rounded-[4px] flex items-center justify-center',
        !isNegative ? 'bg-[var(--bg-positive)]' : 'bg-[var(--bg-negative)]',
      )}
    >
      <span>
        {!isNegative ? '+' : ''}
        {formatted}
      </span>
    </div>
  )
}

const tokenRegex = /^[a-zA-Z0-9]+$/
 
const useAllSymbol = () => {
  const allSymbol = useAppSelector((state) => state.futuresBrowsingHistory.symbols) as string[]
  return useMemo(() => {
    // Remove duplicates and filter out empty strings
    return allSymbol.filter((symbol) => symbol.trim() !== '' && tokenRegex.test(symbol))
  }, [allSymbol])
}

const useFuturesBrowsingHistory = () => {
  const allSymbols = useAllSymbol()

  return useInfiniteQuery({
    queryKey: ['futuresBrowsingHistory', allSymbols],
    queryFn: async ({ pageParam = 0 }) => {
      const symbols = allSymbols.slice(pageParam * 20, (pageParam + 1) * 20)
      const input = {
        condition: 'volume',
      }
      const { data } = await symbolDexClient.query({
        query: GET_SYMBOL_LIST,
        variables: { input },
      })

      const symbolData = data?.getSymbolList?.list ?? []
      return {
        data: symbols.map((symbol) => symbolData.find((item) => item.symbol === symbol)!),
        page: pageParam,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.length < 20) return null
      return lastPage.page + 1
    },
  })
}

const useFavoriteSymbols = () => {
  return useQuery({
    queryKey: ['favoriteSymbols'],
    queryFn: async () => {
      const { data } = await symbolDexClient.query({
        query: GET_FAVORITE_SYMBOLS,
      })
      return data?.getFavoriteSymbols?.list ?? []
    },
  })
}

const SymbolItemHead = () => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-2 pt-3 pb-1 px-3">
      <div className="flex items-center gap-2 flex-3">
        <p className="text-[#FFFFFF80] text-[calc(1rem*(11/16))] leading-[calc(1rem*(12/16))]">{`${t('tokenSearchDrawer.tableHeaders.token')} / ${t('tokenSearchDrawer.tableHeaders.marketCap')}`}</p>
      </div>
      <div className="text-right">
        <p className="text-[#FFFFFF80] text-[calc(1rem*(11/16))] leading-[calc(1rem*(12/16))]">{`${t('tokenSearchDrawer.tableHeaders.price')} / ${t('tokenSearchDrawer.tableHeaders.volume')}`}</p>
      </div>

      <div className="flex-1 sm:flex-2 flex justify-end">
        <p className="text-[#FFFFFF80] text-[calc(1rem*(11/16))] leading-[calc(1rem*(12/16))]">
          {t('tokenSearchDrawer.tableHeaders.24hChange')}
        </p>
      </div>
    </div>
  )
}

const SymbolItem = (props: { token: any }) => {
  const { token } = props
  const { symbol, maxLeverage, marketCap, changPxPercent, currentPrice, volume, isFavorite } = token

  return (
    <div className="block mb-3 relative">
      <div className="absolute left-1 top-1/2 -translate-y-1/2 z-10">
        <ConfirmCollectToken
          token={symbol}
          defaultCollect={isFavorite}
          tokenSymbol={symbol}
          tokenInfor={{ symbol, maxLeverage, marketCap, changPxPercent, currentPrice, volume }}
          triggerClassName="p-0"
        />
      </div>
      <Link to={`${APP_PATH.FUTURES}/${symbol}`} className="block">
        <div className="flex items-center justify-between gap-2 py-3 border-b last:border-b-0 cursor-pointer">
          <div className="flex items-center gap-2 flex-3 pl-8">
            <div className="">
              <div className="mb-1 flex items-center text-title align-baseline font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))]">
                <Text
                  text={symbol}
                  fontSize={15}
                  fontWeight="medium"
                  className="leading-[calc(1rem*(15/16))]"
                  highLightColor="#AB57FF"
                />
                <Text
                  text="/"
                  fontSize={9}
                  fontWeight="light"
                  color="#FFFFFF80"
                  className="leading-[calc(1rem*(12/16))] mx-0.5"
                />
                <Text
                  text="USDC"
                  fontSize={11}
                  fontWeight="light"
                  color="#FFFFFF80"
                  className="leading-[calc(1rem*(11/16))] pr-1"
                />
                <LeverageBadge value={maxLeverage as unknown as string} />
              </div>
              <div className="flex items-center">
                <div className="text-[calc(1rem*(12/16))] tex-[#FFFFFFB2] lining-nums">{formatMoney(marketCap)}</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Text
              text={formatNumberWithCommas(`${currentPrice}`, 9)}
              fontSize={15}
              fontWeight="medium"
              className="lining-nums"
            />
            <Text
              text={formatMoney(volume)}
              fontSize={11}
              fontWeight="regular"
              color="#FFFFFFB2"
              className="lining-nums"
            />
          </div>

          <div className="flex-1 sm:flex-2 flex justify-end">
            <PriceChange value={changPxPercent} isPositive={Number(changPxPercent) > 0} />
          </div>
        </div>
      </Link>
    </div>
  )
}

const FuturesBrowsingHistoryList = () => {
  const { data: favoriteSymbols = [] } = useFavoriteSymbols()
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useFuturesBrowsingHistory()

  const listRef = useRef<HTMLDivElement>(null)

  const favoriteSet = useMemo(() => {
    return new Set(favoriteSymbols.map((f: any) => f.symbol))
  }, [favoriteSymbols])

  const symbols = useMemo(() => {
    if (!data) return []

    const allSymbols = data.pages.flatMap((page) => page.data)

    return allSymbols.map((symbol: any) => ({
      ...symbol,
      isFavorite: favoriteSet.has(symbol.symbol),
    }))
  }, [data, favoriteSet])

  const virtualizer = useVirtualizer({
    count: hasNextPage ? symbols.length + 1 : symbols.length, // +1 for the loading item
    estimateSize: () => 54, // Height of each item
    overscan: 5, // Number of items to render outside the viewport
    getScrollElement: () => listRef.current,
    getItemKey: (index) => `${symbols[index]?.token}-${index}`,
  })

  const virtualItems = virtualizer.getVirtualItems()

  useEffect(() => {
    const lastItem = virtualizer.getVirtualItems().at(-1)
    if (!lastItem) return
    if (lastItem.index >= symbols.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage().then()
    }
  }, [virtualItems, hasNextPage, isFetchingNextPage, fetchNextPage, symbols.length])

  if (isLoading) {
    return (
      <div className="flex-1 px-3 overflow-y-auto no-scrollbar h-[54px]">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full my-3" />
        ))}
      </div>
    )
  }
  if (symbols.length === 0) {
    return <EmptyList />
  }

  return (
    <>
      <SymbolItemHead />
      <div ref={listRef} className="flex-1 px-3 overflow-y-auto no-scrollbar">
        <div className="w-full relative" style={{ height: `${virtualizer.getTotalSize() + 24}px` }}>
          {virtualItems.map((item) => (
            <div
              key={item.key}
              className="absolute top-0 left-0 w-full h-[54px] pb-[5px]"
              style={{ transform: `translateY(${item.start}px)` }}
            >
              {item.index < symbols.length ? (
                <SymbolItem token={symbols[item.index]} />
              ) : (
                <div className="h-full w-full flex justify-center items-center">
                  <Skeleton className="h-8 w-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
export default FuturesBrowsingHistoryList
