import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { cn, getPath } from '@/lib/utils.ts'
import ButtonShare from '@components/myPositions/ButtonShare.tsx'
import SellAllButton from '@components/myPositions/SellAllButton.tsx'
import TrailingCommandButton from '@components/myPositions/TrailingCommandButton.tsx'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import { useNewTokenPrice } from '@hooks/useTokenPrice.ts'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PortfolioDTO } from '@/types/holding.ts'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { formatAmount, formatBalance, formatPercent, formatPrice } from '@/lib/format'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import IconFund from '@components/icon/stroke/IconFund.tsx'
import IconFundSol from '@components/icon/stroke/IconFundSol.tsx'
import { priceChain } from '@/redux/modules/price.slice.ts'
import { useActiveChain } from '@/hooks/useActiveChain'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'
import { ChainIds } from '@/types/enums'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { useSelector } from 'react-redux'
import useHoldingSubscription from '../mqtt/HoldingSubscription'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { mapWalletTokenDataToPortfolio } from '@/utils/mappingType'
import { setDataCurrentToken, updaShadowHolding, updateHolding } from '@/redux/modules/holding.slice'
import useWatchWalletTokenBalance from '@/hooks/useWatchWalletTokenBalance'
import { setDataUnit, UserSettingsState } from '@/redux/modules/userSettings.slice'
import { getDataUnitByChain } from '@/lib/currency'
import { gqlClient } from '@/lib/gql/apollo-client'
import { getPortfolio } from '@/services/tokens.service'
import { PortfolioResponse } from '@/types/responses'
import { ResponsiveTooltipDrawer } from '@components/common/ResponsiveTooltipDrawer'

type LabelPercentageProps = {
  value: string | number
  loading?: boolean
}
type MyPositionsCardProps = {
  item: PortfolioDTO
  isProcessing?: boolean
  fallBackPrice?: number
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

export const LabelPercentage = ({ value, loading }: LabelPercentageProps) => {
  if (loading)
    return (
      <div className="flex items-center justify-center mt-0.5">
        <Loader />
      </div>
    )
  return (
    <div className={cn('px-2 py-1 rounded bg-[#AB57FF1A]', handleTextColor(value))}>
      {formatPercent(value, {
        showSign: true,
      })}
    </div>
  )
}

const MyPositionsCard = ({ item, isProcessing, fallBackPrice }: MyPositionsCardProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activeChain = useActiveChain()
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const dispatch = useAppDispatch()
  const { dataUnit: unit } = useAppSelector((state: RootState) => state.userSettings as unknown as UserSettingsState)
  const symbol = item?.symbol || '--'
  const { logo: logoUrl } = useTokenInfo(item?.token, item?.chainId)
  const priceMqtt = useNewTokenPrice(item?.token, item?.chainId)
  const price = priceMqtt && Number(priceMqtt) > 0 ? Number(priceMqtt) : Number(fallBackPrice)
  const totalBaseEstimate = item?.estimateOrderValue
    ? new Decimal(item?.totalBaseAmount).add(item?.estimateOrderValue).toString()
    : new Decimal(item?.totalBaseAmount).toString()
  const totalBase = +totalBaseEstimate >= 0 ? totalBaseEstimate : 0
  const balance = item?.isSellAll ? 0 : totalBase
  const realized = item?.realizedPnL ? Number(item?.realizedPnL) : 0
  const unrealized =
    +item?.avgPriceUsd === 0 && +item?.totalBuyQty === 0
      ? 0
      : +balance > 0
        ? (Number(price) - Number(item?.avgPriceUsd)) * +balance
        : 0
  const holdingValue = +balance * Number(price)
  const costPrice = !item?.avgPriceUsd || !item?.totalBuyUsd ? 0 : item?.avgPriceUsd
  const avgMC = item?.avgMarketCap
  const PnL =
    +item?.avgPriceUsd === 0 && +item?.totalBuyQty === 0
      ? 0
      : !item?.avgPriceUsd || !item?.totalBuyUsd
        ? '--'
        : Number(realized) + Number(unrealized)
  const showPnl = unit === 'USD' ? (PnL !== '--' ? PnL : '--') : PnL !== '--' ? +PnL / priceNativeToken : '--'
  const returnRate =
    !+item?.avgPriceUsd || !+item?.totalBuyUsd || !price || price === 0
      ? 0
      : ((Number(realized) + Number(unrealized)) * 100) / item?.totalBuyUsd
  const isXStock = item?.isXStock ?? false
  const totalBuyUsd = item?.totalBuyUsd || 0
  const totalBuyQty = item?.totalBuyQty || 0
  const totalSellUsd = item?.totalSellUsd || 0
  const totalSellQty = item?.totalSellQty || 0
  const isSoldOut =
    (item?.totalBaseAmount == 0 || item?.totalBaseAmount === null) && totalSellQty > 0 && !item?.isProcessing
  const lastTxTime = item?.balanceUpdatedTime && item?.balanceUpdatedTime > 0
      // ? dayjs(item?.balanceUpdatedTime * 1000).format('YYYY-MM-DD HH:mm:ss')
      ? item?.balanceUpdatedTime * 1000
      : item?.lastTxTime
      ? item?.lastTxTime
      : ''

  const handleClickLogo = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (!item) return
    navigate(
      getPath(isXStock ? APP_PATH.X_STOCK_DETAIL : APP_PATH.MEME_TOKEN_DETAIL, {
        address: item.token,
        chain: CHAIN_SYMBOLS[+item.chainId],
      }),
      {
        state: { symbol: item.symbol },
      },
    )
  }

  const isLoading = useMemo(() => {
    return !price || price === 0 || item?.isProcessing
  }, [price, item?.isProcessing])

  const activeWallet = useSelector(_activeWallet)
  const userAddress = activeWallet?.walletAddress
  const newPortfolio = useHoldingSubscription(userAddress, item?.token, activeWallet?.chainId)

  useEffect(() => {
    if (!newPortfolio) return
    const newItem = mapWalletTokenDataToPortfolio(newPortfolio)
    if (!newItem?.token) return
    if (item?.isShadow) {
      const holdingShadow: PortfolioDTO = {
        ...newItem,
        symbol: item?.symbol,
        logoUrl: item?.logoUrl,
        lastTxTime: item?.lastTxTime,
        price: item?.price,
        totalBaseAmount: item?.totalBaseAmount,
        userAddress: userAddress,
        completedTxs: newPortfolio.completedTxs,
      }
      dispatch(
        updaShadowHolding({
          tokenAddress: item?.token,
          updates: holdingShadow,
        }),
      )
      return
    }
    dispatch(
      updateHolding({
        tokenAddress: item?.token,
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
    token: item?.token,
    chainId: activeWallet?.chainId,
  })

  useEffect(() => {
    if (!msg?.token || !msg?.balance) return
    if (item?.isShadow) {
      dispatch(
        updaShadowHolding({
          tokenAddress: item?.token,
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
        tokenAddress: item?.token,
        updates: {
          totalBaseAmount: msg.balance,
          isLastUpdated: true,
          relatedTxHashes: msg.relatedTxHashes,
        },
      }),
    )
  }, [msg, dispatch])

  const queryGetCurrentPortfolio = useCallback(async () => {
    try {
      if (!userAddress) return

      const { data: res } = await gqlClient.query<PortfolioResponse>({
        query: getPortfolio,
        variables: {
          input: {
            chainId: activeWallet?.chainId,
            userAddress: userAddress,
            hideSmallLiquidity: false,
            hideModestBalance: false,
            hideZeroBalance: false,
            token: item?.token,
            tag: isXStock ? 'XStock' : 'meme',
          },
        },
        fetchPolicy: 'no-cache',
      })

      const fetched = res?.getPortfolio?.data ?? []
      dispatch(setDataCurrentToken(fetched?.[0]))
    } catch (err) {
      console.error(err)
    }
  }, [userAddress, gqlClient, activeWallet?.chainId, item?.token, isXStock, dispatch])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (item?.isProcessing) {
      timer = setTimeout(() => {
        queryGetCurrentPortfolio()
      }, 30000)
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [item?.isProcessing, queryGetCurrentPortfolio])

  const ChainIcon = () => <img src={getBlockchainLogo2(item?.chainId)} alt="" className="size-4 min-w-4 rounded-full" />
  const TokenIcon = () => (
    <LogoWithChain logo={logoUrl} logoClassName="size-4 min-w-4 rounded-full" name={item?.symbol} />
  )

  return (
    <>
      <div className="relative rounded-[10px] bg-[#18181D] p-2.5 border-[0.5px] border-[#25242B] hover:bg-[#ECECED14] transition-colors duration-200">
        <div className="flex justify-between items-center">
          <div className="flex justify-center items-center gap-2">
            <LogoWithChain
              logo={logoUrl}
              logoClassName="w-[28px] h-[28px]"
              name={item?.symbol}
              chainLogo={getBlockchainLogo2(item.chainId)}
            />
            <div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className="font-[380] text-[14px] leading-none text-white cursor-pointer"
                    onClick={handleClickLogo}
                  >
                    {symbol}
                  </div>
                  {isXStock && <IconXStock />}
                </div>
                {isSoldOut && (
                  <span className="bg-[#00FFB41A] rounded-[4px] px-1 py-0.5 text-[12px] text-[#00FFB4] font-[330]">
                    {t('assets.funding.soldOut')}
                  </span>
                )}
                <ButtonShare
                  costPrice={costPrice}
                  returnRate={item?.avgPriceUsd && item?.totalBuyUsd ? returnRate : '--'}
                  tokenName={symbol ?? ''}
                  tokenAvatar={item.avatarUrl ? item.avatarUrl : logoUrl ?? ''}
                  tokenLatestPrice={price ?? ''}
                  tokenAddress={item?.token ?? ''}
                  avgMC={avgMC}
                  holdingValue={holdingValue}
                  holdingQuantity={totalBase ?? 0}
                  PnL={item?.avgPriceUsd ? PnL : '--'}
                  realized={item?.realizedPnL ? realized : '--'}
                  unrealized={item?.avgPriceUsd ? unrealized : '--'}
                  chainId={item?.chainId ?? ChainIds.Solana}
                  disabled={isProcessing}
                  showTitle={false}
                  isXStock={isXStock}
                  totalBuy={item?.totalBuyUsd ?? '--'}
                />
                {+totalBuyUsd === 0 && (
                  <ResponsiveTooltipDrawer
                    content={<p className="text-xs leading-[1.25] text-[#FFFFFFCC]">{t('holding.tooltip.transferToken')}</p>}
                    tooltipClassName="max-w-[360px]"
                  >
                    <img src="/images/orderSetting/icon-info.svg" className="w-[14px] min-w-[14px] cursor-pointer" alt="" />
                  </ResponsiveTooltipDrawer>
                )}
              </div>
              <div className="mt-1 font-[330] text-[11px] leading-none text-white/50">
                {t('assets.funding.lastActive')}: {lastTxTime ? dayjs(lastTxTime).locale('en').fromNow(true) : '--'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className={cn(
                Number(Number(realized) + Number(unrealized)) === 0 || item?.isProcessing
                  ? 'text-[#FFFFFFB2]'
                  : Number(Number(realized) + Number(unrealized)) > 0
                    ? 'text-rise'
                    : 'text-fall',
              )}
            >
              <div className="mt-1 flex items-center justify-end gap-1">
                {/* {unit === 'USD' ? (
                    isLoading ? (
                      <Loader />
                    ) : (
                      formatBalance(showPnl, {
                        showCurrency: true,
                        roundMode: 'floor',
                      })
                    )
                  ) : (
                    <div className="flex items-center gap-1">
                      <ChainIcon />
                      {isLoading ? (
                        <Loader />
                      ) : (
                        formatBalance(showPnl, {
                          roundMode: 'floor',
                        })
                      )}
                    </div>
                  )} */}
                {unit === 'USD' ? (
                  <>
                    {showPnl == '--'
                      ? 0
                      : formatBalance(showPnl, {
                          showCurrency: true,
                          roundMode: 'floor',
                        })}
                    {isLoading && <Loader />}
                  </>
                ) : (
                  <>
                    <ChainIcon />
                    {showPnl == '--'
                      ? 0
                      : formatBalance(showPnl, {
                          roundMode: 'floor',
                        })}
                    {isLoading && <Loader />}
                  </>
                )}
                <span className="flex items-center gap-1 font-[380] text-[13px] leading-none">
                  (
                  {formatPercent(returnRate, {
                    showSign: true,
                  })}
                  ){isLoading && <Loader />}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-0.5">
              <span className="font-[330] text-[11px] leading-none text-white/50">
                {t('detail.myPositions.profitAndLoss')}
              </span>
              <span
                className="cursor-pointer"
                onClick={() => {
                  // setUnit((prev) => (prev === 'USD' ? 'SOL' : 'USD'))
                  if (unit === 'USD') {
                    dispatch(setDataUnit(getDataUnitByChain(activeChain)))
                  } else {
                    dispatch(setDataUnit('USD'))
                  }
                }}
              >
                {unit === 'USD' ? (
                  <IconFund className="size-[14px] min-w-[14px] text-[#B9B9B9]" />
                ) : (
                  <IconFundSol className="size-[14px] min-w-[14px] text-[#B9B9B9]" />
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-[305] text-[12px] text-[#908E98] leading-none">{t('detail.holdings.totalBuy')}</div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1 font-[380] text-[13px] text-rise leading-none">
                {/* {unit === 'USD' ? (
                  isLoading ? (
                    <Loader />
                  ) : (
                    formatBalance(totalBuyUsd, {
                      showCurrency: true,
                      roundMode: 'floor',
                    })
                  )
                ) : (
                  <div className="flex items-center gap-1">
                    <ChainIcon />
                    {isLoading ? (
                      <Loader />
                    ) : (
                      formatAmount(totalBuyUsd / (priceNativeToken || 1), {
                        roundMode: 'floor',
                      })
                    )}
                  </div>
                )} */}
                {unit === 'USD' ? (
                  <>
                    {formatBalance(totalBuyUsd, {
                      showCurrency: true,
                      roundMode: 'floor',
                    })}
                    {isLoading && <Loader />}
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <ChainIcon />
                    {formatAmount(totalBuyUsd / (priceNativeToken || 1), {
                      roundMode: 'floor',
                    })}
                    {isLoading && <Loader />}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 font-[330] text-[11px] text-white leading-none">
                <TokenIcon />
                {/* {isLoading ? (
                  <Loader />
                ) : (
                  formatAmount(totalBuyQty, {
                    roundMode: 'floor',
                  })
                )} */}
                {formatAmount(totalBuyQty, {
                  roundMode: 'floor',
                })}
                {isLoading && <Loader />}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-[305] text-[12px] text-[#908E98] leading-none">{t('detail.holdings.totalSell')}</div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1 font-[380] text-[13px] text-fall leading-none">
                {/* {unit === 'USD' ? (
                  isLoading ? (
                    <Loader />
                  ) : (
                    formatBalance(totalSellUsd, {
                      showCurrency: true,
                      roundMode: 'floor',
                    })
                  )
                ) : (
                  <div className="flex items-center gap-1">
                    <ChainIcon />
                    {isLoading ? (
                      <Loader />
                    ) : (
                      formatAmount(totalSellUsd / (priceNativeToken || 1), {
                        roundMode: 'floor',
                      })
                    )}
                  </div>
                )} */}
                {unit === 'USD' ? (
                  <>
                    {formatBalance(totalSellUsd, {
                      showCurrency: true,
                      roundMode: 'floor',
                    })}
                    {isLoading && <Loader />}
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <ChainIcon />
                    {formatAmount(totalSellUsd / (priceNativeToken || 1), {
                      roundMode: 'floor',
                    })}
                    {isLoading && <Loader />}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 font-[330] text-[11px] text-white leading-none">
                <TokenIcon />
                {/* {isLoading ? (
                  <Loader />
                ) : (
                  formatAmount(totalSellQty, {
                    roundMode: 'floor',
                  })
                )} */}
                {formatAmount(totalSellQty, {
                  roundMode: 'floor',
                })}
                {isLoading && <Loader />}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-[305] text-[12px] text-[#908E98] leading-none">{t('detail.holdings.balance')}</div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1 font-[380] text-[13px] text-white leading-none">
                {/* {unit === 'USD' ? (
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
                      formatAmount(holdingValue / (priceNativeToken || 1), {
                        roundMode: 'floor',
                      })
                    )}
                  </div>
                )} */}
                {unit === 'USD' ? (
                  <>
                    {formatBalance(holdingValue, {
                      showCurrency: true,
                      roundMode: 'floor',
                    })}
                    {isLoading && <Loader />}
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <ChainIcon />
                    {formatAmount(holdingValue / (priceNativeToken || 1), {
                      roundMode: 'floor',
                    })}
                    {isLoading && <Loader />}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 font-[330] text-[11px] text-white leading-none">
                <TokenIcon />
                {/* {!price || price === 0 ? (
                  <Loader />
                ) : (
                  formatAmount(totalBase, {
                    roundMode: 'floor',
                  })
                )} */}
                {formatAmount(totalBase, {
                  roundMode: 'floor',
                })}
                {isLoading && <Loader />}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-[305] text-[12px] text-[#908E98] leading-none">
              {t('detail.myPositions.costPrice')}
            </div>
            <div className="flex items-center gap-1 font-[380] text-[14px] text-white leading-none">
              {unit === 'USD' ? (
                <>
                  {formatPrice(costPrice, {
                    roundMode: 'ceil',
                    showCurrency: true,
                  })}
                  {isLoading && <Loader />}
                </>
              ) : (
                // isLoading ? (
                //   <Loader />
                // ) : (
                //   formatPrice(costPrice, {
                //     roundMode: 'ceil',
                //     showCurrency: true,
                //   })
                // )
                <div className="flex items-center gap-1">
                  <ChainIcon />
                  {/* {isLoading ? (
                    <Loader />
                  ) : (
                    formatAmount(costPrice / (priceNativeToken || 1), {
                      roundMode: 'ceil',
                    })
                  )} */}
                  {formatAmount(costPrice / (priceNativeToken || 1), {
                    roundMode: 'ceil',
                  })}
                  {isLoading && <Loader />}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t-[0.5px] border-[#25242B] pt-3">
          <SellAllButton
            symbol={item?.symbol ?? ''}
            baseAddress={item?.token ?? ''}
            holdingQuantity={balance ?? 0}
            price={price ?? 0}
            portfolio={item}
            disabled={isProcessing}
          />
          <TrailingCommandButton
            symbol={item?.symbol ?? ''}
            baseAddress={item?.token ?? ''}
            holdingQuantity={balance ?? 0}
            disabled={isProcessing}
          />
        </div>
      </div>
    </>
  )
}

export default memo(MyPositionsCard)
