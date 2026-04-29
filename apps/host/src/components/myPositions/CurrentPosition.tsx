import { TokenDetail } from '@/@generated/gql/graphql-future'
import Loader from '@/components/common/Loader'
import { useNewTokenPrice } from '@/hooks/useTokenPrice'
import { formatAmount, formatBalance, formatPercent, formatPrice, formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { priceChain } from '@/redux/modules/price.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { PortfolioDTO } from '@/types/holding.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import IconArrowSwap from '@components/icon/stroke/IconArrowSwap.tsx'
import IconFund from '@components/icon/stroke/IconFund.tsx'
import { IconInfo } from '@components/icon/stroke/iconInfo.tsx'
import useHoldingSubscription from '@components/mqtt/HoldingSubscription.ts'
import ButtonShare from '@components/myPositions/ButtonShare.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNativeTokenNameByChain } from '@/hooks/useNativeTokenNameByChain'
import { getDataUnitByChain } from '@/lib/currency'
import { setUnitCurrentPosition, updaShadowHolding, updateHolding } from '@/redux/modules/holding.slice'
import Decimal from 'decimal.js'
import { mapWalletTokenDataToPortfolio } from '@/utils/mappingType'
import useWatchWalletTokenBalance from '@/hooks/useWatchWalletTokenBalance'
import { useParams } from 'react-router-dom'
Decimal.set({ precision: 100 })

type Props = {
  porfolio: PortfolioDTO
  isProcessing?: boolean
  fallBackPrice?: number
  tokenData: TokenDetail
  loadingCurrent: boolean
}

const handleTextColor = (value: string | number) => {
  if (value === '--' || value === '0' || value === '0.00' || !isFinite(+value) || value === 0) {
    return 'text-[#FFFFFFB2]'
  } else if (+value > 0) {
    return 'text-rise'
  } else {
    return 'text-fall'
  }
}

const CurrentPosition = ({ porfolio, isProcessing, fallBackPrice, tokenData, loadingCurrent }: Props) => {
  const { t } = useTranslation()
  const [portfolioData, setPortfolioData] = useState<PortfolioDTO>(porfolio)
  const activeWallet = useSelector(_activeWallet)
  const chain = useAppSelector((state) => state.newWallet.activeChain)
  const priceNativeToken = useAppSelector(priceChain(chain))
  const userAddress = activeWallet?.walletAddress
  // const newPortfolio = useHoldingSubscription(userAddress, tokenAddress, activeWallet?.chainId || ChainIds.Solana)
  const priceMqtt = useNewTokenPrice(portfolioData?.token, portfolioData?.chainId)
  const { unitCurrentPosition: unit } = useAppSelector((state: RootState) => state.holding)
  const nativeToken = useNativeTokenNameByChain()
  const dispatch = useAppDispatch()
  const { address: currentAddress } = useParams()

  useEffect(() => {
    if (unit !== 'USD' && unit !== getDataUnitByChain(chain)) {
      dispatch(setUnitCurrentPosition(getDataUnitByChain(chain)))
    }
  }, [chain, unit])

  const price = portfolioData?.token && priceMqtt && +priceMqtt > 0 ? priceMqtt : fallBackPrice
  useEffect(() => {
    setPortfolioData(porfolio)
  }, [porfolio])

  // useEffect(() => {
  //   if (!newPortfolio || !newPortfolio?.token) return
  //   setPortfolioData((prev: any) => {
  //     return {
  //       ...prev,
  //       avgPriceUsd: newPortfolio?.avgPriceUsd ?? prev?.avgPriceUsd,
  //       realizedPnL: newPortfolio?.realizedPnL ?? prev?.realizedPnL,
  //       totalBuyQty: newPortfolio?.totalBuyQty ?? prev?.totalBuyQty,
  //       totalBuyUsd: newPortfolio?.totalBuyUsd ?? prev?.totalBuyUsd,
  //       totalSellUsd: newPortfolio?.totalSellUsd ?? prev?.totalSellUsd,
  //       totalSellQty: newPortfolio?.totalSellQty ?? prev?.totalSellQty,
  //       totalFee: newPortfolio?.totalFee ?? prev?.totalFee,
  //       totalFeeUsd: newPortfolio?.totalFeeUsd ?? prev?.totalFeeUsd,
  //       totalBaseAmount: newPortfolio?.balance ?? prev?.totalBaseAmount,
  //     }
  //   })
  // }, [newPortfolio])

  // const totalBaseEstimate = portfolioData?.estimateOrderValue
  //   ? Number(portfolioData?.totalBaseAmount) + Number(portfolioData?.estimateOrderValue)
  //   : Number(portfolioData?.totalBaseAmount)
  const totalBaseEstimate = portfolioData?.estimateOrderValue
    ? // ? Number(item?.totalBaseAmount) + Number(item?.estimateOrderValue)
      new Decimal(portfolioData?.totalBaseAmount || 0).add(portfolioData?.estimateOrderValue || 0).toString()
    : new Decimal(portfolioData?.totalBaseAmount || 0).toString()
  const totalBase = +totalBaseEstimate >= 0 ? totalBaseEstimate : 0

  const balance = portfolioData?.isSellAll ? 0 : +totalBase
  const realized = portfolioData?.realizedPnL ? Number(portfolioData?.realizedPnL) : 0
  const unrealized =
    +portfolioData?.avgPriceUsd === 0 && +portfolioData?.totalBuyQty === 0
      ? 0
      : balance > 0
        ? (Number(price) - Number(portfolioData?.avgPriceUsd)) * balance
        : 0
  const holdingValue = +totalBase * Number(price)
  const costPrice = !portfolioData?.avgPriceUsd || !portfolioData?.totalBuyUsd ? '--' : portfolioData?.avgPriceUsd
  const avgMC = portfolioData?.avgMarketCap
  const PnL =
    +portfolioData?.avgPriceUsd === 0 && +portfolioData?.totalBuyQty === 0
      ? 0
      : !portfolioData?.avgPriceUsd || !portfolioData?.totalBuyUsd
        ? '--'
        : Number(realized) + Number(unrealized)
  const returnRateValue = ((Number(realized) + Number(unrealized)) * 100) / portfolioData?.totalBuyUsd
  const returnRateRealized = +portfolioData?.totalBuyUsd ? (Number(realized) * 100) / portfolioData?.totalBuyUsd : 0
  const returnRateUnrealized = +portfolioData?.totalBuyUsd ? (Number(unrealized) * 100) / portfolioData?.totalBuyUsd : 0
  const returnRate =
    !+portfolioData?.avgPriceUsd || !+portfolioData?.totalBuyUsd || !price || price === 0
      ? 0
      : ((Number(realized) + Number(unrealized)) * 100) / portfolioData?.totalBuyUsd
  const circulatingSupply = tokenData?.circulatingSupply
  const totalBuyUsd = portfolioData?.totalBuyUsd || 0
  const totalBuyQty = portfolioData?.totalBuyQty || 0
  const avgBuyPrice = +totalBuyQty && totalBuyQty !== 0 ? totalBuyUsd / totalBuyQty : 0
  const avgBuyMC = avgBuyPrice * circulatingSupply
  // const avgBuyPrice = portfolioData?.avgPriceUsd
  // const avgBuyMC = portfolioData?.avgMarketCap
  const totalSellUsd = portfolioData?.totalSellUsd || 0
  const totalSellQty = portfolioData?.totalSellQty
  const avgSellPrice = +totalSellQty && totalSellQty !== 0 ? totalSellUsd / totalSellQty : 0
  const avgSellMC = avgSellPrice * circulatingSupply
  const totalFee = portfolioData?.totalFee || 0
  const totalFeeUsd = portfolioData?.totalFeeUsd || 0
  const isLoading = useMemo(() => {
    return !price || price === 0 || isProcessing
  }, [price, isProcessing])

  // const [unit, setUnit] = useState<'USD' | 'SOL' | 'BNB'>(nativeUnit)
  const [showBuyAvgMC, setShowBuyAvgMC] = useState(false)
  const [showSellAvgMC, setShowSellAvgMC] = useState(false)
  const ChainIcon = () => <img src={getBlockchainLogo2(portfolioData?.chainId)} alt="" className="w-3 h-3" />

  const handleOnClickChangeCurrency = () => {
    if (unit === 'USD') {
      dispatch(setUnitCurrentPosition(getDataUnitByChain(chain)))
    } else {
      dispatch(setUnitCurrentPosition('USD'))
    }
  }

  const newPortfolio = useHoldingSubscription(userAddress, portfolioData?.token, activeWallet?.chainId)

  useEffect(() => {
    if (!newPortfolio) return
    const newItem = mapWalletTokenDataToPortfolio(newPortfolio)
    if (!newItem?.token) return
    if (portfolioData?.isShadow) {
      const holdingShadow: PortfolioDTO = {
        ...newItem,
        symbol: portfolioData?.symbol,
        logoUrl: portfolioData?.logoUrl,
        lastTxTime: portfolioData?.lastTxTime,
        price: portfolioData?.price,
        totalBaseAmount: portfolioData?.totalBaseAmount,
        userAddress: userAddress,
        completedTxs: newPortfolio.completedTxs,
      }
      dispatch(
        updaShadowHolding({
          tokenAddress: portfolioData?.token,
          updates: holdingShadow,
        }),
      )
      return
    }
    dispatch(
      updateHolding({
        tokenAddress: portfolioData?.token,
        updates: {
          avgMarketCap: newPortfolio.avgMarketCap,
          avgPriceUsd: newPortfolio.avgPriceUsd,
          totalBuyUsd: newPortfolio.totalBuyUsd,
          totalBuyQty: newPortfolio.totalBuyQty,
          totalSellUsd: newPortfolio.totalSellUsd,
          totalSellQty: newPortfolio.totalSellQty,
          realizedPnL: newPortfolio.realizedPnL,
          totalFeeUsd: newPortfolio.totalFeeUsd,
          totalFee: newPortfolio.totalFee,
          completedTxs: newPortfolio.completedTxs,
        },
      }),
    )
  }, [newPortfolio, dispatch])

  const msg = useWatchWalletTokenBalance({
    address: userAddress,
    token: portfolioData?.token,
    chainId: activeWallet?.chainId,
  })

  useEffect(() => {
    if (!msg?.token || !msg?.balance) return
    console.log('msg', msg)
    if (portfolioData?.isShadow) {
      dispatch(
        updaShadowHolding({
          tokenAddress: portfolioData?.token,
          updates: {
            totalBaseAmount: msg.balance,
            isLastUpdated: true,
            relatedTxHashes: msg.relatedTxHashes,
          },
        }),
      )
      return
    }
    dispatch(
      updateHolding({
        tokenAddress: portfolioData?.token,
        updates: {
          totalBaseAmount: msg.balance,
          isLastUpdated: true,
          relatedTxHashes: msg.relatedTxHashes,
        },
      }),
    )
  }, [msg, dispatch])

  if (!loadingCurrent && !porfolio?.token) return null

  return (
    <div className="px-4 my-3 leading-none">
      <div className={cn('px-3 py-4 bg-[#181720] rounded-[8px]', { 'opacity-70': porfolio?.token !== currentAddress })}>
        <div className="font-[330] text-[15px] text-[#FCFCFC]">
          {tokenData?.symbol} {t('detail.holdings.pnl')}
        </div>
        <div className="mt-3 flex items-start justify-between">
          <div className="space-y-2">
            <div className="font-[330] text-[13px] text-[#645F7B] flex items-center gap-1">
              <span>
                {tokenData?.symbol} {t('detail.holdings.balance')}
              </span>
              <div
                className="flex items-center gap-1 cursor-pointer transition-all duration-100 hover:text-[#B9B9B9]"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOnClickChangeCurrency()
                  // setUnit(unit === 'USD' ? nativeUnit : 'USD')
                }}
              >
                <span>{unit === 'USD' ? 'USD' : nativeToken}</span>
                <IconFund className="size-[14px]" />
              </div>
            </div>
            <div className="flex items-center gap-1 font-[380] text-[15px] text-white">
              {unit === 'USD' ? (
                !price || price === 0 ? (
                  <Loader />
                ) : (
                  formatBalance(holdingValue, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })
                )
              ) : (
                <div className="flex items-center gap-1">
                  <ChainIcon />
                  {!price || price === 0 ? (
                    <Loader />
                  ) : (
                    formatAmount(holdingValue / priceNativeToken, {
                      roundMode: 'floor',
                    })
                  )}
                </div>
              )}
              {isLoading && <Loader />}
            </div>
            <div className="flex items-center gap-1 mt-1.5 font-[380] text-[13px] text-[#645F7B]">
              {!price || price === 0 ? (
                <Loader />
              ) : (
                totalBase &&
                formatAmount(totalBase, {
                  roundMode: 'floor',
                })
              )}
              {isLoading && <Loader />}
            </div>
          </div>
          <div className="h-13 w-[1px] bg-[#ECECED1F]" />
          <div className="space-y-2">
            <div className="font-[330] text-[13px] text-[#645F7B]">{t('detail.myPositions.profitAndLoss')}</div>
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  'font-[380] text-[15px]',
                  Number(Number(realized) + Number(unrealized)) === 0 || isLoading
                    ? 'text-[#FFFFFFB2]'
                    : Number(Number(realized) + Number(unrealized)) > 0
                      ? 'text-rise'
                      : 'text-fall',
                )}
              >
                <div className="flex items-center gap-1">
                  {unit === 'USD' ? (
                    <>
                      {PnL == '--'
                        ? 0
                        : formatBalance(PnL, {
                            showCurrency: true,
                            roundMode: 'floor',
                          })}
                      {isLoading && <Loader />}
                    </>
                  ) : (
                    <>
                      <ChainIcon />
                      {PnL !== '--' &&
                        formatBalance(typeof PnL === 'number' ? PnL / (priceNativeToken || 1) : null, {
                          roundMode: 'floor',
                        })}
                      {isLoading && <Loader />}
                    </>
                  )}
                </div>
              </div>
              <ButtonShare
                showTitle={false}
                costPrice={costPrice}
                returnRate={portfolioData?.avgPriceUsd && portfolioData?.totalBuyUsd ? returnRate : '--'}
                tokenName={portfolioData?.symbol ?? ''}
                tokenAvatar={portfolioData?.avatarUrl ? portfolioData?.avatarUrl : portfolioData?.logoUrl ?? ''}
                tokenLatestPrice={price ?? ''}
                tokenAddress={portfolioData?.token ?? ''}
                avgMC={avgMC}
                holdingValue={holdingValue}
                holdingQuantity={portfolioData?.totalBaseAmount ?? 0}
                PnL={portfolioData?.avgPriceUsd ? PnL : '--'}
                realized={portfolioData?.realizedPnL ? realized : '--'}
                unrealized={portfolioData?.avgPriceUsd ? unrealized : '--'}
                chainId={portfolioData?.chainId}
                totalBuy={portfolioData?.totalBuyUsd ?? '--'}
              />
            </div>
            <div
              className={cn(
                'flex items-center gap-1 mt-1.5 font-[380] text-[13px]',
                Number(Number(realized) + Number(unrealized)) === 0 || isLoading
                  ? 'text-[#FFFFFFB2]'
                  : Number(Number(realized) + Number(unrealized)) > 0
                    ? 'text-rise/80'
                    : 'text-fall/80',
              )}
            >
              {formatPercent(returnRate, {
                showSign: true,
              })}
              {isLoading && <Loader />}
            </div>
          </div>
          <div className="h-13 w-[1px] bg-[#ECECED1F]" />
          <div className="space-y-2">
            <div className="font-[330] text-[13px] text-[#645F7B]">{t('detail.holdings.unrealizedPnl')}</div>

            <div className={cn(handleTextColor(portfolioData?.avgPriceUsd && unrealized !== 0 ? unrealized : '--'))}>
              <div className="flex items-center gap-1">
                {unit === 'USD' ? (
                  <>
                    {unrealized === 0 || Number.isNaN(unrealized)
                      ? 0
                      : formatBalance(unrealized, {
                          showCurrency: true,
                          roundMode: 'floor',
                        })}
                    {isLoading && <Loader />}
                  </>
                ) : (
                  <>
                    <ChainIcon />
                    {portfolioData?.avgPriceUsd &&
                      portfolioData?.totalBuyUsd &&
                      formatBalance(unrealized / priceNativeToken, {
                        roundMode: 'floor',
                      })}
                    {isLoading && <Loader />}
                  </>
                )}
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 mt-1.5 font-[380] text-[13px]',
                  Number(unrealized) === 0 || Number.isNaN(unrealized)
                    ? 'text-[#FFFFFFB2]'
                    : Number(unrealized) > 0
                      ? 'text-rise/80'
                      : 'text-fall/80',
                )}
              >
                {formatPercent(returnRateUnrealized, {
                  showSign: true,
                })}
                {isLoading && <Loader />}
              </div>
            </div>
          </div>
          <div className="h-13 w-[1px] bg-[#ECECED1F]" />
          <div className="space-y-2">
            <div className="font-[330] text-[13px] text-[#645F7B]">{t('detail.holdings.realizedPnl')}</div>
            <div
              className={cn(
                Number(realized) === 0 ? 'text-[#FFFFFFB2]' : Number(realized) > 0 ? 'text-rise' : 'text-fall',
              )}
            >
              <div className="flex items-center gap-1">
                {unit === 'USD' ? (
                  <>
                    {formatBalance(realized, {
                      showCurrency: true,
                      roundMode: 'floor',
                    })}
                    {isLoading && <Loader />}
                  </>
                ) : (
                  <>
                    <ChainIcon />
                    {formatAmount(realized / (priceNativeToken || 1), {
                      roundMode: 'floor',
                    })}
                    {isLoading && <Loader />}
                  </>
                )}
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 mt-1.5 font-[380] text-[13px]',
                  Number(realized) === 0 ? 'text-[#FFFFFFB2]' : Number(realized) > 0 ? 'text-rise/80' : 'text-fall/80',
                )}
              >
                {returnRateRealized &&
                  formatPercent(returnRateRealized, {
                    showSign: true,
                  })}
                {isLoading && <Loader />}
              </div>
            </div>
          </div>
          <div className="h-13 w-[1px] bg-[#ECECED1F]" />
          <div className="space-y-2">
            <div className="flex items-center gap-0 font-[330] text-[13px] text-[#645F7B]">
              <span className="">{t('detail.holdings.totalBuy')}/</span>
              <span
                className="flex items-center gap-1 hover:text-[#B9B9B9] cursor-pointer"
                onClick={() => setShowBuyAvgMC(!showBuyAvgMC)}
              >
                {showBuyAvgMC ? t('detail.myPositions.avgBuyInMarketValue') : t('walletDetail.holderTable.avgBuyPrice')}
                <IconArrowSwap className="size-3" />
              </span>
            </div>
            <div className="flex items-center gap-1 font-[380] text-[15px] text-white">
              {unit === 'USD' ? (
                <>
                  {formatBalance(totalBuyUsd, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })}
                  {isLoading && <Loader />}
                </>
              ) : (
                <>
                  <ChainIcon />
                  {formatAmount(totalBuyUsd / (priceNativeToken || 1), {
                    roundMode: 'floor',
                  })}
                  {isLoading && <Loader />}
                </>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1.5 font-[380] text-[13px] text-[#645F7B]">
              {showBuyAvgMC ? (
                unit === 'USD' ? (
                  <>
                    {formatVolume(avgBuyMC, {
                      showCurrency: true,
                    })}
                    {isLoading && <Loader />}
                  </>
                ) : (
                  <>
                    <ChainIcon /> {formatAmount(avgBuyMC / (priceNativeToken || 1))}
                    {isLoading && <Loader />}
                  </>
                )
              ) : unit === 'USD' ? (
                <>
                  {formatPrice(avgBuyPrice, {
                    showCurrency: true,
                    roundMode: 'ceil',
                  })}
                  {isLoading && <Loader />}
                </>
              ) : (
                <>
                  <ChainIcon />
                  {formatAmount(avgBuyPrice / (priceNativeToken || 1))} {isLoading && <Loader />}
                </>
              )}
            </div>
          </div>
          <div className="h-13 w-[1px] bg-[#ECECED1F]" />
          <div className="space-y-2">
            <div className="flex items-center gap-0 font-[330] text-[13px] text-[#645F7B]">
              <span className="">{t('detail.holdings.totalSell')}/</span>
              <span
                className="flex items-center gap-1 hover:text-[#B9B9B9] cursor-pointer"
                onClick={() => setShowSellAvgMC(!showSellAvgMC)}
              >
                {showSellAvgMC
                  ? t('detail.myPositions.avgBuyInMarketValue')
                  : t('walletDetail.holderTable.avgSellPrice')}
                <IconArrowSwap className="size-3" />
              </span>
            </div>
            <div className="flex items-center gap-1 font-[380] text-[15px] text-white">
              {unit === 'USD' ? (
                <>
                  {formatBalance(totalSellUsd, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })}{' '}
                  {isLoading && <Loader />}
                </>
              ) : (
                <>
                  <ChainIcon />
                  {formatAmount(totalSellUsd / (priceNativeToken || 1), {
                    roundMode: 'floor',
                  })}
                  {isLoading && <Loader />}
                </>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1.5 font-[380] text-[13px] text-[#645F7B]">
              {showSellAvgMC ? (
                unit === 'USD' ? (
                  <>
                    {formatVolume(avgSellMC, {
                      showCurrency: true,
                    })}
                    {isLoading && <Loader />}
                  </>
                ) : (
                  <>
                    <ChainIcon />
                    {formatAmount(avgSellMC / (priceNativeToken || 1))}
                    {isLoading && <Loader />}
                  </>
                )
              ) : unit === 'USD' ? (
                <>
                  {formatPrice(avgSellPrice, {
                    showCurrency: true,
                    roundMode: 'ceil',
                  })}
                  {isLoading && <Loader />}
                </>
              ) : (
                <>
                  <ChainIcon />
                  {formatAmount(avgSellPrice / (priceNativeToken || 1))}
                  {isLoading && <Loader />}
                </>
              )}
            </div>
          </div>
          <div className="h-13 w-[1px] bg-[#ECECED1F]" />
          <div className="space-y-2">
            <div className="text-[#645F7B] hover:text-[#B9B9B9]">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger className="mr-auto ml-[-5px] flex items-center gap-1 ">
                    <div className="flex items-center gap-1 ">
                      <span className="font-[330] text-[13px]  ">{t('detail.holdings.totalFees')}</span>
                      <IconInfo className="size-[14px] " />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[360px] bg-[#191919]">
                    <span className="text-[11px] tracking-wide">{t('detail.header.totalFeesTooltip')}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-1 font-[380] text-[15px] text-white">
              {unit === 'USD' ? (
                <>
                  {formatBalance(totalFeeUsd, {
                    showCurrency: true,
                    roundMode: 'ceil',
                  })}
                  {isLoading && <Loader />}
                </>
              ) : (
                <>
                  <ChainIcon />
                  {formatBalance(totalFee, {
                    roundMode: 'ceil',
                  })}
                  {isLoading && <Loader />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrentPosition
