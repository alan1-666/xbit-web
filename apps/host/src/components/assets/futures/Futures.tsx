import { UserPositionResponse } from '@/@generated/gql/graphql-symbolDex'
import { getPerpMetaAndAssetCtxs } from '@/api/hyperliquid'
import SelectHistory from '@/components/assets/history/SelectHistory'
import Loader from '@/components/common/Loader'
import { ToastProvider } from '@/components/futuresDetails/tokenSearchDrawer/CustomToast'
import { generateL2BookTiers } from '@/components/futuresDetails/trade/tools'
import { xPositions } from '@/components/futuresDetails/trade/types'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { APP_PATH } from '@/lib/constant'
import { formatBalance, formatPercent } from '@/lib/format'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils.ts'
import { setAllTiers, setSymbolListCtxs, setUniverse } from '@/redux/modules/futuresMeta.slice'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import {
  setBalance,
  setEnhancedOverview,
  setHasData,
  setRawUSD,
  updatePositionsFromWebData2,
  UserPositionState,
} from '@/redux/modules/userPosition.Slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { getUserPosition } from '@/services/assets.service'
import { loadUserPosition, saveUserPosition, saveUserPositionWeb2AndBalance } from '@/utils/indexedDB/userPositionDB'
import { useLazyQuery } from '@apollo/client'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import ExchangeActions from '@components/assets/overview/ExchangeActions.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { IconArrowDown2, IconEmpty } from '@components/icon'
import IconClock from '@components/icon/stroke/IconClock.tsx'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { useAvailableFuturesBalance } from '@pages/assets/overview/hooks/useTotalBalance.ts'
import Decimal from 'decimal.js'
import { useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export interface EnhancedOverviewData {
  balance: number
  unrealizedPnl: number
  positionValue: number
  maintenanceMargin: number
  crossAccountLeverage: number
  crossMarginRatio: number
  availableMargin: number
  rawUSD: number
  availableWithdraw: number
  totalMargin: number
}

export interface EnhancedPosition {
  symbol: string
  size: string
  type: string // cross/isolated
  leverage: number
  maxLeverage: number
  unrealizedPnl: number
  pnlPercent: number
  marginUsed: number
  positionValue: number
  liqPrice: number
  entryPrice: number
  markPrice: number
  funding: number
  fundingFee: number
  time: string
  maintenanceMargin: number
  side: 'A' | 'B'
  positionInfo: xPositions
}

const Futures = ({ walletBalances }: { walletBalances: any }) => {
  const { positions, rawUSD, oneDayChange, hasData, enhancedOverview } = useAppSelector<RootState, UserPositionState>(
    (state) => state.userPosition,
  )

  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(!hasData)
  const [_, startTransition] = useTransition()
  const {
    hideBalance,
    toggleHideBalance,
    futuresBalance: totalEquity,
    futuresChange,
    loadingFuturesBalance: loadingBalance,
  } = useContext(AssetOverviewContext)
  const { availableBalance } = useAvailableFuturesBalance()
  const [openSelectHistory, setOpenSelectHistory] = useState(false)

  const changeAmount = futuresChange?.changeAmount || 0
  const changePercent = futuresChange?.changePercentage || 0

  const toggle = () => {
    toggleHideBalance(!hideBalance)
  }
  const [expandOverview, setExpandOverview] = useState(false)

  const {
    positions: positionsWebData2,
    webData2: { clearinghouseState },
    symbolListCtxs,
    withdrawable,
  } = useWebData2()

  useEffect(() => {
    if (clearinghouseState) {
      setIsLoading(false)
    }
  }, [clearinghouseState])

  const activeWallet = useSelector(_activeWallet)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)

  const [getUserPositionData, { data }] = useLazyQuery<UserPositionResponse>(getUserPosition, {
    client: symbolDexClient,
    fetchPolicy: 'network-only',
  })
  useEffect(() => {
    fetchPerpMetadata()
  }, [])

  useEffect(() => {
    dispatch(setSymbolListCtxs(symbolListCtxs))
  }, [symbolListCtxs, dispatch])

  const fetchPerpMetadata = async () => {
    try {
      const data = await getPerpMetaAndAssetCtxs()

      const universe = data[0]?.universe
      const contexts = data[1]

      const allTiers: any = {}

      if (universe.length) {
        for (let i = 0; i < universe.length; i++) {
          const coin = universe[i].name
          const szDecimals = universe[i].szDecimals
          const ctx = contexts[i]
          const rawMid = ctx.midPx ?? ctx.markPx
          if (!rawMid) continue
          const price = parseFloat(rawMid)
          allTiers[coin] = generateL2BookTiers(coin, price, szDecimals)
        }
        dispatch(setAllTiers(allTiers))

        dispatch(setUniverse(universe))
      }
    } catch (err: any) {}
  }
  const handleFetch = useCallback(async () => {
    try {
      await getUserPositionData({
        variables: {
          input: {
            walletAddress: activeWallet?.walletAddress,
          },
        },
      })
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }, [getUserPositionData, activeWallet?.walletAddress])

  const userPosition = useMemo(() => {
    if (!data) return null
    return data?.getUserPosition
  }, [data])

  // Priority data loading: Redux → Cache → Socket → API
  useEffect(() => {
    const initializeData = async () => {
      if (!activeWallet?.walletAddress || activeChain !== TYPE_CHAIN.ARB) return

      if (positions?.length > 0 || rawUSD > 0) {
        dispatch(setHasData(true))
        setIsLoading(false)
        return
      }

      try {
        const cached = await loadUserPosition()
        if (cached && (cached.positions || cached.rawUSD > 0)) {
          dispatch(setRawUSD({ rawUSD: cached.rawUSD || 0 }))
          dispatch(
            setBalance({
              balance: cached.balance,
            }),
          )
          dispatch(setHasData(true))
          startTransition(() => {
            setTimeout(() => {
              setIsLoading(false)
            }, 510)
          })
          return
        }
      } catch (error) {
        console.error('Cache load error:', error)
      }
      if (positionsWebData2?.length > 0) {
        dispatch(updatePositionsFromWebData2(positionsWebData2))
        dispatch(setHasData(true))
        return
      }
      handleFetch()
    }

    initializeData()
  }, [activeChain])

  useEffect(() => {
    if (!positions?.length && positionsWebData2?.length > 0) {
      dispatch(updatePositionsFromWebData2(positionsWebData2))
      dispatch(setHasData(true))
      setIsLoading(false)
    }
  }, [positionsWebData2, positions?.length])

  useEffect(() => {
    if (userPosition?.rawUSD !== undefined && userPosition?.rawUSD !== rawUSD) {
      dispatch(setRawUSD({ rawUSD: userPosition.rawUSD || 0 }))
    }
  }, [userPosition, rawUSD])

  // Calculate for each position
  const enhancedPositions = useMemo((): EnhancedPosition[] => {
    const dataSource = positionsWebData2?.length > 0 ? positionsWebData2 : positions

    return dataSource.map((position: xPositions): EnhancedPosition => {
      const positionValue = Number(position.positionValue)
      const pnlPercent = Number(position.returnOnEquity || '0') * 100
      const liqPrice = Number(position.liquidationPx || '0')
      const currentTime = new Date().toISOString()
      const maintenanceMargin = positionValue / position.maxLeverage / 2

      return {
        symbol: position.coin,
        size: position.szi,
        type: position.leverage.type,
        leverage: position.leverage.value,
        maxLeverage: position.maxLeverage,
        unrealizedPnl: Number(position.unrealizedPnl || '0'),
        pnlPercent: pnlPercent,
        marginUsed: Number(position.marginUsed),
        positionValue,
        liqPrice,
        entryPrice: Number(position.entryPx),
        markPrice: Number(position.markPrice),
        funding: parseFloat(position.cumFunding.allTime),
        fundingFee: parseFloat(position.cumFunding.sinceOpen),
        time: currentTime,
        maintenanceMargin,
        side: position.side,
        positionInfo: position,
      }
    })
  }, [positionsWebData2, positions])

  // Calculate overall position
  const enhancedOverviewData = useMemo((): EnhancedOverviewData => {
    const dataSource = enhancedPositions?.length > 0 ? enhancedPositions : positions
    if (rawUSD !== undefined && clearinghouseState?.crossMarginSummary?.accountValue) {
      const totalPositionValue = dataSource.reduce((a, b) => a + Number(b.positionValue), 0)
      const totalUnrealizedPnl = dataSource.reduce((a, b) => a + Number(b.unrealizedPnl), 0)
      const totalMargin = dataSource.reduce((a, b) => a + Number(b.marginUsed), 0)
      const totalMaintenanceMargin = positions.reduce(
        (sum: number, pos: xPositions) => sum + parseFloat(pos.positionValue) / pos.maxLeverage / 2,
        0,
      )

      const balance = clearinghouseState?.crossMarginSummary?.accountValue
      const crossAccountLeverage = balance !== 0 ? totalPositionValue / balance : 0
      const crossMarginRatio = balance !== 0 ? (totalMaintenanceMargin / balance) * 100 : 0
      // Available margin = Total Balance (Total Balance) - Total margin of all positions (Margin)
      const availableMargin = new Decimal(balance).sub(totalMargin).toNumber()
      const availableWithdraw = withdrawable

      return {
        balance,
        unrealizedPnl: totalUnrealizedPnl,
        positionValue: totalPositionValue,
        maintenanceMargin: totalMaintenanceMargin,
        crossAccountLeverage,
        crossMarginRatio,
        availableMargin,
        rawUSD,
        availableWithdraw: Math.max(0, availableWithdraw),
        totalMargin: totalMargin,
      }
    }

    return {
      balance: enhancedOverview?.balance || 0,
      unrealizedPnl: enhancedOverview?.unrealizedPnl || 0,
      positionValue: enhancedOverview?.positionValue || 0,
      maintenanceMargin: enhancedOverview?.maintenanceMargin || 0,
      crossAccountLeverage: enhancedOverview?.crossAccountLeverage || 0,
      crossMarginRatio: enhancedOverview?.crossMarginRatio || 0,
      availableMargin: enhancedOverview?.availableMargin || 0,
      rawUSD: enhancedOverview?.rawUSD || 0,
      availableWithdraw: enhancedOverview?.availableWithdraw || 0,
      totalMargin: enhancedOverview?.totalMargin || 0,
    }
  }, [enhancedPositions, clearinghouseState?.crossMarginSummary?.accountValue, positions])

  const enhancedOverviewRef = useRef(enhancedOverviewData)
  const positionsWebData2Ref = useRef(positionsWebData2)
  const balanceRef = useRef(0)

  // Update ref every time enhancedOverviewData changes
  useEffect(() => {
    enhancedOverviewRef.current = enhancedOverviewData
    positionsWebData2Ref.current = positionsWebData2
    balanceRef.current = clearinghouseState?.crossMarginSummary?.accountValue - enhancedOverviewData.unrealizedPnl
    if (clearinghouseState && positionsWebData2.length === 0 && positions.length !== 0) {
      dispatch(updatePositionsFromWebData2(positionsWebData2))
    }
  }, [enhancedOverviewData, positionsWebData2, clearinghouseState])

  useEffect(() => {
    const handleSaveToCahe = async () => {
      await saveUserPositionWeb2AndBalance(positionsWebData2Ref.current, balanceRef.current)
    }

    return () => {
      if (positionsWebData2Ref.current || balanceRef.current) {
        dispatch(
          setEnhancedOverview({
            enhancedOverview: enhancedOverviewRef.current,
          }),
        )
        handleSaveToCahe()
      }
    }
  }, [])

  useEffect(() => {
    if (clearinghouseState?.crossMarginSummary?.accountValue) {
      const accountValue = clearinghouseState?.crossMarginSummary?.accountValue
      dispatch(
        setBalance({
          balance: accountValue - enhancedOverviewData.unrealizedPnl,
        }),
      )
    }
  }, [enhancedOverviewData, clearinghouseState?.crossMarginSummary?.accountValue])

  useEffect(() => {
    const saveToCache = async () => {
      try {
        const cached = await loadUserPosition()

        if (!cached || !cached?.balance) {
          await saveUserPosition({
            positions: positionsWebData2 || [],
            rawUSD: rawUSD || 0,
            oneDayChange: oneDayChange || 0,
            balance: clearinghouseState?.crossMarginSummary?.accountValue ?? 0,
            lastUpdated: Date.now(),
          })
        }
      } catch (error) {
        console.error('Cache save error:', error)
      }
    }

    saveToCache()
  }, [rawUSD, oneDayChange, positionsWebData2?.length, clearinghouseState?.crossMarginSummary?.accountValue, positions])

  return (
    <ToastProvider>
      <div className="h-full">
        <div className="flex min-h-[240px] flex-col items-center justify-between bg-transparent">
          <div className="flex-1 flex flex-col items-center space-y-2 justify-center">
            <div className="text-[14px] leading-3.5 text-[#71717A]">{t('assets.perps.totalEquity')}</div>
            <div className="font-semi-bold cursor-pointer text-[32px] leading-8" onClick={toggle}>
              {loadingBalance ? (
                <Loader />
              ) : hideBalance ? (
                '*****'
              ) : (
                formatBalance(totalEquity, {
                  showCurrency: true,
                  roundMode: 'floor',
                })
              )}
            </div>
            <div className="flex items-center gap-2 text-[14px] leading-3.5">
              <span className="text-[#71717A]">{t('assets.perps.available')}</span>
              <span className="text-white">
                {loadingBalance ? (
                  <Loader />
                ) : hideBalance ? (
                  '*****'
                ) : (
                  formatBalance(availableBalance, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })
                )}
              </span>
            </div>
            <div
              className={cn(
                'flex items-center gap-2 text-[16px] leading-4',
                changeAmount > 0 ? 'text-rise' : changeAmount < 0 ? 'text-fall' : 'text-white',
              )}
            >
              <span>
                {loadingBalance ? (
                  <Loader />
                ) : hideBalance ? (
                  '*****'
                ) : (
                  formatBalance(changeAmount, {
                    showSign: true,
                    showCurrency: true,
                    roundMode: 'floor',
                  })
                )}
              </span>
              <span
                className={cn(
                  'rounded-[4px] px-2 py-[2.5px]',
                  changePercent > 0 ? 'bg-rise/15' : changePercent < 0 ? 'bg-fall/15' : 'bg-white/15',
                )}
              >
                {loadingBalance ? (
                  <Loader />
                ) : (
                  formatPercent(changePercent, {
                    showSign: true,
                  })
                )}
              </span>
            </div>
          </div>
          <ExchangeActions
            onDepositClick={() => {
              navigate(APP_PATH.PERPS_DEPOSIT, { state: { from: 'perps' } })
            }}
            onWithdrawClick={() => {
              navigate(APP_PATH.PERPS_WITHDRAW, { state: { from: 'perps' } })
            }}
            onTransferClick={() =>
              navigate(`${APP_PATH.CRYPTO_DEPOSIT}?source=futures`, { state: { walletBalances: walletBalances } })
            }
          />
        </div>
        <div className="mt-5 flex-1 rounded-t-2xl bg-[#0A0A0A] pt-3">
          <div className="sticky top-0 z-20 flex items-center justify-between bg-[#0A0A0A] px-4 py-1">
            <div className="text-[18px] font-medium text-white">{t('assets.perps.positions')}</div>
            <IconClock
              className="size-4 cursor-pointer text-[#908E98]"
              onClick={() => {
                setOpenSelectHistory(true)
              }}
            />
          </div>
          <div className="no-scrollbar mt-1 overflow-auto px-4 pt-2.5 pb-[80px]">
            {isLoading ? (
              <div>
                <Skeleton className="h-10.5 w-full rounded-[10px]" />
                <div className="mt-3.75 space-y-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-19 w-full rounded-[10px]" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {enhancedPositions.length > 0 && (
                  <div className="rounded-[10px] border border-[#2F2A4680] bg-linear-to-r from-[#FFFFFF05] to-[#FFFFFF0A] p-3">
                    <div
                      className="flex cursor-pointer items-center justify-between text-[14px] leading-[14px]"
                      onClick={() => setExpandOverview(!expandOverview)}
                    >
                      <span>{t('assets.perps.unrealProfit')}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            enhancedOverviewData.unrealizedPnl > 0 ? 'text-rise' : '',
                            enhancedOverviewData.unrealizedPnl < 0 ? 'text-fall' : '',
                            enhancedOverviewData.unrealizedPnl === 0 ? 'text-white' : '',
                          )}
                        >
                          {hideBalance
                            ? '*****'
                            : formatBalance(enhancedOverviewData.unrealizedPnl, {
                                showSign: true,
                                showCurrency: true,
                                roundMode: 'floor',
                              })}
                        </span>
                        <IconArrowDown2
                          className={cn('size-4 transition-transform', expandOverview ? 'rotate-180' : '')}
                        />
                      </div>
                    </div>
                    {expandOverview && (
                      <div className="mt-5 space-y-3.75">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] leading-3 text-[#908E98]">
                            {t('assets.futures.positionValue')}
                          </span>
                          <span className="text-[12px] leading-3 font-medium text-[#D9D9D9]">
                            {hideBalance
                              ? '*****'
                              : formatBalance(enhancedOverviewData?.positionValue ?? '--', {
                                  showCurrency: true,
                                  roundMode: 'floor',
                                })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[12px] leading-3 text-[#908E98]">{t('assets.futures.leverage')}</span>
                          <span className="text-[12px] leading-3 font-medium text-[#00FFB4]">
                            {hideBalance
                              ? '*****'
                              : enhancedOverviewData?.crossAccountLeverage !== undefined &&
                                  enhancedOverviewData?.crossAccountLeverage !== null
                                ? `${enhancedOverviewData.crossAccountLeverage.toFixed(2)}X`
                                : '--'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[12px] leading-3 text-[#908E98]">
                            {t('assets.futures.crossMarginRatio')}
                          </span>
                          <span className="text-[12px] leading-3 font-medium text-[#D9D9D9]">
                            {formatPercent(enhancedOverviewData?.crossMarginRatio)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[12px] leading-3 text-[#908E98]">
                            {t('assets.futures.maintenanceMargin')}
                          </span>
                          <span className="text-[12px] leading-3 font-medium text-[#D9D9D9]">
                            {hideBalance
                              ? '*****'
                              : formatBalance(Math.abs(enhancedOverviewData?.maintenanceMargin), {
                                  showCurrency: true,
                                  roundMode: 'floor',
                                })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3.75">
                  {enhancedPositions.length === 0 && !isLoading && (
                    <div className={cn('flex h-[calc(100vh-520px)] flex-col items-center justify-center gap-2')}>
                      <IconEmpty />
                      <span className="max-w-[320px] text-center text-[0.75rem] text-[#FFFFFF80]">
                        {t('history.nodata')}
                      </span>
                    </div>
                  )}
                  {enhancedPositions.length > 0 && (
                    <div className="space-y-2">
                      {enhancedPositions.map((position: any, index: number) => (
                        <div
                          className="relative cursor-pointer overflow-hidden rounded-[20px]"
                          key={index}
                          onClick={() => {
                            navigate(`/futures/${position?.positionInfo.coin}?tab=position`)
                          }}
                        >
                          <img
                            className="absolute inset-0 h-[76px] w-[76px] object-cover blur-3xl"
                            src={`https://cdn.xbit.com/coins/${position?.positionInfo.coin}.svg`}
                            alt=""
                          />
                          <div className="flex cursor-pointer items-center justify-between rounded-[20px] bg-[#17171B] p-3.75">
                            <div className="flex items-center gap-3.5">
                              <LogoWithChain
                                logo={`https://cdn.xbit.com/coins/${position?.positionInfo.coin}.svg`}
                                logoClassName="size-11"
                                name={position?.positionInfo.coin}
                              />
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <div className="semi-bold text-[16px] leading-4">{position?.positionInfo.coin}</div>
                                  <div className="rounded-xs border border-[#2F2A4680] bg-linear-to-r from-[#FFFFFF05] to-[#FFFFFF0A] px-1 py-0.5 text-[10px] leading-2.5 text-[#CACACA] transition-colors">
                                    {position?.positionInfo.leverage.value}X
                                  </div>
                                </div>
                                <span
                                  className={cn(
                                    'rounded-[3px] px-1 py-0.5 text-center text-[12px] leading-3 font-medium',
                                    position?.positionInfo.side === 'B'
                                      ? 'bg-rise/20 text-rise'
                                      : 'bg-fall/20 text-fall',
                                  )}
                                >
                                  {position?.positionInfo.side === 'B'
                                    ? t('futuresDetails.common.long')
                                    : t('futuresDetails.common.short')}
                                </span>
                              </div>
                            </div>
                            <div
                              className={cn(
                                'space-y-2 text-right',
                                position?.unrealizedPnl > 0 ? 'text-rise' : '',
                                position?.unrealizedPnl < 0 ? 'text-fall' : '',
                                position?.unrealizedPnl === 0 ? 'text-white' : '',
                              )}
                            >
                              <div className="text-[16px] leading-4 font-medium">
                                {hideBalance
                                  ? '*****'
                                  : formatBalance(position?.positionInfo.unrealizedPnl, {
                                      showSign: true,
                                      showCurrency: true,
                                      roundMode: 'floor',
                                    })}
                              </div>
                              <div className="text-[14px] leading-3.5 font-light">
                                {formatPercent(position?.positionInfo?.returnOnEquity * 100, {
                                  showSign: true,
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <SelectHistory
          open={openSelectHistory}
          setOpen={setOpenSelectHistory}
          onSelected={(type: string) => {
            if (type === 'assetHistory') {
              navigate(APP_PATH.ASSET_HISTORY + '?page=perps')
            } else if (type === 'tradeHistory') {
              navigate(APP_PATH.TRADE_HISTORY + '?page=perps')
            }
          }}
        />
      </div>
    </ToastProvider>
  )
}

export default Futures
