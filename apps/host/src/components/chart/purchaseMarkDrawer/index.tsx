import { TxType } from '@/@generated/gql/graphql-future.ts'
import DrawerCopyTrade from '@/components/listCoin/drawer/DrawerCopyTrade'
import { Button } from '@/components/ui/button'
import { useGetTradingTransactionInfinite } from '@/hooks/useGetTradingTransactionInfinite'
import { useMemeTokenDetailMCAndPrice } from '@/hooks/useMemeTokenDetailMCAndPrice.ts'
import { useWalletTokenStatistic } from '@/hooks/useWalletTokenStatistic'
import { APP_PATH } from '@/lib/constant.ts'
import { formatAmount, formatPercent, formatPrice, formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { RootState, useAppSelector } from '@/redux/store'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import { Loading } from '@components/common/Loading.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import AliasCard from '@components/listCoin/card/AliasCard'
import { DrawerClose } from '@components/ui/drawer'
import { Progress } from '@components/ui/progress'
import dayjs from 'dayjs'
import { XIcon } from 'lucide-react'
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PurchaseMarkTradeTable } from './PurchaseMarkTradeTable'
import { TimeRange } from '@components/chart/purchaseMarkDrawer/TimeRange.ts'
import { Sheet, SheetContent } from '@components/ui/sheet.tsx'
import { DialogTitle } from '@radix-ui/react-dialog'
import { PriceChart } from '@components/chart/purchaseMarkDrawer/PriceChart.tsx'

export type PurchaseMark = {
  id: number
  side: 'buy' | 'sell'
  time: number
  price: number
  amount?: number
  wallet?: string
}

export type PurchaseMarkDrawerProps = {
  token: string
  chainId: number
  open: boolean
  setOpen: (open: boolean) => void
  address: string
}

const Stat = memo(({ label, value, subValue }: { label: string; value: React.ReactNode; subValue?: string }) => (
  <div className="space-y-1">
    <div className="text-sm text-white/80">{label}</div>
    <div className="text-sm text-white">{value}</div>
    {subValue && <div className="text-sm text-white/60">{subValue}</div>}
  </div>
))
Stat.displayName = 'Stat'

// export const enum TimeRange {
//   '4H' = '4H',
//   '1D' = '1D',
//   '7D' = '7D',
//   '30D' = '30D',
// }

const timeRangeOptions = [TimeRange.H4, TimeRange.D1, TimeRange.D7, TimeRange.D30] as const

const PurchaseMarkDrawer: React.FC<PurchaseMarkDrawerProps> = memo(({ open, setOpen, address, token, chainId }) => {
  const { t } = useTranslation()
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.H4)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { price: ohlcPrice } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const { data: tokenDetailData } = useMemeTokenDetailMCAndPrice(token, chainId)
  const [txType, setTxType] = useState<TxType>(TxType.All)
  const tokenData = tokenDetailData?.getTokenDetail
  const [openCopyTrade, setOpenCopyTrade] = useState(false)

  const { data } = useWalletTokenStatistic(
    {
      address,
      token,
      chainId,
    },
    !address || !token || !chainId,
  )

  const {
    data: tradingTransactionData,
    isLoading: tradingTransactionLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetTradingTransactionInfinite({
    input: {
      token: token,
      chainId: chainId,
      addresses: address,
      sortBy: '-timestamp',
      type: txType,
    },
    skip: !token || !chainId || !address,
  })

  // Flatten all pages into a single array
  const allTransactions = useMemo(() => {
    if (!tradingTransactionData?.pages) return []
    return tradingTransactionData.pages.flatMap(
      (page) => page?.filter((tx) => tx?.type === 'Buy' || tx?.type === 'Sell') || [],
    )
  }, [tradingTransactionData])

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage().then()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      },
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [loadMore])

  const [realtimeHoldingDuration, setRealtimeHoldingDuration] = useState<number | null>(null)

  const walletTokenStatistic = data?.getWalletTokenStatistic

  const summary = useMemo(() => {
    if (!walletTokenStatistic) {
      return {
        totalProfit: 0,
        totalProfitPct: 0,
        unrealized: 0,
        unrealizedPct: 0,
        balance: 0,
        holdingDuration: 0,
        avgBuyPrice: 0,
        avgSellPrice: 0,
        totalBuyAmount: 0,
        totalUsdBuyAmount: 0,
        buyTXs: 0,
        totalSellAmount: 0,
        totalUsdSellAmount: 0,
        sellTXs: 0,
        maxHoldingQty: 0,
        positionPct: 0,
      }
    }

    const balance = Number(walletTokenStatistic.balance ?? 0)
    const totalProfit = Number(walletTokenStatistic.totalProfit ?? 0)
    const totalUsdBuyAmount = Number(walletTokenStatistic.totalUsdBuyAmount ?? 0)
    const totalUsdSellAmount = Number(walletTokenStatistic.totalUsdSellAmount ?? 0)
    const totalBuyAmount = Number(walletTokenStatistic.totalBuyAmount ?? 0)
    const totalSellAmount = Number(walletTokenStatistic.totalSellAmount ?? 0)
    const avgBuyPrice = totalBuyAmount > 0 ? totalUsdBuyAmount / totalBuyAmount : 0
    const avgSellPrice = totalSellAmount > 0 ? totalUsdSellAmount / totalSellAmount : 0
    const buyTXs = Number(walletTokenStatistic.buys ?? 0)
    const sellTXs = Number(walletTokenStatistic.sells ?? 0)
    const maxHoldingQty = Number(walletTokenStatistic.maxHoldingQty ?? 0)
    const holdingDuration = Number(walletTokenStatistic.holdingDuration ?? 0)
    const currentPrice = ohlcPrice ?? 0

    const unrealized = avgBuyPrice > 0 ? balance * currentPrice - avgBuyPrice * balance : 0
    const totalProfitPct = totalProfit > 0 && totalUsdBuyAmount > 0 ? (totalProfit / totalUsdBuyAmount) * 100 : 0
    const unrealizedPct = unrealized !== 0 && totalUsdBuyAmount > 0 ? (unrealized / totalUsdBuyAmount) * 100 : 0
    const positionPct = balance > 0 && maxHoldingQty > 0 ? (balance / maxHoldingQty) * 100 : 0

    // Use realtime value if available
    const displayHoldingDuration = realtimeHoldingDuration ?? holdingDuration

    return {
      totalProfit,
      totalProfitPct,
      unrealized,
      unrealizedPct,
      balance,
      holdingDuration: displayHoldingDuration,
      avgBuyPrice,
      avgSellPrice,
      totalBuyAmount,
      totalUsdBuyAmount,
      buyTXs,
      totalSellAmount,
      totalUsdSellAmount,
      sellTXs,
      maxHoldingQty,
      positionPct,
    }
  }, [walletTokenStatistic, ohlcPrice, realtimeHoldingDuration])

  // Real-time counter for holdingDuration when < 60 seconds and balance > 0
  useEffect(() => {
    if (!walletTokenStatistic) {
      setRealtimeHoldingDuration(null)
      return
    }

    const holdingDuration = Number(walletTokenStatistic.holdingDuration ?? 0)
    const balance = Number(walletTokenStatistic.balance ?? 0)

    // Skip if no balance or holdingDuration >= 60 seconds
    if (balance <= 0 || holdingDuration >= 60) {
      setRealtimeHoldingDuration(null)
      return
    }

    // Initialize realtime counter with current holdingDuration
    setRealtimeHoldingDuration(holdingDuration)

    // Set up interval to increment every second
    const interval = setInterval(() => {
      setRealtimeHoldingDuration((prev) => {
        if (prev === null) return holdingDuration
        const next = prev + 1
        // Stop incrementing if it reaches 60 seconds
        return next >= 60 ? 60 : next
      })
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [walletTokenStatistic])

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          className="fixed top-0 right-0 bottom-0 left-auto mt-0 flex min-w-full  p-0 flex-col border-none bg-[#212127] outline-none md:min-w-[620px] 2xl:min-w-[720px]"
          aria-describedby={undefined}
        >
          <DialogTitle></DialogTitle>
          <div className="min-h-0 flex-1 space-y-4 p-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogoWithChain
                  logo={tokenData?.info?.logoUrl || ''}
                  logoClassName="w-9 h-9"
                  name={tokenData?.symbol || ''}
                  chainLogo={getBlockchainLogo2(Number(tokenData?.chainId))}
                />
                <div className="">
                  <div className="text-sm text-white">
                    {tokenData?.symbol || ''} {formatPrice(ohlcPrice, { showCurrency: true })}
                  </div>
                  <div className="text-sm text-white/60">
                    MCap{' '}
                    {formatVolume((Number(tokenData?.totalSupply) || 0) * (ohlcPrice || 0), { showCurrency: true })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {timeRangeOptions.map((item) => (
                    <Button
                      key={item}
                      variant="ghost"
                      size="sm"
                      onClick={() => setTimeRange(item)}
                      className={cn(item === timeRange ? 'bg-white/10' : '')}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
                <DrawerClose aria-label="Close">
                  <XIcon className="size-4 text-white/70" />
                </DrawerClose>
              </div>
            </div>
            <PriceChart
              className="h-[200px] w-full z-50"
              timeRange={timeRange}
              tokenAddress={token}
              chainId={chainId}
              transactions={allTransactions}
              avgBuyPrice={summary.avgBuyPrice}
              avgSellPrice={summary.avgSellPrice}
              currentPrice={ohlcPrice || 0}
            />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <AliasCard name="" address={address} useCopyButton classNameWrapper="flex items-center" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Stat
                  label={t('walletStats.realizedPnL')}
                  value={
                    <span
                      className={summary.totalProfit > 0 ? 'text-rise' : summary.totalProfit < 0 ? 'text-fall' : ''}
                    >
                      {formatVolume(summary.totalProfit, { showCurrency: true, roundMode: 'floor' })} (
                      {formatPercent(summary.totalProfitPct)})
                    </span>
                  }
                />
                <Stat
                  label={t('walletStats.unRealizedPnL')}
                  value={
                    <span className={summary.unrealized > 0 ? 'text-rise' : summary.unrealized < 0 ? 'text-fall' : ''}>
                      {formatVolume(summary.unrealized, { showCurrency: true, roundMode: 'floor' })} (
                      {formatPercent(summary.unrealizedPct)})
                    </span>
                  }
                />
                <Stat
                  label={t('walletStats.balance')}
                  value={formatVolume(summary.balance * (ohlcPrice ?? 0), { showCurrency: true, roundMode: 'floor' })}
                />
                <Stat
                  label={`${t('walletStats.position')} %(${formatAmount(summary.balance)} of ${formatAmount(summary.maxHoldingQty)})`}
                  value={
                    <div className="flex items-center gap-2">
                      <div>
                        {formatPercent(summary.positionPct, {
                          showSmallAsAngleBracket: true,
                        })}
                      </div>
                      <div className="w-[120px]">
                        <Progress
                          value={summary.positionPct}
                          className="h-1 bg-white/20"
                          classNameIndicaticator="bg-white/70"
                        />
                      </div>
                    </div>
                  }
                />
                <Stat
                  label={t('walletStats.holdingDuration')}
                  value={
                    summary.holdingDuration > 0
                      ? dayjs
                          .duration(summary.holdingDuration * 1000)
                          .humanize()
                          .replace(' ', '')
                      : '--'
                  }
                />
                <Stat
                  label={t('walletStats.avgPriceBuySell')}
                  value={`${formatPrice(summary.avgBuyPrice, { showCurrency: true })}/${formatPrice(summary.avgSellPrice, { showCurrency: true })}`}
                />
                <Stat
                  label={t('walletStats.bought')}
                  value={
                    <span className="text-rise">
                      {formatVolume(summary.totalUsdBuyAmount, { showCurrency: true, roundMode: 'floor' })}
                      <span className="text-white/70"> / </span> {summary.buyTXs.toLocaleString('en-US')} TXs
                    </span>
                  }
                  subValue={formatAmount(summary.totalBuyAmount, { roundMode: 'floor' })}
                />
                <Stat
                  label={t('walletStats.sold')}
                  value={
                    <span className="text-fall">
                      {formatVolume(summary.totalUsdSellAmount, { showCurrency: true, roundMode: 'floor' })}{' '}
                      <span className="text-white/70"> / </span> {summary.sellTXs.toLocaleString('en-US')} TXs
                    </span>
                  }
                  subValue={formatAmount(summary.totalSellAmount, { roundMode: 'floor' })}
                />
              </div>
            </div>
            <div className="flex justify-center items-center flex-row gap-2.5">
              <Button
                type="button"
                variant="close"
                className="flex-1 rounded-md"
                onClick={() => {
                  window.open(APP_PATH.MEME_WALLET + `/${address}?tab=Summary`, '_blank')
                }}
              >
                {t('header.portfolio')}
              </Button>
              <Button
                variant="gradient"
                type="button"
                className="flex-1 rounded-md"
                onClick={() => {
                  setOpenCopyTrade(true)
                  setOpen(false)
                }}
              >
                {t('smartMoney.tabs.walletCopy')}
              </Button>
            </div>
            <div className="max-h-dvh md:max-h-[calc(100vh-650px)] rounded-md border border-white/10 overflow-auto no-scrollbar">
              <PurchaseMarkTradeTable
                txType={txType}
                setTxType={setTxType}
                transactions={allTransactions}
                loading={tradingTransactionLoading}
                totalSupply={Number(tokenData?.totalSupply) || 0}
              />
              {hasNextPage && (
                <div className="flex justify-center p-2">
                  <Loading />
                </div>
              )}
              <div ref={loadMoreRef} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <DrawerCopyTrade open={openCopyTrade} setOpen={setOpenCopyTrade} leaderAddress={address} />
    </div>
  )
})

PurchaseMarkDrawer.displayName = 'PurchaseMarkDrawer'

export default PurchaseMarkDrawer
