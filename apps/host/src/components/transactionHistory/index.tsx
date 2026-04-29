import {
  ChainType,
  Order,
  OrderSortField,
  SearchOrderInput,
  SortDirection,
  TransactionType,
} from '@/@generated/gql/graphql-trading.ts'
import { useActiveChain, useActiveChainId } from '@/hooks/useActiveChain'
import { usePreference } from '@/hooks/usePreference'
import { getDataUnitByChain } from '@/lib/currency'
import eventBus from '@/lib/eventBus.ts'
import { REFETCH_UNCOMPLETED_ORDERS, REMOVE_FAILED_ITEM } from '@/lib/eventMessages.ts'
import { formatAmount, formatBalance } from '@/lib/format'
import { tradingClient } from '@/lib/gql/apollo-client'
import { useSubscription } from '@/lib/mqtt'
import { cn } from '@/lib/utils'
import { TRADING_CONFIG } from '@/onchain-config.ts'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { priceChain } from '@/redux/modules/price.slice.ts'
import { setCurrentHistoryCheckIsCurrent, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { setDataUnit } from '@/redux/modules/userSettings.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { getAllTransactions, getTradingConfig } from '@/services/order.service'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import { getChainType } from '@/utils/list-coin-helper'
import {
  getArrayFromLocalStorageWithTTL,
  getFromLocalStorageWithTTL,
  removeFromLocalStorage,
  saveToLocalStorageWithTTL,
} from '@/utils/storage.ts'
import Container from '@components/common/Container.tsx'
import { Loading } from '@components/common/Loading.tsx'
import { EVENT_MESSAGE_ORDER_CREATED } from '@components/orderForm'
import { TTL_STORAGE } from '@const/configs.ts'
import { LIMIT_PER_PAGE } from '@const/smartMoney.ts'
import { AnimatePresence, motion } from 'framer-motion'
import { throttle } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { PendingOrder } from '../myPositions/useHoldingData'
import { useGetPortfolioTokenByAddress } from '@/pages/detail/orderForm/desktop/hook/useGetPortfolioTokenByAddress'
import TransactionHistoryTable from './TransactionHistoryTable'

const TransactionHistory = () => {
  const { address } = useParams()
  const location = useLocation()

  const { t } = useTranslation()
  const { preference } = usePreference()
  const activeChain = useActiveChain()
  const activeChainId = useActiveChainId()
  const { currentHistoryCheckIsCurrent } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)
  const activeWallet = useSelector(_activeWallet)
  const userAddress = activeWallet?.walletAddress
  const [tokenFilter, setTokenFilter] = useState<string | undefined>(currentHistoryCheckIsCurrent ? address : undefined)
  const [sortByCreatedAt, setSortByCreatedAt] = useState<SortDirection>(SortDirection.Desc)
  const [typeFilter, setTypeFilter] = useState<TransactionType>()
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [feeConfig, setFeeConfig] = useState(TRADING_CONFIG)
  const dispatch = useAppDispatch()
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const priceChangeColor = preference?.priceChangeColor || 'normal'

  const isXStock = useMemo(() => {
    return location.pathname.includes('/xstocks/')
  }, [location.pathname])

  const refTable = useRef<HTMLDivElement>(null)

  const [transactions, setTransactions] = useState<any[]>(
    getFromLocalStorageWithTTL<any[]>('transactionHistories') ?? [],
  )
  const [offset, setOffset] = useState(0)

  const priceNativeToken = useAppSelector(priceChain(activeChain))

  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>(
    getArrayFromLocalStorageWithTTL<PendingOrder>('holdingUnCompleted') ?? [],
  )
  const userId = useSelector(_userInfo)?.userId

  const { portfolioData } = useGetPortfolioTokenByAddress(address ? address : '')

  const { message: _orderMessage } = useSubscription(
    [`users/${userId}/order_updated`, `users/${userId}/order_submit_failed`, `users/${userId}/order_confirmation`],
    {
      shouldSkip: !userId,
    },
  )

  const updateTransactions = useCallback(
    (newTransaction: any) => {
      setTransactions((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === newTransaction.id)
        if (existingIndex !== -1) {
          // Update existing transaction
          const updatedTransactions = [...prev]
          updatedTransactions[existingIndex] = { ...updatedTransactions[existingIndex], ...newTransaction }
          return updatedTransactions
        } else {
          // Add new transaction
          return [newTransaction, ...prev]
        }
      })
    },
    [transactions],
  )

  useEffect(() => {
    if (!_orderMessage || !userId) return

    try {
      const message = _orderMessage?.message
      const data = JSON.parse(message?.toString() || '')
      const orderId = data?.id
      if (!orderId) return
      updateTransactions(data)
    } catch (error) {
      console.error('Error parsing order message:', error)
    }
  }, [_orderMessage])

  const fetchTradingConfig = async () => {
    try {
      const response = await tradingClient.query({
        query: getTradingConfig,
      })
      const config = response?.data?.config
      if (config) {
        setFeeConfig(
          (prev) =>
            ({
              ...prev,
              platformFee: config?.platformFee,
              xstockPlatformFee: config?.xstockPlatformFee,
            }) as typeof TRADING_CONFIG,
        )
      }
    } catch (error) {
      console.error('Error fetching trading config:', error)
    }
  }

  const filteredTransactions = transactions

  const mappedataPendingOrder = (pendingOrder: PendingOrder, data: any[]) => {
    const existingIndex = data.some((item) => item.id === pendingOrder.id)
    if (!existingIndex) {
      const newItem = { ...pendingOrder }
      const openPrice =
        pendingOrder?.openPrice && Number(pendingOrder?.openPrice) != 0 ? Number(pendingOrder?.openPrice) : 1
      newItem.closePriceUsd = openPrice
      newItem.closePriceQuote = openPrice / priceNativeToken
      newItem.baseAmount =
        pendingOrder?.transactionType === TransactionType.Sell
          ? pendingOrder?.baseAmount
          : (Number(pendingOrder.quoteAmount) * priceNativeToken) / openPrice
      setTransactions([newItem, ...data])
      return
    }
    setTransactions([...data])
    saveToLocalStorageWithTTL<any[]>('transactionHistories', data, TTL_STORAGE)
  }

  const fetchTransactionHistory = async () => {
    try {
      const queryInput: SearchOrderInput = {
        chain: getChainType(activeChain) as ChainType,
        transactionType: typeFilter,
        baseAddress: tokenFilter,
        userAddress: userAddress,
        sortField: OrderSortField.CreatedAt,
        sortDir: sortByCreatedAt,
        limit: 20,
        offset: offset,
        isXStock,
      }

      const response = await tradingClient.query({
        query: getAllTransactions,
        variables: {
          input: queryInput,
        },
      })

      const transactionsData = response?.data?.getAllTransactions ?? []

      if (offset > 0) {
        if (pendingOrders?.length < 1) {
          setTransactions([...transactions, ...transactionsData])
        } else {
          pendingOrders.forEach((order) => {
            mappedataPendingOrder(order, [...transactions, ...transactionsData])
          })
        }
      } else {
        if (pendingOrders?.length < 1) {
          setTransactions(transactionsData)
        } else {
          pendingOrders.forEach((order) => {
            mappedataPendingOrder(order, transactionsData)
          })
        }
      }
      setLoading(false)
      setHasMore(response?.data?.getAllTransactions?.length === LIMIT_PER_PAGE)
      saveToLocalStorageWithTTL('transactionHistories', transactionsData, TTL_STORAGE)
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      setLoading(false)
      setHasMore(false)
    }
  }

  const loadMoreFn = async () => {
    if (transactions.length < offset + 20) return false
    setOffset((prev) => prev + 20)
    return true
  }

  const handleChangeCurrency = () => {
    if (dataUnit === 'USD') {
      dispatch(setDataUnit(getDataUnitByChain(activeChain)))
    } else {
      dispatch(setDataUnit('USD'))
    }
  }

  useEffect(() => {
    const throttled = throttle(() => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const LOAD_MORE_SCROLL_THRESHOLD = 0.75

      if ((scrollTop + windowHeight) / docHeight >= LOAD_MORE_SCROLL_THRESHOLD && !loadingMore && hasMore) {
        setLoadingMore(true)
        loadMoreFn().finally(() => setLoadingMore(false))
      }
    }, 200)

    window.addEventListener('scroll', throttled)
    return () => window.removeEventListener('scroll', throttled)
  }, [loadingMore, hasMore, loadMoreFn])

  useEffect(() => {
    const combinedOrders = [[]]
    if (!combinedOrders.length) return

    const map = new Map<string, Order>()
    combinedOrders.forEach((order: any) => {
      if (order?.baseAddress) map.set(order.baseAddress, order)
    })

    let merged = Array.from(map.values())
    if (tokenFilter) {
      merged = merged.filter((order) => order.baseAddress === tokenFilter)
    }

    setPendingOrders(merged)
  }, [tokenFilter])

  // clear cache if change token or wallet
  useEffect(() => {
    if (currentHistoryCheckIsCurrent) {
      setTokenFilter(address)
      saveToLocalStorageWithTTL('transactionHistories', filteredTransactions, TTL_STORAGE)
      dispatch(setCurrentHistoryCheckIsCurrent(true))
    } else {
      removeFromLocalStorage('transactionHistories')
      setTokenFilter(undefined)
      dispatch(setCurrentHistoryCheckIsCurrent(false))
    }
  }, [address, userAddress])

  useEffect(() => {
    setLoading(true)
    if (offset === 0) {
      fetchTransactionHistory()
      if (refTable.current) {
        refTable.current.scrollTo({ top: 0 })
      }
    } else {
      setOffset(0)
    }
  }, [sortByCreatedAt, tokenFilter, typeFilter, address])

  useEffect(() => {
    if (offset === 0) {
      if (refTable.current) {
        refTable.current.scrollTo({ top: 0 })
      }
    }
    fetchTransactionHistory()
  }, [userAddress, offset])

  useEffect(() => {
    let isMounted = true
    fetchTradingConfig()
    if (tokenFilter === address) {
      fetchTransactionHistory()
    }

    const channel = new BroadcastChannel(EVENT_MESSAGE_ORDER_CREATED)
    const handleMessage = (event: MessageEvent) => {
      const newOrder = event?.data?.data as Order
      // const orderId = newOrder?.id
      // if (pendingOrders?.some((item) => item.id === orderId)) return
      if (isMounted) {
        setPendingOrders((prev) => [...prev, newOrder])
        mappedataPendingOrder(newOrder, transactions)
      }
    }
    channel.addEventListener('message', handleMessage)
    eventBus.on(REMOVE_FAILED_ITEM, (data: any) => {
      setPendingOrders((prev) => prev.filter((item) => item.id !== data?.data?.id))
    })

    return () => {
      isMounted = false
      eventBus.remove(REFETCH_UNCOMPLETED_ORDERS)
      eventBus.remove(REMOVE_FAILED_ITEM)
      channel.removeEventListener('message', handleMessage)
      channel.close()
    }
  }, [transactions])

  useEffect(() => {
    dispatch(setCurrentHistoryCheckIsCurrent(false))
  }, [address])

  return (
    <Container className="mt-[10px]">
      <div className="flex justify-between items-center">
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => {
            if (tokenFilter === address) {
              dispatch(setCurrentHistoryCheckIsCurrent(false))
              setTokenFilter(undefined)
            } else {
              dispatch(setCurrentHistoryCheckIsCurrent(true))
              setTokenFilter(address)
            }
          }}
        >
          <div
            className={`peer h-3.5 w-3.5 shrink-0 rounded-sm ${tokenFilter === address ? 'border-none' : 'border border-[#b8b4ad]'}`}
          >
            <div className={`flex items-center justify-center ${tokenFilter === address ? 'block' : 'hidden'}`}>
              <img src="/images/icons/ic-tick-square.svg?v=2" className="w-3.5 h-3.5" alt="" />
            </div>
          </div>
          <span className="block text-[calc(1rem*(11/16))] text-[#FFFFFF99] leading-[1] relative top-[-0.5px]">
            {t('history.showCurrentCoinOnly')}
          </span>
        </div>
        <div
          className="select-none px-[6px] py-1 bg-[#ECECED14] rounded-[200px] flex flex-row items-center gap-1 cursor-pointer hover:bg-[#ECECED1A] transition-all duration-200 ease-in-out"
          onClick={handleChangeCurrency}
        >
          {dataUnit !== 'USD' ? (
            <img
              src={getBlockchainLogo2(activeChainId)}
              alt=""
              className="w-[16px] h-[16px]
                rounded-full"
            />
          ) : (
            <img
              alt="icon currency"
              className="w-4 h-4 border border-[#121218] rounded-full"
              src={'/images/icons/iconUsd.svg'}
            />
          )}
          <span className="text-[10px] font-normal uppercase w-[20px] text-center">{dataUnit}</span>
          <img src="/images/icons/fund-icon.svg" alt="" className="w-[16px] h-[16px]" />
        </div>
      </div>
      <AnimatePresence>
        {tokenFilter === address && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mt-[10px] flex items-center justify-between gap-3">
              <div
                className={cn(
                  'p-4 bg-cover bg-center border-[0.5px] border-[rgba(35,35,41,1)] rounded-[6px] flex-1 text-center',
                  priceChangeColor === 'normal'
                    ? "bg-[url('/images/bg-total-buy-amount.png')]"
                    : "bg-[url('/images/bg-total-sell-amount.png')]",
                )}
              >
                <div className="font-[400] text-[12px]">{t('walletDetail.holderTable.totalBuy')}</div>
                <div className="mt-2 font-[600] text-[12px] text-rise">
                  {dataUnit === 'USD'
                    ? formatBalance(portfolioData?.totalBuyUsd, {
                        showCurrency: true,
                        roundMode: 'floor',
                      })
                    : formatAmount(portfolioData?.totalBuyUsd, {
                        unit: dataUnit,
                        roundMode: 'floor',
                      })}
                </div>
              </div>
              <div
                className={cn(
                  'p-4 bg-cover bg-center border-[0.5px] border-[rgba(35,35,41,1)] rounded-[6px] flex-1 text-center',
                  priceChangeColor === 'normal'
                    ? "bg-[url('/images/bg-total-sell-amount.png')]"
                    : "bg-[url('/images/bg-total-buy-amount.png')]",
                )}
              >
                <div className="font-[400] text-[12px]">{t('walletDetail.holderTable.totalSell')}</div>
                <div className="mt-2 font-[600] text-[12px] text-fall">
                  {dataUnit === 'USD'
                    ? formatBalance(portfolioData?.totalSellUsd, {
                        showCurrency: true,
                        roundMode: 'floor',
                      })
                    : formatAmount(portfolioData?.totalSellUsd, {
                        unit: dataUnit,
                        roundMode: 'floor',
                      })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-[10px]">
        <TransactionHistoryTable
          platformFee={isXStock ? feeConfig.xstockPlatformFee : feeConfig.platformFee}
          transactions={filteredTransactions}
          dataUnit={dataUnit}
          tokenFilter={tokenFilter}
          sortByCreatedAt={sortByCreatedAt}
          typeFilter={typeFilter}
          onFilterByTokenChange={setTokenFilter}
          onSortByCreatedAtChange={setSortByCreatedAt}
          onFilterByTypeChange={setTypeFilter}
          loading={loading && filteredTransactions?.length === 0}
        />
        {loadingMore && (
          <div className="flex justify-center items-center py-4">
            <Loading />
          </div>
        )}
      </div>
    </Container>
  )
}

export default TransactionHistory
