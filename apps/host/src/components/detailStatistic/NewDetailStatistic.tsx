import { getChainId } from '@/lib/blockchain.ts'
import { formatAmount, formatBalance } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { priceChain } from '@/redux/modules/price.slice.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds, FilterTransactionAmountType } from '@/types/enums.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import Container from '@components/common/Container.tsx'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import { useNewTokenPrice } from '@hooks/useTokenPrice.ts'
import { motion } from 'framer-motion'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useNewHoldingData } from '../myPositions/hook/useNewHoldingData'
import useHoldingSubscription from '../mqtt/HoldingSubscription'
import { mapWalletTokenDataToPortfolio } from '@/utils/mappingType'
import { PortfolioDTO } from '@/types/holding'
import { setDataCurrentToken, updaShadowHolding, updateHolding } from '@/redux/modules/holding.slice'
import useWatchWalletTokenBalance from '@/hooks/useWatchWalletTokenBalance'
import Decimal from 'decimal.js'
import { useResponsive } from '@/hooks/useResponsive'
import IconFund from '../icon/stroke/IconFund'
import { gqlClient } from '@/lib/gql/apollo-client'
import { PortfolioResponse } from '@/types/responses'
import { getPortfolio } from '@/services/tokens.service'
Decimal.set({ precision: 100 })

type StatsColumn = {
  value: string
  title: string | React.ReactNode
  content: string | React.ReactNode
}

const NewDetailStatistic = () => {
  const { t } = useTranslation()
  const { currentData } = useNewHoldingData()
  const { address: tokenAddress } = useParams()
  const [currency, setCurrency] = useState<FilterTransactionAmountType>(FilterTransactionAmountType.USDT)
  const [unit, setUnit] = useState<string>('USD')
  const dispatch = useAppDispatch()
  const { isDesktop } = useResponsive()

  const portfolioData = useMemo(
    () => currentData.find((item) => item.token === tokenAddress),
    [currentData, tokenAddress],
  )
  // Check condition
  const shouldAnimate = useMemo(() => {
    return !portfolioData?.token
  }, [portfolioData?.token])

  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const chainId = getChainId(activeChain)

  const nativeUnit = useMemo(() => {
    switch (chainId) {
      case ChainIds.Solana:
        return 'SOL'
      case ChainIds.Bsc:
        return 'BNB'
      case ChainIds.Ethereum:
      case ChainIds.Arbitrum:
        return 'ETH'
      default:
        return 'SOL'
    }
  }, [chainId])

  const amountType = useMemo(() => {
    switch (chainId) {
      case ChainIds.Solana:
        return FilterTransactionAmountType.SOL
      case ChainIds.Bsc:
        return FilterTransactionAmountType.BNB
      case ChainIds.Ethereum:
      case ChainIds.Arbitrum:
        return FilterTransactionAmountType.ETH
      default:
        return FilterTransactionAmountType.SOL
    }
  }, [chainId])

  const priceNativeToken = useAppSelector(priceChain(activeChain))

  // price
  const priceMqtt = useNewTokenPrice(portfolioData?.token, portfolioData?.chainId)
  const fallBackPrice = portfolioData?.price || 0
  const price = portfolioData?.token && priceMqtt && +priceMqtt > 0 ? priceMqtt : fallBackPrice
  const totalBaseEstimate = portfolioData?.estimateOrderValue
    ? new Decimal(portfolioData?.totalBaseAmount).add(portfolioData?.estimateOrderValue).toString()
    : portfolioData?.totalBaseAmount
      ? new Decimal(portfolioData?.totalBaseAmount).toString()
      : 0

  const totalBase = +totalBaseEstimate >= 0 ? totalBaseEstimate : 0
  const balance = portfolioData?.isSellAll ? 0 : totalBase
  const holdingValue = +balance * Number(price)
  const holdingQuoteValue = holdingValue / (priceNativeToken || 1)
  const realized = portfolioData?.realizedPnL ?? 0
  const unrealized = portfolioData ? (Number(price ?? 0) - Number(portfolioData?.avgPriceUsd)) * Number(totalBase) : 0

  const PnL = Number(realized) + Number(unrealized)
  const PnlQuote = PnL / (priceNativeToken || 1)
  //   const PnLPercent = PnL && portfolioData?.avgPriceUsd ? (PnL / Number(portfolioData?.totalBuyUsd)) * 100 : 0
  const buyValue = Number(portfolioData?.totalBuyUsd)
  const buyQuoteValue = priceNativeToken && buyValue ? Number(buyValue) / priceNativeToken : 0

  const sellValue = Number(portfolioData?.totalSellUsd)
  const sellQuoteValue = priceNativeToken && sellValue ? Number(sellValue) / priceNativeToken : 0

  const handleColumnContentTextColor = (value: string) => {
    const strValue = value.replace('$', '')
    if (strValue === '--' || strValue === '0' || strValue === '0.00' || !isFinite(parseFloat(strValue))) {
      return 'text-white'
    }
    return parseFloat(strValue) > 0 ? 'text-rise' : 'text-fall'
  }

  const handleChangeCurrency = () => {
    setCurrency(currency === FilterTransactionAmountType.USDT ? amountType : FilterTransactionAmountType.USDT)
  }

  const ChainIcon = () => <img src={getBlockchainLogo2(portfolioData?.chainId)} alt="" className="w-2.5 h-2.5" />

  const isShowLoading = !price || price === 0 || portfolioData?.isProcessing

  const activeWallet = useSelector(_activeWallet)
  const userAddress = activeWallet?.walletAddress
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
            token: portfolioData?.token,
            tag: portfolioData?.isXStock ? 'XStock' : 'meme',
          },
        },
        fetchPolicy: 'no-cache',
      })

      const fetched = res?.getPortfolio?.data ?? []
      dispatch(setDataCurrentToken(fetched?.[0]))
    } catch (err) {
      console.error(err)
    }
  }, [userAddress, gqlClient, activeWallet?.chainId, portfolioData?.token, portfolioData?.isXStock, dispatch])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (portfolioData?.isProcessing) {
      timer = setTimeout(() => {
        queryGetCurrentPortfolio()
      }, 30000)
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [portfolioData?.isProcessing, queryGetCurrentPortfolio])

  const statsColumns: StatsColumn[] = [
    {
      value: 'buyValue',
      title: t('detail.holderTable.totalBuy'),
      content: isShowLoading ? (
        <div className="flex items-center justify-center mt-0.5">
          <Loader />
        </div>
      ) : portfolioData?.totalBuyUsd ? (
        <div className="flex items-center justify-center gap-0.5 text-rise">
          {currency === FilterTransactionAmountType.USDT ? (
            formatBalance(buyValue, { showCurrency: true, roundMode: 'floor' })
          ) : (
            <div className="flex items-center gap-1">
              <ChainIcon />
              {isShowLoading ? <Loader /> : formatAmount(buyQuoteValue, { roundMode: 'floor' })}
            </div>
          )}
        </div>
      ) : (
        '--'
      ),
    },
    {
      value: 'sellValue',
      title: t('detail.holderTable.totalSell'),
      content: isShowLoading ? (
        <div className="flex items-center justify-center mt-0.5">
          <Loader />
        </div>
      ) : portfolioData?.totalSellUsd ? (
        <div className="flex items-center justify-center gap-0.5 text-fall">
          {currency === FilterTransactionAmountType.USDT ? (
            formatBalance(sellValue, { showCurrency: true, roundMode: 'floor' })
          ) : (
            <div className="flex items-center gap-1">
              <ChainIcon />
              {isShowLoading ? <Loader /> : formatAmount(sellQuoteValue, { roundMode: 'floor' })}
            </div>
          )}
        </div>
      ) : (
        '--'
      ),
    },
    {
      value: 'holdingValue',
      title: t('detail.statistics.holdingValue'),
      content:
        !price || price === 0 ? (
          <div className="flex items-center justify-center mt-0.5">
            <Loader />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            {currency === FilterTransactionAmountType.USDT ? (
              formatBalance(holdingValue, { showCurrency: true, roundMode: 'floor' })
            ) : (
              <div className="flex items-center gap-1">
                <ChainIcon />
                {!price || price === 0 ? <Loader /> : formatAmount(holdingQuoteValue, { roundMode: 'floor' })}
              </div>
            )}
          </div>
        ),
    },
    {
      value: 'pnl',
      title: t('detail.myPositions.profitAndLoss'),
      content: isShowLoading ? (
        <div className="flex items-center justify-center mt-0.5">
          <Loader />
        </div>
      ) : (
        <span className={cn('flex items-center justify-center gap-0.5', handleColumnContentTextColor(`${PnL}`))}>
          {currency === FilterTransactionAmountType.USDT ? (
            formatBalance(PnL, { showCurrency: true, roundMode: 'floor' })
          ) : (
            <div className="flex items-center gap-1">
              <ChainIcon />
              {isShowLoading ? <Loader /> : formatAmount(PnlQuote, { roundMode: 'floor' })}
            </div>
          )}
        </span>
      ),
    },
  ]

  if (!portfolioData?.token) return null

  return (
    <>
      {isDesktop ? (
        <div className="rounded-[4px] border-[0.5px] border-[#ECECED1F] py-2 flex items-center justify-between text-nowrap overflow-x-auto min-h-[52px]">
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-2 border-r-[0.5px] last-of-type:border-0 border-[#ECECED14]">
            <div className="font-[330] text-[12px] text-white/50 leading-none">{t('detail.holderTable.totalBuy')}</div>
            <div className={cn('font-[380] text-[12px] text-rise leading-none')}>
              {unit === 'USD' ? (
                isShowLoading ? (
                  <Loader />
                ) : portfolioData?.totalBuyUsd ? (
                  formatBalance(portfolioData?.totalBuyUsd, { showCurrency: true, roundMode: 'floor' })
                ) : (
                  '--'
                )
              ) : (
                <div className="flex items-center gap-1">
                  <ChainIcon />
                  {isShowLoading ? (
                    <Loader />
                  ) : portfolioData?.totalBuyUsd ? (
                    formatAmount(portfolioData?.totalBuyUsd / (priceNativeToken || 1), { roundMode: 'floor' })
                  ) : (
                    '--'
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-2 border-r-[0.5px] last-of-type:border-0 border-[#ECECED14]">
            <div className="font-[330] text-[12px] text-white/50 leading-none">{t('detail.holderTable.totalSell')}</div>
            <div className={cn('font-[380] text-[12px] text-false leading-none text-fall')}>
              {unit === 'USD' ? (
                isShowLoading ? (
                  <Loader />
                ) : portfolioData?.totalBuyUsd ? (
                  formatBalance(portfolioData?.totalSellUsd, { showCurrency: true, roundMode: 'floor' })
                ) : (
                  '--'
                )
              ) : (
                <div className="flex items-center gap-1">
                  <ChainIcon />
                  {isShowLoading ? (
                    <Loader />
                  ) : portfolioData?.totalSellUsd ? (
                    formatAmount(portfolioData?.totalSellUsd / (priceNativeToken || 1), { roundMode: 'floor' })
                  ) : (
                    '--'
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-2 border-r-[0.5px] last-of-type:border-0 border-[#ECECED14]">
            <div className="font-[330] text-[12px] text-white/50 leading-none">
              {t('detail.statistics.holdingValue')}
            </div>
            <div className={cn('font-[380] text-[12px] text-white leading-none', '')}>
              {unit === 'USD' ? (
                isShowLoading ? (
                  <Loader />
                ) : (
                  formatBalance(holdingValue, { showCurrency: true, roundMode: 'floor' })
                )
              ) : (
                <div className="flex items-center gap-1">
                  <ChainIcon />
                  {isShowLoading ? (
                    <Loader />
                  ) : (
                    formatAmount(holdingValue / (priceNativeToken || 1), { roundMode: 'floor' })
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-2 border-r-[0.5px] last-of-type:border-0 border-[#ECECED14]">
            <div className="font-[330] text-[12px] text-white/50 leading-none flex items-center gap-1">
              {t('detail.myPositions.profitAndLoss')}{' '}
              <span
                className="cursor-pointer"
                onClick={() => {
                  setUnit((prev) => (prev === 'USD' ? nativeUnit : 'USD'))
                }}
              >
                <IconFund className="size-[14px]" />
              </span>
            </div>
            <div className={cn('font-[380] text-[12px] text-white leading-none', '')}>
              <div
                className={cn(
                  'font-[380] text-[14px]',
                  Number(realized) + Number(unrealized) === 0 || isShowLoading
                    ? 'text-[#FFFFFFB2]'
                    : Number(realized) + Number(unrealized) > 0
                      ? 'text-rise'
                      : 'text-fall',
                )}
              >
                {unit === 'USD' ? (
                  isShowLoading ? (
                    <Loader />
                  ) : (
                    formatBalance(PnL, { showCurrency: true, roundMode: 'floor' })
                  )
                ) : (
                  <div className="flex items-center gap-1">
                    <ChainIcon />
                    {isShowLoading ? (
                      <Loader />
                    ) : (
                      formatAmount(typeof PnL === 'number' ? PnL / (priceNativeToken || 1) : null, {
                        roundMode: 'floor',
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: -30 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
          transition={shouldAnimate ? { duration: 0.5, ease: 'easeOut' } : {}}
        >
          <Container className="mt-2.5">
            <div className="p-1 rounded-md bg-[#151418] flex items-center justify-between text-nowrap overflow-x-auto">
              {/*btn change currency*/}
              <div
                onClick={handleChangeCurrency}
                className="flex flex-col items-center gap-0 px-[8px] py-1 rounded-sm bg-[#1A1A1EE5] cursor-pointer select-none"
              >
                <img src="/images/orderBook/icon-refund.svg" className="w-[18px] min-w-[18px]" alt="change currency" />
                <span className="w-5 font-[380] text-[#908E98] text-[10px] leading-[1]">
                  {currency === FilterTransactionAmountType.USDT ? 'USD' : nativeUnit}
                </span>
              </div>
              {statsColumns.map((column: StatsColumn) => (
                <div
                  key={column.value}
                  className="leading-[1] px-[14.5px] flex-1 flex flex-col justify-between text-center gap-[6px] relative first:pl-0 last:pr-0 last:after:content-none after:content-[''] after:absolute after:w-[1px] after:h-[24px] after:bg-[#ECECED14] after:right-0 after:top-[50%] after:transform after:-translate-y-1/2"
                >
                  <div
                    className={cn(
                      'font-[330] text-[11px] text-white',
                      handleColumnContentTextColor(`${column.content}`),
                    )}
                  >
                    {column.content}
                  </div>
                  <div className="font-[305] text-[10px] text-[#908E98] leading-none">{column.title}</div>
                </div>
              ))}
            </div>
          </Container>
        </motion.div>
      )}
    </>
  )
}

export default NewDetailStatistic
