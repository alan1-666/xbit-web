import { PortfolioDto } from '@/@generated/gql/graphql-core'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import ButtonShare from '@/components/myPositions/ButtonShare'
import { APP_PATH } from '@/lib/constant'
import { formatAmount, formatBalance, formatPercent } from '@/lib/format'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { cn, getPath } from '@/lib/utils.ts'
import {
  setIsHiddenSmallPoll,
  setIsHiddenSmallerThan1U,
  setIsShowOnlyCurrentCurrency,
  setTotalHoldingTokens as setTotalHoldingTokensAction,
  setTotalUnrealizedPnL as setTotalUnrealizedPnLAction,
} from '@/redux/modules/holding.slice.ts'
import { mappedChainTypeToChainId } from '@/redux/modules/newWallet.slice.ts'
import { setCurrentHoldingTab } from '@/redux/modules/tradeTab.slice.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers'
import Loader from '@components/common/Loader.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { IconEmpty, IconExport, IconSortDown, IconSortUp } from '@components/icon'
import { IconWallet } from '@components/icon/stroke/IconWallet.tsx'
import { IconWarning } from '@components/icon/stroke/IconWarning.tsx'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import useTokenPrice from '@hooks/useTokenPrice.ts'
import { getPortfolio } from '@services/tokens.service.ts'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const buildHoldingKey = (chainId?: number | null, token?: string | null, userAddress?: string | null) =>
  `${chainId ?? ''}-${(token ?? '').toLowerCase()}-${(userAddress ?? '').toLowerCase()}`

const HoldingItem = React.memo(
  ({
    data,
    index,
    onUnrealizedChange,
  }: {
    data: PortfolioDto
    index: number
    onUnrealizedChange?: (key: string, value: number) => void
  }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)

    const priceMqtt = useTokenPrice(data?.token ?? '', '0')
    const fallBackPrice = data?.price || 0
    const price = priceMqtt != 0 ? priceMqtt : Number(fallBackPrice)

    const token = data?.token || '--'
    const chainId = data?.chainId || ChainIds.Solana
    const logoUrl = data?.logoUrl || getBlockChainLogo(chainId, token)
    const symbol = data?.symbol || '--'
    const userAddress = data?.userAddress
    const isXStock = data?.isXStock || false
    const isSoldOut = data?.totalBaseAmount == 0 || data?.totalBaseAmount === null
    const totalBaseAmount = data?.totalBaseAmount || 0
    const holdingValue = totalBaseAmount * Number(price || 0)
    const totalBuyUsd = data?.totalBuyUsd
    const totalBuyQty = data?.totalBuyQty
    const totalSellUsd = data?.totalSellUsd
    const totalSellQty = data?.totalSellQty
    const realized = data?.realizedPnL ? Number(data?.realizedPnL) : 0
    const unrealized =
      totalBaseAmount > 0 && data?.avgPriceUsd > 0 ? (Number(price) - Number(data?.avgPriceUsd)) * totalBaseAmount : 0
    const returnRate =
      !+data?.avgPriceUsd || !+data?.totalBuyUsd || !price || price === 0
        ? 0
        : (Number(unrealized) * 100) / data?.totalBuyUsd
    const holdingTime = data?.holdingTime || 0 // milliseconds
    const lowLiquidity = data?.lowLiquidity || false

    const holdingIdentifier = useMemo(
      () => buildHoldingKey(data?.chainId, data?.token, data?.userAddress),
      [data?.chainId, data?.token, data?.userAddress],
    )

    useEffect(() => {
      if (!onUnrealizedChange) return
      const hasSufficientData =
        !!data?.avgPriceUsd &&
        !!data?.totalBuyUsd &&
        !!price &&
        price !== 0 &&
        totalBaseAmount > 0 &&
        !Number.isNaN(unrealized) &&
        !lowLiquidity
      const normalizedUnrealized = hasSufficientData && Number.isFinite(unrealized) ? Number(unrealized) : 0
      onUnrealizedChange(holdingIdentifier, normalizedUnrealized)
    }, [
      onUnrealizedChange,
      holdingIdentifier,
      unrealized,
      data?.avgPriceUsd,
      data?.totalBuyUsd,
      price,
      totalBaseAmount,
      lowLiquidity,
    ])

    const walletName = useMemo(() => {
      return (
        listWalletsByChain.find(
          (item: any) =>
            item?.walletAddress?.toLowerCase() === userAddress?.toLowerCase() &&
            mappedChainTypeToChainId(item?.chain) == data?.chainId,
        )?.name || '--'
      )
    }, [data?.userAddress, listWalletsByChain])

    const handleNavigation = () => {
      const chainType =
        data.chainId === ChainIds.Ethereum
          ? 'arb'
          : data.chainId === ChainIds.Arbitrum
            ? 'arb'
            : data.chainId === ChainIds.Bsc
              ? 'bsc'
              : data.chainId === ChainIds.Mon
                ? 'mon'
                : 'sol'
      dispatch(setCurrentHoldingTab('holding'))
      dispatch(setIsHiddenSmallPoll(false))
      dispatch(setIsHiddenSmallerThan1U(false))
      dispatch(setIsShowOnlyCurrentCurrency(false))
      const path = data?.isXStock ? APP_PATH.X_STOCK_DETAIL : APP_PATH.MEME_TOKEN_DETAIL
      navigate(
        getPath(path, {
          address: data?.token ?? '',
          chain: chainType,
        }) + '?tab=holdings',
        {
          state: {
            symbol: data?.symbol,
            tokenLogo: data?.logoUrl,
            address: data.token,
            chainId: data.chainId,
          },
        },
      )
    }

    const [openShare, setOpenShare] = useState<boolean>(false)

    const PnL =
      +data?.avgPriceUsd === 0 && +data?.totalBuyQty === 0
        ? 0
        : !data?.avgPriceUsd || !data?.totalBuyUsd
          ? '--'
          : Number(realized) + Number(unrealized)

    return (
      <>
        <div
          className={cn(
            'min-h-[48px] w-max min-w-full px-4 py-3 grid grid-cols-[3fr_2fr_2fr_2fr_2fr_170px_50px] hover:bg-[#18181B] cursor-pointer',
            index % 2 === 0 ? 'bg-[#101114]' : 'bg-transparent',
          )}
          key={`${data.chainId}-${data.token}-${index}`}
          onClick={() => {
            handleNavigation()
          }}
        >
          <div className="min-w-[230px] pr-3 flex items-center gap-2">
            <LogoWithChain
              logo={logoUrl}
              logoContainerClassName="rounded-md"
              logoClassName="size-8 rounded-md"
              name={symbol}
              chainLogo={getBlockchainLogo2(chainId)}
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="font-[380] text-[13px] leading-none text-[#FBFBFB]">{symbol}</div>
                  {isXStock && <IconXStock />}
                </div>
                <CopyButton text={token} className="size-[14px]" />
                {isSoldOut && (
                  <span className="bg-[#00FFB41A] rounded-[4px] px-1 py-0.5 text-[12px] text-[#00FFB4] font-[330]">
                    {t('assets.funding.soldOut')}
                  </span>
                )}
                {lowLiquidity && (
                  <TooltipProvider>
                    <SimpleTooltip content={t('assets.overview.lowLiquidityTokenWarning')}>
                      <IconWarning className="size-4" />
                    </SimpleTooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex items-center gap-1 font-[330] text-[12px] leading-none">
                <span className={data.lastTxTime ? 'text-[#21E09D]' : 'text-[#79778C]'}>
                  {data.lastTxTime ? dayjs(data.lastTxTime).locale('en').fromNow(true) : '--'}
                </span>
                <div className="flex items-center gap-1">
                  <IconWallet className="size-[14px] text-[#79778C]" />
                  <span className="text-[#79778C]">{walletName}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="min-w-[120px] px-3 space-y-1.5">
            <div className="font-[330] text-[14px] text-rise leading-none">
              {formatBalance(totalBuyUsd, {
                showCurrency: true,
                roundMode: 'floor',
              })}
            </div>
            <div className="font-[330] text-[12px] text-[#79778C] leading-none">
              {formatAmount(totalBuyQty, {
                roundMode: 'floor',
                unit: symbol,
              })}
            </div>
          </div>
          <div className="min-w-[120px] px-3 space-y-1.5">
            <div className="font-[330] text-[14px] text-fall leading-none">
              {formatBalance(totalSellUsd, {
                showCurrency: true,
                roundMode: 'floor',
              })}
            </div>
            <div className="font-[330] text-[12px] text-[#79778C] leading-none">
              {formatAmount(totalSellQty, {
                roundMode: 'floor',
                unit: symbol,
              })}
            </div>
          </div>
          <div className="min-w-[120px] px-3 space-y-1.5 flex flex-col justify-center">
            <div
              className={`font-[330] text-[14px] text-[#FBFBFB] leading-none ${lowLiquidity ? 'line-through decoration-2' : ''}`}
            >
              {!price || price === 0 ? (
                <Loader />
              ) : (
                formatBalance(holdingValue, { showCurrency: true, roundMode: 'floor' })
              )}
            </div>
            <div className={`font-[330] text-[12px] text-[#79778C] leading-none ${lowLiquidity ? 'line-through' : ''}`}>
              {formatAmount(totalBaseAmount, {
                roundMode: 'floor',
                unit: symbol,
              })}
            </div>
          </div>
          <div className="min-w-[120px] px-3 flex items-center font-[330] text-[14px] text-[#FBFBFB] leading-none">
            {+holdingTime > 0 ? dayjs.duration(+holdingTime).humanize().replace(' ', '') : '--'}
          </div>
          <div className="min-w-[170px] pl-3 flex items-center">
            {!price || price === 0 ? (
              <Loader />
            ) : (
              <div
                className={cn(
                  'font-[330] text-[14px] leading-none',
                  Number(unrealized) > 0 ? 'text-rise' : Number(unrealized) < 0 ? 'text-fall' : 'text-[#FBFBFB]',
                  lowLiquidity ? 'line-through' : '',
                )}
              >
                {formatBalance(data?.avgPriceUsd && data?.totalBuyUsd ? unrealized : null, {
                  showCurrency: true,
                  roundMode: 'floor',
                })}{' '}
                (
                {formatPercent(returnRate ?? 0, {
                  showSign: true,
                })}
                )
              </div>
            )}
          </div>
          <div className="min-w-[50px] px-3 flex items-center justify-end">
            <div className="flex items-center justify-end gap-4">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="size-4 text-[#79778C] hover:text-white cursor-move drag-handle">
                      <button
                        className="size-4 text-[#79778C] hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenShare(true)
                        }}
                      >
                        <IconExport className="size-4" />
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#212127] p-2 border border-[#79778C29] rounded-md font-[330] text-[12px] leading-1.5 text-[#908E98]">
                    {t('button.share')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <ButtonShare
          showTitle={false}
          costPrice={data?.avgPriceUsd ?? ''}
          returnRate={returnRate}
          tokenName={symbol}
          tokenAvatar={data?.avatarUrl ? data?.avatarUrl : (data?.logoUrl ?? '')}
          tokenLatestPrice={price ?? ''}
          tokenAddress={data?.token ?? ''}
          // avgMC={avgMC}
          holdingValue={holdingValue}
          holdingQuantity={totalBaseAmount ?? 0}
          PnL={data?.avgPriceUsd ? PnL : '--'}
          realized={data?.realizedPnL ? realized : '--'}
          unrealized={data?.avgPriceUsd ? unrealized : '--'}
          chainId={data?.chainId ?? ChainIds.Solana}
          isXStock={isXStock}
          totalBuy={data?.totalBuyUsd ?? '--'}
          openShare={openShare}
          setOpenShare={setOpenShare}
          showIcon={false}
        />
      </>
    )
  },
)

HoldingItem.displayName = 'HoldingItem'

const HoldingItemSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'min-h-[48px] w-max min-w-full px-4 py-3 grid grid-cols-[3fr_2fr_2fr_2fr_2fr_170px_50px]',
            index % 2 === 0 ? 'bg-[#101114]' : 'bg-transparent',
          )}
        >
          <div className="min-w-[230px] pr-3 flex items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-[12px] w-[120px]" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-[12px] w-[60px]" />
                <Skeleton className="h-[12px] w-[80px]" />
              </div>
            </div>
          </div>
          <div className="min-w-[120px] px-3 space-y-2">
            <Skeleton className="h-[14px] w-[80px]" />
            <Skeleton className="h-[12px] w-[60px]" />
          </div>
          <div className="min-w-[120px] px-3 space-y-2">
            <Skeleton className="h-[14px] w-[80px]" />
            <Skeleton className="h-[12px] w-[60px]" />
          </div>
          <div className="min-w-[120px] px-3 space-y-2">
            <Skeleton className="h-[14px] w-[90px]" />
            <Skeleton className="h-[12px] w-[70px]" />
          </div>
          <div className="min-w-[120px] px-3 flex items-center">
            <Skeleton className="h-[14px] w-[70px]" />
          </div>
          <div className="min-w-[170px] pl-3 flex items-center">
            <Skeleton className="h-[14px] w-[110px]" />
          </div>
          <div className="min-w-[50px] px-3 flex items-center justify-end">
            <Skeleton className="size-5 rounded-md" />
          </div>
        </div>
      ))}
    </>
  )
}

type Props = {
  hidden: boolean
  walletsByChain: UserEmbeddedWalletDto[]
  wallet: string | undefined
  chainId?: number | undefined
  hideZeroBalance?: boolean
  hideSmallBalance?: boolean
  hideSmallLiquidity?: boolean
}

export const Holdings = ({
  hidden,
  walletsByChain,
  wallet,
  chainId,
  hideZeroBalance = false,
  hideSmallBalance = false,
  hideSmallLiquidity = false,
}: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const activeWallet = useActiveWallet()
  const dispatch = useAppDispatch()
  const walletAddresses = useMemo(() => {
    if (!wallet) {
      return walletsByChain.map((item: any) => item?.walletAddress)
    }
    return [wallet]
  }, [wallet, walletsByChain])
  const [sortBy, setSortBy] = useState('-holdingValue')
  const [totalHoldingTokens, setTotalHoldingTokens] = useState<number>(0)
  const walletAddressesKey = useMemo(() => walletAddresses.join('|'), [walletAddresses])
  const {
    data: holdingsData,
    refetch,
    isLoading,
    hasNextPage: hasMore,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['holdings', hideSmallBalance, hideSmallLiquidity, hideZeroBalance, sortBy, walletAddressesKey, chainId],
    initialPageParam: 1,
    enabled: activeWallet.isConnected,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await gqlClient.query({
        query: getPortfolio,
        variables: {
          input: {
            chainId: chainId,
            userAddresses: walletAddresses,
            hideSmallBalance: hideSmallBalance,
            hideSmallLiquidity: hideSmallLiquidity,
            hideZeroBalance: hideZeroBalance,
            limit: 20,
            page: pageParam,
            sortBy: sortBy,
            allToken: false,
          },
        },
        fetchPolicy: 'no-cache',
      })
      setTotalHoldingTokens(res?.data?.getPortfolio?.totalHoldingTokens || 0)
      return res?.data?.getPortfolio?.data || []
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length + 1
    },
  })

  useEffect(() => {
    if (!hidden) refetch()
  }, [hidden])

  const holdings = useMemo(() => {
    if (!holdingsData) return []
    const data = holdingsData.pages.flatMap((page) => page || [])

    return [...data].sort((a, b) => {
      const holdingValueA = (a?.totalBaseAmount || 0) * Number(a?.price || 0)
      const holdingValueB = (b?.totalBaseAmount || 0) * Number(b?.price || 0)
      const lowLiquidityA = a?.lowLiquidity || false
      const lowLiquidityB = b?.lowLiquidity || false

      if (lowLiquidityA && !lowLiquidityB) return 1
      if (!lowLiquidityA && lowLiquidityB) return -1

      return holdingValueB - holdingValueA
    })
  }, [holdingsData?.pages])

  useEffect(() => {
    dispatch(setTotalHoldingTokensAction(totalHoldingTokens))
  }, [dispatch, totalHoldingTokens])

  const [totalUnrealizedPnL, setTotalUnrealizedPnLState] = useState<number>(0)
  const unrealizedCacheRef = useRef<Record<string, number>>({})
  const holdingsKeySetRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const nextKeys = new Set(
      holdings.map((item: PortfolioDto) => buildHoldingKey(item?.chainId, item?.token, item?.userAddress)),
    )
    holdingsKeySetRef.current = nextKeys
    const cache = unrealizedCacheRef.current
    Object.keys(cache).forEach((key) => {
      if (!nextKeys.has(key)) {
        delete cache[key]
      }
    })
    const nextTotal = Array.from(nextKeys).reduce((sum, key) => sum + (cache[key] ?? 0), 0)
    setTotalUnrealizedPnLState(nextTotal)
  }, [holdings, totalHoldingTokens])

  const handleUnrealizedChange = useCallback(
    (key: string, value: number) => {
      if (!holdingsKeySetRef.current.has(key)) return
      const cache = unrealizedCacheRef.current
      if (cache[key] === value) return
      cache[key] = value
      const total = Array.from(holdingsKeySetRef.current).reduce(
        (sum, cacheKey) => new BigNumber(sum).plus(new BigNumber(cache[cacheKey] || 0)).toNumber(),
        0,
      )
      setTotalUnrealizedPnLState(total)
    },
    [totalHoldingTokens],
  )

  useEffect(() => {
    dispatch(setTotalUnrealizedPnLAction(totalUnrealizedPnL))
  }, [dispatch, totalUnrealizedPnL])

  useEffect(() => {
    return () => {
      // Cancel any ongoing queries related to meme tokens when the component unmounts
      queryClient.cancelQueries({
        queryKey: [
          'holdings',
          hideSmallBalance,
          hideSmallLiquidity,
          hideZeroBalance,
          sortBy,
          walletAddressesKey,
          chainId,
        ],
      })

      // Clear the query cache for meme tokens, except first page
      queryClient.setQueryData(
        ['holdings', hideSmallBalance, hideSmallLiquidity, hideZeroBalance, sortBy, walletAddressesKey, chainId],
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.slice(0, 1), // Keep only the first page
            pageParams: oldData.pageParams.slice(0, 1), // Keep only the first page param
          }
        },
      )
    }
  }, [chainId, hideSmallBalance, hideSmallLiquidity, hideZeroBalance, queryClient, sortBy, walletAddressesKey])

  return (
    <div className={cn(hidden ? 'hidden' : 'block', 'w-full overflow-auto')}>
      <div className="min-h-[48px] w-max min-w-full px-4 py-[14px] grid grid-cols-[3fr_2fr_2fr_2fr_2fr_170px_50px] items-center font-[330] text-[13px] text-[#6C6A74] leading-none">
        <div className="min-w-[230px] pr-3 flex items-center gap-1.5">
          <span className="pr-1.5 border-r border-[#6C6A74]">{t('assets.meme.holdings.token')}</span>
          <span
            className="cursor-pointer flex items-center gap-1"
            onClick={() => setSortBy(sortBy === '-lastTxTime' ? '+lastTxTime' : '-lastTxTime')}
          >
            {t('assets.meme.holdings.lastActive')}
            <div className="flex flex-col cursor-pointer">
              <IconSortUp currentColor={sortBy === '+lastTxTime' ? '#9B2CFC' : '#645F7B'} />
              <IconSortDown currentColor={sortBy === '-lastTxTime' ? '#9B2CFC' : '#645F7B'} />
            </div>
          </span>
        </div>
        <div
          className="min-w-[120px] px-3 flex items-center gap-1 cursor-pointer"
          onClick={() => setSortBy(sortBy === '-totalBuyUsd' ? '+totalBuyUsd' : '-totalBuyUsd')}
        >
          {t('assets.meme.holdings.totalBuy')}
          <div className="flex flex-col cursor-pointer">
            <IconSortUp currentColor={sortBy === `+totalBuyUsd` ? '#9B2CFC' : '#645F7B'} />
            <IconSortDown currentColor={sortBy === `-totalBuyUsd` ? '#9B2CFC' : '#645F7B'} />
          </div>
        </div>
        <div
          className="min-w-[120px] px-3 flex items-center gap-1 cursor-pointer"
          onClick={() => setSortBy(sortBy === '-totalSellUsd' ? '+totalSellUsd' : '-totalSellUsd')}
        >
          {t('assets.meme.holdings.totalSell')}{' '}
          <div className="flex flex-col cursor-pointer">
            <IconSortUp currentColor={sortBy === `+totalSellUsd` ? '#9B2CFC' : '#645F7B'} />
            <IconSortDown currentColor={sortBy === `-totalSellUsd` ? '#9B2CFC' : '#645F7B'} />
          </div>
        </div>
        <div
          className="min-w-[120px] px-3 flex items-center gap-1 cursor-pointer"
          onClick={() => setSortBy(sortBy === '-holdingValue' ? '+holdingValue' : '-holdingValue')}
        >
          {t('assets.meme.holdings.balance')}
          <div className="flex flex-col cursor-pointer">
            <IconSortUp currentColor={sortBy === `+holdingValue` ? '#9B2CFC' : '#645F7B'} />
            <IconSortDown currentColor={sortBy === `-holdingValue` ? '#9B2CFC' : '#645F7B'} />
          </div>
        </div>
        <div className="min-w-[120px] px-3">{t('assets.meme.holdings.holdingTime')}</div>
        <div className="min-w-[170px] px-3">{t('assets.meme.holdings.unrealizedPnl')}</div>
        <div className="min-w-[50px] pl-3"></div>
      </div>
      <div
        className="h-[375px] w-max min-w-full overflow-y-auto overflow-x-hidden"
        style={{ scrollbarGutter: 'stable' }}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement
          if (target.scrollTop / (target.scrollHeight - target.clientHeight) > 0.75) {
            if (hasMore && !loadingMore) {
              fetchNextPage()
            }
          }
        }}
      >
        {isLoading ? (
          <HoldingItemSkeleton count={6} />
        ) : holdings.length === 0 ? (
          <div className="h-[200px] flex flex-col justify-center items-center gap-2">
            <IconEmpty />
            <span className="text-[#FFFFFF80] text-[0.75rem] text-center max-w-[320px]">{t('history.nodata')}</span>
          </div>
        ) : (
          holdings.map((token: PortfolioDto, index) => (
            <HoldingItem key={index} data={token} index={index} onUnrealizedChange={handleUnrealizedChange} />
          ))
        )}
      </div>
    </div>
  )
}
