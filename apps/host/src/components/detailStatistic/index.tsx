import { Order, OrderType, Status, TransactionType } from '@/@generated/gql/graphql-trading.ts'
import { getChainId } from '@/lib/blockchain.ts'
import { formatAmount, formatBalance } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { selectOrderSubmitFailed, selectOrderUpdated } from '@/redux/modules/ordersSubscription.slice.ts'
import { priceChain } from '@/redux/modules/price.slice.ts'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { RootState, useAppSelector } from '@/redux/store'
import { ChainIds, FilterTransactionAmountType } from '@/types/enums.ts'
import { PortfolioDTO } from '@/types/holding.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import { getFromLocalStorageWithTTL, saveToLocalStorageWithTTL } from '@/utils/storage.ts'
import Container from '@components/common/Container.tsx'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import useHoldingSubscription from '@components/mqtt/HoldingSubscription.ts'
import { EVENT_MESSAGE_ORDER_CREATED } from '@components/orderForm'
import { TTL_STORAGE } from '@const/configs.ts'
import { MOCK_PORTFOLIO } from '@const/tokenDetail.ts'
import { useGetPortfolio } from '@hooks/useGetPortfolio.ts'
import useTokenPrice from '@hooks/useTokenPrice.ts'
import useWatchWalletTokenBalance from '@hooks/useWatchWalletTokenBalance.ts'
import { motion } from 'framer-motion'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

type StatsColumn = {
  value: string
  title: string | React.ReactNode
  content: string | React.ReactNode
}

const DetailStatistic = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const [currency, setCurrency] = useState<FilterTransactionAmountType>(FilterTransactionAmountType.USDT)
  const [isProcessing, setProcessing] = useState<boolean>(false)
  const [isNewPosition, setIsNewPosition] = useState<boolean>(false)
  const [portfolioData, setPortfolioData] = useState<PortfolioDTO>(
    getFromLocalStorageWithTTL<PortfolioDTO>('tokenStatistic') ?? MOCK_PORTFOLIO,
  )

  const checkConditionDisplay = useMemo(() => {
    if (isNewPosition) return true

    const hasToken = !!portfolioData?.token
    const totalBuyQty = Number(portfolioData?.totalBuyQty ?? 0)

    return hasToken && totalBuyQty > 0
  }, [isNewPosition, portfolioData?.token, portfolioData?.totalBuyQty])

  // Check condition
  const shouldAnimate = useMemo(() => {
    return isNewPosition && !portfolioData?.token
  }, [isNewPosition, portfolioData?.token])

  const activeWallet = useSelector(_activeWallet)
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

  const address = activeWallet?.walletAddress

  const tokenAddress = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.at(-1) || ''
  }, [location.pathname])
  const userAddress = activeWallet?.walletAddress

  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const { data, refetch } = useGetPortfolio({
    limit: 1,
    userAddress: address,
    token: tokenAddress,
    skipCondition: !tokenAddress || !address,
    chainId: chainId,
  })

  const orderSuccessSubs = useAppSelector(selectOrderUpdated)
  const orderFailSubs = useAppSelector(selectOrderSubmitFailed)
  const newPortfolio = useHoldingSubscription(userAddress, tokenAddress, activeWallet?.chainId || ChainIds.Solana)
  const msg_balance = useWatchWalletTokenBalance({
    address: userAddress,
    token: tokenAddress,
    chainId: activeWallet?.chainId || ChainIds.Solana,
  })

  // price
  const { price: ohlcPrice } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const priceMqtt = useTokenPrice(portfolioData?.token ?? '', '0')
  const fallBackPrice = portfolioData?.price || 0

  const price =
    portfolioData?.token === tokenAddress && ohlcPrice > 0
      ? ohlcPrice
      : priceMqtt && Number(priceMqtt) > 0
        ? Number(priceMqtt)
        : Number(fallBackPrice)

  const realized = portfolioData?.realizedPnL ?? 0
  const unrealized = portfolioData
    ? (Number(price ?? 0) - Number(portfolioData?.avgPriceUsd)) * Number(portfolioData?.totalBaseAmount)
    : 0

  const holdingValue = portfolioData ? Number(portfolioData?.totalBaseAmount) * Number(price ?? '0') : 0
  const holdingQuoteValue = holdingValue / (priceNativeToken || 1)

  const PnL = Number(realized) + Number(unrealized)
  const PnlQuote = PnL / (priceNativeToken || 1)
  const PnLPercent = PnL && portfolioData?.avgPriceUsd ? (PnL / Number(portfolioData?.totalBuyUsd)) * 100 : 0
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

  const isXStock = useMemo(() => {
    return location.pathname.includes('/xstocks/')
  }, [location.pathname])

  const handleChangeCurrency = () => {
    setCurrency(currency === FilterTransactionAmountType.USDT ? amountType : FilterTransactionAmountType.USDT)
  }

  const ChainIcon = () => <img src={getBlockchainLogo2(portfolioData?.chainId)} alt="" className="w-2.5 h-2.5" />

  const statsColumns: StatsColumn[] = [
    {
      value: 'buyValue',
      title: t('detail.holderTable.totalBuy'),
      content: isProcessing ? (
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
              {!price || price === 0 || isProcessing ? <Loader /> : formatAmount(buyQuoteValue, { roundMode: 'floor' })}
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
      content: isProcessing ? (
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
              {!price || price === 0 || isProcessing ? (
                <Loader />
              ) : (
                formatAmount(sellQuoteValue, { roundMode: 'floor' })
              )}
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
        isProcessing || !price || price === 0 ? (
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
                {!price || price === 0 || isProcessing ? (
                  <Loader />
                ) : (
                  formatAmount(holdingQuoteValue, { roundMode: 'floor' })
                )}
              </div>
            )}
          </div>
        ),
    },
    {
      value: 'pnl',
      title: t('detail.myPositions.profitAndLoss'),
      content:
        isProcessing || !price || price === 0 ? (
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
                {!price || price === 0 || isProcessing ? <Loader /> : formatAmount(PnlQuote, { roundMode: 'floor' })}
              </div>
            )}
          </span>
        ),
    },
  ]

  // show card pending if have order updated
  useEffect(() => {
    if (
      orderSuccessSubs &&
      orderSuccessSubs?.baseAddress === tokenAddress &&
      orderSuccessSubs?.status === Status.Confirmed
    ) {
      setProcessing(false)
      setPortfolioData((prev) => {
        const oldQuantity = prev?.totalBaseAmount || 0
        const estimateQuantity =
          orderSuccessSubs?.transactionType === TransactionType.Buy
            ? Number(+orderSuccessSubs?.baseAmount)
            : Number(-orderSuccessSubs?.baseAmount)
        return { ...prev, totalBaseAmount: Math.max(Number(oldQuantity) + Number(estimateQuantity), 0) }
      })
    }
  }, [orderSuccessSubs, tokenAddress])

  // show card pending if have order updated
  useEffect(() => {
    if (orderFailSubs && orderFailSubs?.order && orderFailSubs?.order?.baseAddress === tokenAddress) {
      console.log({ orderFailSubs })
      setProcessing(false)
      setIsNewPosition(false)
      setPortfolioData((prev) => {
        const isBuy = orderFailSubs?.order?.transactionType === TransactionType.Buy
        const isTpsl = orderFailSubs?.order?.type === OrderType.TrailingTpsl
        const baseAmount = Number(orderFailSubs?.order?.baseAmount ?? 0)
        const estimateReturnValue = isTpsl ? 0 : isBuy ? -baseAmount : baseAmount
        const oldTotalSellUsd = prev?.totalSellUsd || 0
        const oldTotalBuyUsd = prev?.totalBuyUsd || 0
        const oldQuantity = prev?.totalBaseAmount || 0
        return {
          ...prev,
          totalBaseAmount: Math.max(Number(oldQuantity) + Number(estimateReturnValue), 0),
          totalBuyUsd: isBuy
            ? Number(oldTotalBuyUsd) + Number(orderFailSubs?.order?.baseAmount) * price
            : oldTotalBuyUsd,
          totalSellUsd: isBuy
            ? oldTotalSellUsd
            : Number(oldTotalSellUsd) + Number(orderFailSubs?.order?.baseAmount) * price,
        }
      })
      refetch().catch(console.error)
    }
  }, [orderFailSubs, tokenAddress, price])

  // update portfolioData if API have new data
  useEffect(() => {
    if (data) {
      const dataFromApi = data?.getPortfolio?.data?.filter((item) => item.token === tokenAddress)?.[0]
      setPortfolioData(dataFromApi)
      setProcessing(false)
      setIsNewPosition(false)
    }
  }, [data])

  // add to ls for caching
  useEffect(() => {
    if (portfolioData) {
      saveToLocalStorageWithTTL<PortfolioDTO>('tokenStatistic', portfolioData, TTL_STORAGE)
    }
  }, [portfolioData])

  // update portfolioData if have new data from holding subscription
  useEffect(() => {
    if (!newPortfolio || !newPortfolio?.token) return
    if (newPortfolio?.token !== tokenAddress) return
    console.log({ newPortfolio })
    setPortfolioData((prev) => {
      return {
        ...prev,
        avgPriceUsd: newPortfolio?.avgPriceUsd ?? prev?.avgPriceUsd,
        realizedPnL: newPortfolio?.realizedPnL ?? prev?.realizedPnL,
        totalBuyQty: newPortfolio?.totalBuyQty ?? prev?.totalBuyQty,
        totalBuyUsd: newPortfolio?.totalBuyUsd ?? prev?.totalBuyUsd,
        totalSellUsd: newPortfolio?.totalSellUsd ?? prev?.totalSellUsd,
        totalSellQty: newPortfolio?.totalSellQty ?? prev?.totalSellQty,
      }
    })
  }, [newPortfolio])

  // refetch after have new transaction
  useEffect(() => {
    if (!msg_balance?.token || !msg_balance?.balance) return
    if (msg_balance?.token === tokenAddress) {
      console.log({ msg_balance })
      setPortfolioData((prev) => {
        return {
          ...prev,
          totalBaseAmount: msg_balance.balance,
        }
      })
      setProcessing(false)
      refetch().catch(console.error)
    }
  }, [msg_balance])

  //handle show loading when create order
  useEffect(() => {
    const channel = new BroadcastChannel(EVENT_MESSAGE_ORDER_CREATED)
    const handleMessage = (event: MessageEvent) => {
      if (event && event?.data && event?.data?.data?.baseAddress === tokenAddress) {
        // setProcessing(true)
        setIsNewPosition(true)
        setPortfolioData((prev) => {
          const newOrder = event?.data?.data as Order
          const oldQuantity = prev?.totalBaseAmount || 0
          const oldTotalBuyUsd = prev?.totalBuyUsd || 0
          const oldTotalSellUsd = prev?.totalSellUsd || 0
          const isBuy = newOrder?.transactionType === TransactionType.Buy
          const orderAmount = isBuy ? newOrder?.quoteAmount * (priceNativeToken ?? 170) : newOrder?.baseAmount
          const adjustBalance = Number(orderAmount) / (newOrder?.openPrice != 0 ? newOrder?.openPrice : price)
          const estimateQuantity = isBuy ? Number(+adjustBalance) : Number(-adjustBalance)

          return {
            ...prev,
            totalBaseAmount: Math.max(Number(oldQuantity) + Number(estimateQuantity), 0),
            totalBuyUsd: isBuy ? Number(oldTotalBuyUsd) + Number(newOrder?.baseAmount) * price : oldTotalBuyUsd,
            totalSellUsd: isBuy ? oldTotalSellUsd : Number(oldTotalSellUsd) + Number(newOrder?.baseAmount) * price,
          }
        })
      }
    }
    channel.addEventListener('message', handleMessage)

    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
    }
  }, [priceNativeToken, price])

  // useEffect(() => {
  //   console.log({portfolioData})
  // }, [portfolioData])

  // refetch after change address token or wallet
  useEffect(() => {
    setProcessing(false)
    refetch().catch(console.error)
  }, [tokenAddress, userAddress])

  return checkConditionDisplay ? (
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
                className={cn('font-[330] text-[11px] text-white', handleColumnContentTextColor(`${column.content}`))}
              >
                {column.content}
              </div>
              <div className="font-[305] text-[10px] text-[#908E98] leading-none">{column.title}</div>
            </div>
          ))}
        </div>
      </Container>
    </motion.div>
  ) : null
}

export default DetailStatistic
