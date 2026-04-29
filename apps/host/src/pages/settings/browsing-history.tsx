import { TokenBrowserHistoryDto } from '@/@generated/gql/graphql-core.ts'
import { ChainType } from '@/@generated/gql/graphql-future'
import ConfirmCollectTokenMeme from '@/components/futuresDetails/tokenSearchDrawer/ConfirmCollectTokenMeme'
import { ToastProvider } from '@/components/futuresDetails/tokenSearchDrawer/CustomToast'
import { useFavoriteBroadcast } from '@/components/futuresDetails/tokenSearchDrawer/hooks/useFavoriteBroadcast'
import useItemTokenOHLC from '@/components/futuresDetails/tokenSearchDrawer/hooks/useItemTokenOHLC'
import FuturesBrowsingHistoryList from '@/components/futuresDetails/trade/FuturesBrowsingHistoryList.tsx'
import { useActiveChain } from '@/hooks/useActiveChain'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { formatPercentageChange } from '@/lib/format.ts'
import { futureClient } from '@/lib/gql/apollo-client'
import { parseNumber } from '@/lib/number.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { UITab } from '@/types/uiTabs.ts'
import { formatMoney } from '@/utils/helpers.ts'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import { MarketDisplay } from '@components/common/FormattingDisplay.tsx'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import Text from '@components/common/Text.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { getBrowsingHistory } from '@services/settings.service.ts'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

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

const useAllTokenAddresses = () => {
  const allTokens = useAppSelector((state) => state.browsingHistory.tokens) as string[]
  return useMemo(() => {
    // Remove duplicates and filter out empty strings
    return allTokens.filter((token) => token.trim() !== '' && tokenRegex.test(token))
  }, [allTokens])
}
// Map chain string to ChainType enum
const mapChainToChainType = (chain: string): ChainType | undefined => {
  const chainMap: Record<string, ChainType> = {
    eth: ChainType.Eth,
    sol: ChainType.Solana,
    solana: ChainType.Solana,
    bsc: ChainType.Bsc,
    arb: ChainType.Arb,
    tron: ChainType.Tron,
  }

  return chainMap[chain.toLowerCase()]
}

const useBrowsingHistory = () => {
  const allTokens = useAllTokenAddresses()
  const chain = useActiveChain()

  const chainType = useMemo(() => mapChainToChainType(chain), [chain])

  return useInfiniteQuery({
    queryKey: ['browsingHistory', allTokens, chainType],
    queryFn: async ({ pageParam = 0 }) => {
      const tokens = allTokens.slice(pageParam * 20, (pageParam + 1) * 20)
      const { data } = await futureClient.query({
        query: getBrowsingHistory,
        variables: {
          input: {
            tokenAddresses: tokens,
            chain: chainType,
          },
        },
      })
      const tokenData = data?.getBrowserHistory ?? []
      return {
        data: tokens.map((token) => tokenData.find((item) => item.token === token)!),
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
const Item = (props: { token: TokenBrowserHistoryDto }) => {
  const { token } = props

  const { price24hChange, volume24h, marketCap } = token

  const { price } = useItemTokenOHLC({
    address: token.token,
    initMarketcap: Number(marketCap),
    initVolume24h: Number(volume24h),
    initChangePercent: Number(price24hChange),
  })

  const changePercent = price?.price24hChange ? price?.price24hChange : price24hChange
  const marketCapValue = price.marketcap ? price.marketcap : marketCap
  const volumeValue = price.volume24h ? price.volume24h : volume24h

  return (
    <div className="block mb-3 relative">
      <div className="absolute left-1 top-1/2 -translate-y-1/2 z-10">
        <ConfirmCollectTokenMeme
          token={token?.token ?? ''}
          defaultCollect={token?.isFavorite ?? false}
          tokenSymbol={token?.symbol}
          triggerClassName="p-0"
        />
      </div>
      <Link
        to={getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: token?.token, chain: CHAIN_SYMBOLS[token?.chainId] })}
        state={{
          symbol: token?.symbol,
        }}
        className="block"
      >
        <div className="flex items-center justify-between gap-2 py-3 border-b last:border-b-0 cursor-pointer">
          <div className="flex items-center gap-2 flex-3 pl-8">
            <ChainCurrencyIcon
              currencyIcon={token?.image ?? ''}
              name={token?.symbol}
              fallbackClassName="bg-secondary"
            />
            <div className="">
              <div className="mb-1 flex items-center text-title align-baseline font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))]">
                <span className="mr-1">{token?.symbol}</span>
                {/* <TokenAge createdTime={token.createdTime} /> */}
              </div>
              <div className="flex items-center">
                <div className="text-[calc(1rem*(10/16))] text-[#FFFFFF99] leading-[calc(1rem*(10/16))] mr-1">
                  {formatAddressWallet(token?.token, 5, 4)}
                </div>
                {/* <div className="cursor-copy mr-2">
                <CopyButton
                  icon="/images/tokenDetail/icon-copy.webp"
                  className="w-[10px] min-w-[10px] h-[10px]"
                  text={token.token}
                  type="tokenAddress"
                />
              </div> */}
              </div>
            </div>
          </div>
          <div className="text-right">
            <MarketDisplay
              value={parseNumber(marketCapValue)}
              className={'app-font-medium text-[calc(1rem*(15/16))] lining-nums'}
            />
            {/*<p className="app-font-regular text-[calc(1rem*(11/16))] lining-nums whitespace-nowrap">*/}
            {/*  {t('listCoin.columns.marketCap')}*/}
            {/*</p>*/}
            {/*<Text*/}
            {/*  text={formatNumberWithCommas(`${currentPrice}`, 9)}*/}
            {/*  fontSize={15}*/}
            {/*  fontWeight="medium"*/}
            {/*  className="lining-nums"*/}
            {/*/>*/}
            <Text
              text={formatMoney(volumeValue)}
              fontSize={11}
              fontWeight="regular"
              color="#FFFFFFB2"
              className="lining-nums"
            />
          </div>

          <div className="flex-1 sm:flex-2 flex justify-end">
            <PriceChange value={+changePercent} />
          </div>
        </div>
      </Link>
    </div>
  )
}

const TokenList = () => {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useBrowsingHistory()
  const listRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const tokens = useMemo(() => {
    if (!data) return []
    return data.pages.flatMap((page) => page.data.filter((e) => e))
  }, [data])

  const virtualizer = useVirtualizer({
    count: hasNextPage ? tokens.length + 1 : tokens.length, // +1 for the loading item
    estimateSize: () => 54, // Height of each item
    overscan: 5, // Number of items to render outside the viewport
    getScrollElement: () => listRef.current,
    getItemKey: (index) => `${tokens[index]?.token}-${index}`,
  })

  const virtualItems = virtualizer.getVirtualItems()

  useEffect(() => {
    const lastItem = virtualizer.getVirtualItems().at(-1)
    if (!lastItem) return
    if (lastItem.index >= tokens.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage().then()
    }
  }, [virtualItems, hasNextPage, isFetchingNextPage, fetchNextPage, tokens.length])

  if (isLoading) {
    return (
      <div className="flex-1 px-3 overflow-y-auto no-scrollbar h-[54px]">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full my-3" />
        ))}
      </div>
    )
  }
  if (tokens.length === 0) {
    return <EmptyList />
  }

  return (
    <div className="flex-1 flex flex-col pt-3">
      <div className="px-3 pb-1">
        <div className="flex items-center justify-between gap-2 text-[calc(11rem/16)] leading-[calc(11rem/16)] text-[#FFFFFF80]">
          <div className="flex items-center gap-2 flex-3">{t('appSettings.browsingHistoryPage.columns.token')}</div>
          <div className="text-right">
            {t('appSettings.browsingHistoryPage.columns.marketcap')} /{' '}
            {t('appSettings.browsingHistoryPage.columns.volume')}
          </div>
          <div className="flex-1 sm:flex-2 text-end min-w-[64px]">
            {t('appSettings.browsingHistoryPage.columns.priceChange')}
          </div>
        </div>
      </div>
      <div ref={listRef} className="flex-1 px-3 overflow-y-auto no-scrollbar">
        <div className="w-full relative" style={{ height: `${virtualizer.getTotalSize() + 24}px` }}>
          {virtualItems
            .filter((e) => !!e)
            .map((item) => (
              <div
                key={item.key}
                className="absolute top-0 left-0 w-full h-[54px] pb-[5px]"
                style={{ transform: `translateY(${item.start}px)` }}
              >
                {item.index < tokens.length ? (
                  <Item token={tokens[item.index]} />
                ) : (
                  <div className="h-full w-full flex justify-center items-center">
                    <Skeleton className="h-8 w-full" />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

const getDefaultTab = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const tab = urlParams.get('tab')
  return tab === 'meme' ? 'meme' : 'futures'
}

export const BrowsingHistoryPage = () => {
  useFavoriteBroadcast()
  const { t } = useTranslation()
  const initialTab = getDefaultTab()
  const [currentTab, setCurrentTab] = useState<string>(initialTab)
  const [_, setSearchParams] = useSearchParams()

  const currentListTabs: UITab[] = [
    {
      value: 'futures',
      label: t('futuresDetails.common.futures'),
    },
    {
      value: 'meme',
      label: 'Meme',
    },
  ]
  const handleChangeTab = (tab: string) => {
    setCurrentTab(tab)
  }
  const handleRenderTab = (tab: string) => {
    switch (tab) {
      case currentListTabs[0]?.value:
        return <FuturesBrowsingHistoryList />
      case currentListTabs[1]?.value:
        return <TokenList />
      default:
        return <TokenList />
    }
  }

  useEffect(() => {
    setSearchParams({ tab: currentTab }, { replace: true })
  }, [currentTab])

  return (
    <ToastProvider>
      <div className="w-full h-dvh flex flex-col">
        <HeaderWithBack title={t('appSettings.browsingHistory')} className="bg-transparent" />
        <MovingLineTabs
          tabs={currentListTabs}
          onTabChange={handleChangeTab}
          defaultTab={initialTab}
          showContainerBottomLine={false}
          containerClassName="bg-[none] w-full mb-[10px]  white-gradient-border-b"
          tabsClassName="w-full"
        />
        {handleRenderTab(currentTab)}
      </div>
    </ToastProvider>
  )
}
