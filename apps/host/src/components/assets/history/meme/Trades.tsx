import ButtonShare from '@/components/myPositions/ButtonShare.tsx'
import { APP_PATH } from '@/lib/constant'
import { formatAmount, formatBalance, formatPercent, formatPrice } from '@/lib/format'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { getPath } from '@/lib/utils.ts'
import {
  setIsHiddenSmallPoll,
  setIsHiddenSmallerThan1U,
  setIsShowOnlyCurrentCurrency,
} from '@/redux/modules/holding.slice.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { setCurrentHoldingTab } from '@/redux/modules/tradeTab.slice.ts'
import { useAppDispatch } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { getBlockchainLogo2 } from '@/utils/helpers'
import { Loading } from '@components/common/Loading.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { IconEmpty } from '@components/icon'
import { IconWarning } from '@components/icon/stroke/IconWarning.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import useTokenPrice from '@hooks/useTokenPrice.ts'
import { usePriceOHLC } from '@hooks/useTokenPriceChange.ts'
import { getPortfolio } from '@services/tokens.service.ts'
import { useInfiniteQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

const Item = ({
  data,
  onShareClick,
}: {
  data: any
  onShareClick: (data: {
    costPrice: string | number
    returnRate: string | number
    avgMC: string | number
    holdingValue: string | number
    holdingQuantity: string | number
    chainId: number
    pnl: string | number
    tokenAddress: string
    tokenName: string
    symbol: string
    tokenAvatar: string
    tokenLatestPrice: string | number
    realized: string | number
    unrealized: string | number
    totalBuyValue?: string | number
    totalBuyQty?: string | number
    isXStock?: boolean
  }) => void
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const priceOHLC = usePriceOHLC({ address: data?.token ?? '', defaultValue: '0' })
  const priceMqtt = useTokenPrice(data?.token ?? '', '0')
  const dispatch = useAppDispatch()
  const fallBackPrice = data?.price || 0
  const price =
    priceOHLC && Number(priceOHLC) != 0 ? Number(priceOHLC) : priceMqtt != 0 ? priceMqtt : Number(fallBackPrice)
  const holdingValue = price ? data?.totalBaseAmount * +price : '--'
  const realized = data?.realizedPnL ? Number(data?.realizedPnL) : 0
  const unrealized =
    data?.totalBaseAmount && data.totalBaseAmount > 0 && price != 0 && data?.avgPriceUsd != 0
      ? (Number(price) - Number(data?.avgPriceUsd)) * data?.totalBaseAmount
      : 0
  const pnl = data?.avgPriceUsd == 0 || data?.totalBuyUsd == 0 ? 0 : Number(realized) + Number(unrealized)
  const returnRateValue =
    data?.totalBuyUsd != 0 ? ((Number(realized) + Number(unrealized)) * 100) / data?.totalBuyUsd : 0
  const returnRate = data?.avgPriceUsd == 0 || data?.totalBuyUsd == 0 || price == 0 ? 0 : returnRateValue
  const isXStock = data?.isXStock || false
  const lowLiquidity = data?.lowLiquidity || false
  const isSoldOut = data?.totalBaseAmount == 0 || data?.totalBaseAmount === null
  const costPrice = !data?.avgPriceUsd || !data?.totalBuyUsd ? 0 : data?.avgPriceUsd

  const handleNavigation = () => {
    const chainType =
      data.chainId === ChainIds.Ethereum
        ? 'arb'
        : data.chainId === ChainIds.Arbitrum
          ? 'arb'
          : data.chainId === ChainIds.Bsc
            ? 'bsc'
            : 'sol'
    dispatch(setCurrentHoldingTab('holding'))
    dispatch(setIsHiddenSmallPoll(false))
    dispatch(setIsHiddenSmallerThan1U(false))
    dispatch(setIsShowOnlyCurrentCurrency(true))
    const path = data?.isXStock ? APP_PATH.X_STOCK_DETAIL : APP_PATH.MEME_TOKEN_DETAIL
    navigate(
      getPath(path, {
        address: data.token,
        chain: chainType,
      }) + '?tab=holding',
      {
        state: {
          symbol: data.symbol,
          tokenLogo: data.logoUrl,
          address: data.token,
          chainId: data.chainId,
        },
      },
    )
  }

  return (
    <div className="rounded-[6px] border-[0.5px] border-[#343339] bg-[#18181D] px-3 py-2.5" onClick={handleNavigation}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoWithChain
            logo={data?.logoUrl}
            logoClassName="w-[28px] h-[28px]"
            name={data?.symbol}
            chainLogo={getBlockchainLogo2(data.chainId)}
          />
          <div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1.5">
                <div className="text-[14px] leading-3.5 font-medium text-white">{data.symbol}</div>
                {isXStock && <IconXStock />}
              </div>
              {isSoldOut && (
                <span className="rounded-[4px] bg-[#00FFB41A] px-1 py-0.5 text-[12px] font-[330] text-[#00FFB4]">
                  {t('assets.funding.soldOut')}
                </span>
              )}
              <div
                className="flex cursor-pointer items-center"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onShareClick({
                    costPrice,
                    returnRate,
                    avgMC: data?.avgMarketCap ?? '--',
                    holdingValue,
                    holdingQuantity: data?.totalBaseAmount ?? '--',
                    chainId: data?.chainId,
                    pnl: pnl,
                    tokenAddress: data?.token,
                    tokenName: data.symbol,
                    symbol: data.symbol,
                    tokenAvatar: data?.logoUrl,
                    tokenLatestPrice: price || '0',
                    realized: realized || '0',
                    unrealized: unrealized || '0',
                    totalBuyValue: data?.totalBuyUsd ?? '--',
                    totalBuyQty: data?.totalBuyQty ?? '--',
                    isXStock: isXStock,
                  })
                }}
              >
                <img
                  src="/images/futuresDetail/share-icon.svg"
                  alt="icon share"
                  className="h-4 w-4 transition-all duration-100 hover:scale-[1.1]"
                />
              </div>
              {lowLiquidity && (
                <TooltipProvider>
                  <SimpleTooltip
                    content={t('assets.overview.lowLiquidityTokenWarning')}
                    contentClassName="max-w-[75vw]"
                  >
                    <IconWarning
                      className="size-4"
                      onClick={(event) => {
                        event.stopPropagation()
                        event.preventDefault()
                      }}
                    />
                  </SimpleTooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="mt-2 text-[11px] leading-2.75 font-[330] text-[#605E68]">
              {t('assets.funding.lastActive')}:{' '}
              {data.lastTxTime ? dayjs(data.lastTxTime).locale('en').fromNow(true) : '--'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] leading-2.75 font-[330] text-[#605E68]">{t('assets.funding.totalPnl')}</div>
          <div
            className={`mt-2 ${
              typeof pnl === 'number' ? (pnl > 0 ? 'text-rise' : pnl < 0 ? 'text-fall' : 'text-white') : 'text-white'
            }`}
          >
            <div className={`flex items-center justify-end gap-1 ${lowLiquidity ? 'line-through' : ''}`}>
              <span className="text-[13px] font-medium">
                {formatBalance(pnl, {
                  roundMode: 'floor',
                })}
              </span>

              <span className="text-[11px] font-[330]">
                {returnRate === '--'
                  ? '--'
                  : `(${formatPercent(returnRate, {
                      showSign: true,
                    })})`}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-4 border-t-[0.5px] border-[#25242B] pt-2.5">
        <div>
          <div className="text-[12px] leading-none font-[330] text-[#605E68]">{t('detail.holderTable.totalBuy')}</div>
          <div
            className={`mt-2 flex items-center gap-1 text-[13px] font-medium ${data?.totalBuyUsd ? 'text-rise' : 'text-white'}`}
          >
            {formatBalance(data?.totalBuyUsd, {
              showCurrency: true,
              roundMode: 'floor',
            })}
          </div>
          <div className="mt-2 flex items-end gap-1">
            <LogoWithChain logo={data?.logoUrl} logoClassName="w-3 h-3 min-w-none text-[8px]" name={data?.symbol} />
            <div className="text-[11px] leading-none font-[330] text-[#605E68]">
              {formatAmount(data?.totalBuyQty, {
                roundMode: 'floor',
              })}
            </div>
          </div>
        </div>
        <div>
          <div className="text-[12px] leading-none font-[330] text-[#605E68]">{t('detail.holderTable.totalSell')}</div>
          <div
            className={`mt-2 flex items-center gap-1 text-[13px] font-medium ${data?.totalSellUsd ? 'text-fall' : 'text-white'}`}
          >
            {formatBalance(data?.totalSellUsd, {
              showCurrency: true,
              roundMode: 'floor',
            })}
          </div>
          <div className="mt-2 flex items-end gap-1">
            <LogoWithChain logo={data?.logoUrl} logoClassName="w-3 h-3 min-w-none text-[8px]" name={data?.symbol} />
            <div className="text-[11px] leading-none font-[330] text-[#605E68]">
              {formatAmount(data?.totalSellQty, {
                roundMode: 'floor',
              })}
            </div>
          </div>
        </div>
        <div>
          <div className="text-[11px] leading-none font-[330] text-[#605E68]">{t('assets.funding.averageCost')}</div>
          <div className="mt-2 flex items-center gap-1 text-[13px] font-medium text-white">
            {formatPrice(data?.avgPriceUsd, {
              showCurrency: true,
              roundMode: 'ceil',
            })}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[12px] leading-none font-[330] text-[#605E68]">{t('assets.funding.holding')}</div>
          <div
            className={`mt-2 flex items-center justify-end gap-1 text-[13px] font-medium text-white ${lowLiquidity ? 'line-through decoration-1' : ''}`}
          >
            {formatAmount(holdingValue, {
              roundMode: 'floor',
              showCurrency: true,
            })}
          </div>
          <div className="mt-2 flex items-end justify-end gap-1">
            <LogoWithChain logo={data?.logoUrl} logoClassName="w-3 h-3 min-w-none text-[8px]" name={data?.symbol} />
            <div className={`text-[11px] leading-none font-[330] text-[#605E68] ${lowLiquidity ? 'line-through' : ''}`}>
              {formatAmount(data?.totalBaseAmount, {
                roundMode: 'floor',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Trades = () => {
  const activeWallet = useSelector(_activeWallet)
  const { t } = useTranslation()
  const location = useLocation()
  const { chainId, wallet } = location.state || {}
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = useInfiniteQuery({
    queryKey: ['tokens', wallet, chainId, activeWallet.chainId, activeWallet.walletAddress],
    initialPageParam: 1,
    enabled: !!wallet,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await gqlClient.query({
        query: getPortfolio,
        variables: {
          input: {
            chainId: chainId || activeWallet?.chainId,
            userAddress: wallet || activeWallet?.walletAddress,
            limit: 20,
            page: pageParam,
            sortBy: '-holdingValue',
          },
        },
      })
      return (res?.data?.getPortfolio?.data || []) as any[]
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length + 1
    },
  })

  const tokens = useMemo(() => {
    const temp = data?.pages.flat() || []

    return [...temp].sort((a, b) => {
      const holdingValueA = (a?.totalBaseAmount || 0) * Number(a?.price || 0)
      const holdingValueB = (b?.totalBaseAmount || 0) * Number(b?.price || 0)
      const lowLiquidityA = a?.lowLiquidity || false
      const lowLiquidityB = b?.lowLiquidity || false

      if (lowLiquidityA && !lowLiquidityB) return 1
      if (!lowLiquidityA && lowLiquidityB) return -1

      return holdingValueB - holdingValueA
    })
  }, [data])

  const [openSharePopup, setOpenSharePopup] = useState(false)

  const [shareData, setShareData] = useState<{
    costPrice: string | number
    returnRate: string | number
    avgMC: string | number
    holdingValue: string | number
    holdingQuantity: string | number
    chainId: number
    pnl: string | number
    tokenAddress: string
    tokenName: string
    symbol: string
    tokenAvatar: string
    tokenLatestPrice: string | number
    realized: string | number
    unrealized: string | number
    totalBuyValue?: string | number
    totalBuyQty?: string | number
    isXStock?: boolean
  }>({
    costPrice: '',
    returnRate: '',
    avgMC: '',
    holdingValue: '',
    holdingQuantity: '',
    chainId: ChainIds.Solana,
    pnl: '',
    tokenAddress: '',
    tokenName: '',
    symbol: '',
    tokenAvatar: '',
    tokenLatestPrice: '',
    realized: '',
    unrealized: '',
    totalBuyValue: '',
    totalBuyQty: '',
    isXStock: false,
  })

  useEffect(() => {
    refetch()
  }, [chainId, wallet])

  return (
    <div
      className="no-scrollbar p-4 space-y-2 overflow-auto"
      onScroll={(e) => {
        const target = e.target as HTMLDivElement
        if (target.scrollTop + target.clientHeight >= target.scrollHeight * 0.75) {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }
      }}
    >
      {!isLoading && tokens && tokens.length > 0 && (
        <div className="space-y-3">
          {tokens.map((item, index) => {
            return (
              <div key={index}>
                <Item
                  data={item}
                  onShareClick={(data) => {
                    setShareData({
                      ...data,
                    })
                    setOpenSharePopup(true)
                  }}
                />
              </div>
            )
          })}
        </div>
      )}
      {!isLoading && tokens.length === 0 && (
        <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
          <IconEmpty />
          <span className="text-[0.75rem] text-[#FFFFFF80]">{t('history.nodata')}</span>
        </div>
      )}
      {(isFetchingNextPage || isLoading) && (
        <div className="flex items-center justify-center py-4">
          <Loading />
        </div>
      )}
      <ButtonShare
        openShare={openSharePopup}
        setOpenShare={setOpenSharePopup}
        costPrice={shareData.costPrice}
        returnRate={shareData.returnRate}
        avgMC={shareData.avgMC}
        holdingValue={shareData.holdingValue}
        totalBuy={shareData.totalBuyValue ?? '--'}
        holdingQuantity={shareData.holdingQuantity}
        chainId={shareData.chainId}
        PnL={shareData.pnl}
        tokenAddress={shareData.tokenAddress}
        tokenName={shareData.tokenName}
        tokenAvatar={shareData.tokenAvatar}
        tokenLatestPrice={shareData.tokenLatestPrice}
        realized={shareData.realized}
        unrealized={shareData.unrealized}
        isXStock={shareData.isXStock}
        showTitle={false}
        showIcon={false}
      />
    </div>
  )
}

export default Trades
