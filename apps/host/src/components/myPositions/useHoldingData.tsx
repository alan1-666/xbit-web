import { useState, useEffect, useMemo } from 'react'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import {
  appendToLocalStorageArrayWithTTL,
  getArrayFromLocalStorageWithTTL,
  removeFromLocalStorage,
  removeItemFromLocalStorageArray,
  saveToLocalStorageWithTTL,
} from '@/utils/storage'
import { Order, Status, TransactionType } from '@/@generated/gql/graphql-trading'
import { GetPricesResponse, PortfolioResponse, TokenPrices } from '@/types/responses'
import useHoldingSubscription from '@components/mqtt/HoldingSubscription.ts'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import useWatchWalletTokenBalance from '@/hooks/useWatchWalletTokenBalance'
import {
  clearOrderSubmitFailed,
  clearOrderUpdated,
  selectOrderSubmitFailed,
  selectOrderUpdated,
} from '@/redux/modules/ordersSubscription.slice'
import { gqlClient, gqlMeme2 } from '@/lib/gql/apollo-client'
import { getPortfolio, getPrices } from '@/services/tokens.service'
import { TTL_PORTFOLIO_STORAGE } from '@/const/configs'
import { PortfolioDTO } from '@/types/holding'
import { mapOrderToPortfolio, mapWalletTokenDataToPortfolio } from '@/utils/mappingType'
import { priceChain } from '@/redux/modules/price.slice'
import {
  HoldingState,
  setData,
  setHasMore,
  setLoading,
  setLoadingMore,
  setPage,
} from '@/redux/modules/holding.slice.ts'
import { EVENT_MESSAGE_ORDER_CREATED } from '../orderForm'
import Decimal from 'decimal.js'

const LIMIT_PAGE = 20

type Item = {
  token: string | number
  [key: string]: any
}

function mergeById<T extends Item>(A: T[], B: T[]): T[] {
  const map = new Map<string | number, T>()

  for (const item of A) {
    map.set(item.token, item)
  }

  for (const item of B) {
    map.set(item.token, item)
  }
  return Array.from(map.values())
}

export type PendingOrder = Order & {
  logoUrl?: string | undefined
  lastTxTime?: string | undefined
}

export const useHoldingData = () => {
  const dispatch = useAppDispatch()
  //   const [sortBy, setSortBy] = useState<string>('-holdingValue')
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>(
    getArrayFromLocalStorageWithTTL<PendingOrder>('holdingUnCompleted') ?? [],
  )

  const [listFallbackPrices, setListFallbackPrices] = useState<TokenPrices[]>(
    getArrayFromLocalStorageWithTTL('tokenPricesData') ?? [],
  )

  const activeWallet = useSelector(_activeWallet)
  const userAddress = activeWallet?.walletAddress
  const priceNativeToken = useAppSelector(priceChain(activeWallet.chainType))

  const { data, page, hideModestBalance, sortBy, hideZeroBalance, isHiddenSmallPoll, isShowOnlyCurrentCurrency } =
    useAppSelector((state: RootState) => state.holding as HoldingState)

  const tokenAddress = useMemo(() => location.pathname.split('/').filter(Boolean).at(-1) || '', [location.pathname])

  const newPortfolio = useHoldingSubscription(userAddress, tokenAddress, activeWallet?.chainId)
  const msg = useWatchWalletTokenBalance({
    address: userAddress,
    token: tokenAddress,
    chainId: activeWallet?.chainId,
  })
  const orderSuccessSubs = useAppSelector(selectOrderUpdated)
  const orderFailSubs = useAppSelector(selectOrderSubmitFailed)
  const chainId = activeWallet?.chainId

  // Fetch portfolio from API
  const queryGetPortfolio = async () => {
    try {
      if (data?.length <= 0) dispatch(setLoading(true))
      if (!userAddress) return

      const isXStock = window.location.pathname.startsWith('/xstocks')

      const { data: res } = await gqlClient.query<PortfolioResponse>({
        query: getPortfolio,
        variables: {
          input: {
            chainId: activeWallet.chainId,
            userAddress: userAddress,
            limit: LIMIT_PAGE,
            page,
            hideSmallLiquidity: isHiddenSmallPoll,
            hideModestBalance: hideModestBalance,
            hideZeroBalance: hideZeroBalance,
            token: isShowOnlyCurrentCurrency ? tokenAddress : undefined,
            sortBy: sortBy,
            tag: isXStock ? 'XStock' : 'meme',
          },
        },
      })

      const fetched = res?.getPortfolio?.data ?? []
      if (fetched?.length > 0 && chainId) {
        const listTokenAddress = fetched.map((item) => item.token)
        const { data: tokenPricesData } = await gqlMeme2.query<GetPricesResponse>({
          query: getPrices,
          variables: {
            tokens: listTokenAddress,
            chainId,
          },
          fetchPolicy: 'no-cache',
        })
        if (tokenPricesData && tokenPricesData?.getPrices?.length > 0) {
          tokenPricesData?.getPrices?.forEach((itemPrice) => {
            const itemAppend = { ...itemPrice, id: itemPrice?.token }
            appendToLocalStorageArrayWithTTL('tokenPricesData', itemAppend, TTL_PORTFOLIO_STORAGE)
          })
          setListFallbackPrices((prev) => {
            return mergeById(prev, tokenPricesData.getPrices)
            // return [...prev, ...tokenPricesData.getPrices]
          })
        }
      }

      if (page === 1 && fetched?.length > 0) {
        saveToLocalStorageWithTTL<PortfolioDTO[]>('portfolio', fetched, TTL_PORTFOLIO_STORAGE)
      }
      if (page === 1) {
        if (pendingOrders?.length < 1) {
          dispatch(setData(fetched))
        } else {
          pendingOrders.forEach((order) => {
            mappeDataPendingOrder(order, fetched)
          })
        }
      } else {
        dispatch(setData([...data, ...fetched]))
      }

      dispatch(setHasMore(fetched.length === LIMIT_PAGE))
    } catch (err) {
      console.error(err)
    } finally {
      dispatch(setLoading(false))
      dispatch(setLoadingMore(false))
    }
  }

  // Merge portfolios by token & chainId and apply pendingOrders adjustments
  // const filterData = (data: PortfolioDTO[]) => {
  //   const map = new Map<string, PortfolioDTO>()
  //   const tokenChainKey = (token: string, chainId: number) => `${token}_${chainId}`

  //   // Clone input data and add pending orders that are not in data yet
  //   const combined = [...data]

  // for (const order of pendingOrders) {
  //   const exists = combined?.some((pf) => pf?.token === order?.baseAddress)
  //   if (!exists) {
  //     const newPortfolio = mapOrderToPortfolio(order, priceNativeToken)
  //     if (newPortfolio) {
  //       newPortfolio.isProcessing = true
  //       newPortfolio.isLastUpdated = false
  //       combined.unshift(newPortfolio)
  //     }
  //   }
  // }

  // Deduplicate by token & chainId
  //   for (const item of combined) {
  //     map.set(tokenChainKey(item?.token, item?.chainId), item)
  //   }

  //   // Convert map back to array
  //   let merged = Array.from(map.values())

  //   // Optional filter: only show current currency
  //   if (isShowOnlyCurrentCurrency && tokenAddress) {
  //     merged = merged.filter((item) => item.token === tokenAddress)
  //   }

  //   // Mark items in pendingOrders and adjust totalBaseAmount
  //   const pendingMap = new Map(pendingOrders.map((order) => [order?.baseAddress, order]))

  //   const adjusted = merged.map((item) => {
  //     return {
  //       ...item,
  //     }
  //   })
  //   return adjusted
  // }
  // const filteredData = useMemo(() => filterData(data), [data, isShowOnlyCurrentCurrency, tokenAddress])
  useEffect(() => {
    if (page !== 1) {
      dispatch(setPage(1))
    } else {
      queryGetPortfolio().catch(console.error)
    }
  }, [
    userAddress,
    tokenAddress,
    isHiddenSmallPoll,
    hideModestBalance,
    hideZeroBalance,
    isShowOnlyCurrentCurrency,
    sortBy,
    // page,
  ])

  useEffect(() => {
    queryGetPortfolio().catch(console.error)
  }, [page])

  // useEffect(() => {
  //   console.log('pendingOrders', pendingOrders)
  //   if (pendingOrders?.length < 1) return
  //   pendingOrders.forEach((order) => {
  //     mappeDataPendingOrder(order)
  //   })
  // }, [pendingOrders])
  // useEffect(() => {
  //   if (pendingOrders?.length < 1) return
  //   console.log('pendingOrders', pendingOrders)
  //   pendingOrders.forEach((order) => {
  //     const itemData = data.find((item) => item?.token === order?.baseAddress)
  //     console.log('itemData', itemData)
  //     if (itemData?.token) {
  //       const adjustedAmount =
  //         order?.baseAmount > 0
  //           ? Number(order?.baseAmount ?? 0)
  //           : (Number(order?.quoteAmount) * priceNativeToken) / Number(order?.openPrice || 1)

  //       const orderMapped = mapOrderToPortfolio(itemData, priceNativeToken)
  //       const newItemCalculated = {
  //         ...orderMapped,
  //         isProcessing: true,
  //         isLastUpdated: false,
  //         isFromPendingOrder: false,
  //         estimateOrderValue:
  //           (order?.estimateOrderValue ?? 0) +
  //           (order?.transactionType === TransactionType.Buy ? +adjustedAmount : -adjustedAmount),
  //       }

  //       const newData = [newItemCalculated, ...data.filter((item) => item?.token !== order?.baseAddress)]
  //       // dispatch(setData(data.map((item) => (item?.token === order?.baseAddress ? newItemCalculated : item))))
  //       dispatch(setData(newData))
  //     } else {
  //       const newPortfolio = mapOrderToPortfolio(order, priceNativeToken)

  //       const adjustedAmount =
  //         order?.baseAmount > 0
  //           ? Number(order?.baseAmount ?? 0)
  //           : (Number(order?.quoteAmount) * priceNativeToken) / Number(order?.openPrice || 1)

  //       if (newPortfolio) {
  //         newPortfolio.isProcessing = true
  //         newPortfolio.isLastUpdated = false
  //         newPortfolio.isFromPendingOrder = true
  //         newPortfolio.estimateOrderValue =
  //           order?.transactionType === TransactionType.Buy ? +adjustedAmount : -adjustedAmount
  //         dispatch(setData([newPortfolio, ...filteredData]))
  //         console.log('new data here: ', [newPortfolio, ...filteredData])
  //       }
  //     }
  //   })
  // }, [pendingOrders])

  useEffect(() => {
    // console.log('orderSuccessSubs:', orderSuccessSubs)
    if (orderSuccessSubs && orderSuccessSubs?.id && orderSuccessSubs?.status === Status.Confirmed) {
      removeItemFromLocalStorageArray('holdingUnCompleted', orderSuccessSubs?.id ?? '')
      setPendingOrders((prev) => prev.filter((item) => item.id !== orderSuccessSubs?.id))
      const itemData = data.find((item) => item?.token === orderSuccessSubs?.baseAddress)
      if (itemData?.token) {
        const newItemCalculated = {
          ...itemData,
          isProcessing: itemData?.isLastUpdated === true ? false : true,
          isLastUpdated: itemData?.isLastUpdated,
          lastTxTime: orderSuccessSubs?.updatedAt,
          isFromPendingOrder: false,
        }
        dispatch(
          setData(data.map((item) => (item?.token === orderSuccessSubs?.baseAddress ? newItemCalculated : item))),
        )
        dispatch(clearOrderUpdated())
      }
    }
  }, [orderSuccessSubs])

  useEffect(() => {
    // console.log('public/wallet_token/', newPortfolio)
    if (!newPortfolio) return
    const newItem = mapWalletTokenDataToPortfolio(newPortfolio)
    if (!newItem?.token) return

    // Check if the item should be skipped
    // const shouldSkip =
    //   (hideZeroBalance && Number(newItem.totalBaseAmount) === 0) ||
    //   (hideModestBalance && newItem.totalUsdValue < 10) ||
    //   (isHiddenSmallPoll && Number(newItem.liquidity) < 4000) ||
    //   (isShowOnlyCurrentCurrency && newItem.token !== tokenAddress)

    // if (shouldSkip) return
    const newData = data?.some((d) => d.token === newItem.token)
      ? data.map((item) =>
          item.token === newItem.token
            ? {
                ...item,
                avgMarketCap: newPortfolio.avgMarketCap,
                avgPriceUsd: newPortfolio.avgPriceUsd,
                totalBuyUsd: newPortfolio.totalBuyUsd,
                totalBuyQty: newPortfolio.totalBuyQty,
                totalSellUsd: newPortfolio.totalSellUsd,
                totalSellQty: newPortfolio.totalSellQty,
                realizedPnL: newPortfolio.realizedPnL,
                totalFeeUsd: newPortfolio.totalFeeUsd,
                totalFee: newPortfolio.totalFee,
                isProcessing: false,
                isLastUpdated: true,
              }
            : item,
        )
      : [newItem, ...data]
    dispatch(setData(newData))
  }, [newPortfolio])

  useEffect(() => {
    // console.log('public/wallet_token_balance/:', msg)
    if (!msg?.token || !msg?.balance) return
    if (!data?.some((item) => item.token === msg.token)) return
    const newData = data.map((item) =>
      item.token === msg.token
        ? { ...item, totalBaseAmount: msg.balance, isProcessing: false, estimateOrderValue: 0, isLastUpdated: true }
        : item,
    )
    dispatch(setData(newData))
  }, [msg])

  useEffect(() => {
    if (orderFailSubs && orderFailSubs?.order) {
      removeItemFromLocalStorageArray('holdingUnCompleted', `${orderFailSubs?.order?.id}`)
      setPendingOrders((prev) => prev.filter((item) => item.id !== orderFailSubs?.order?.id))
      const existingHolding = data.find((item) => item?.token === orderFailSubs?.order?.baseAddress)
      // console.log('orderFailSubs', orderFailSubs, data, existingHolding)
      //   // console.log('existingHolding:', existingHolding)
      if (existingHolding) {
        if (existingHolding?.isFromPendingOrder) {
          const newData = data.filter((item) => item.token !== existingHolding.token)
          dispatch(setData([...newData]))
        } else {
          const updatedHolding = {
            ...existingHolding,
            isProcessing: false,
            isLastUpdated: false,
            isFromPendingOrder: false,
            estimateOrderValue: 0,
          }
          const newData = data.map((item) => (item.token === existingHolding.token ? updatedHolding : item))
          dispatch(setData([...newData]))
          dispatch(clearOrderSubmitFailed())
        }
      }
    }
  }, [orderFailSubs])

  // useEffect(() => {
  //   removeFromLocalStorage('portfolio')
  //   removeFromLocalStorage('holdingUnCompleted')
  // }, [userAddress])

  const mappeDataPendingOrder = (order: PendingOrder, data: PortfolioDTO[]) => {
    const itemData = data.find((item) => item?.token === order?.baseAddress)
    if (itemData?.token) {
      const adjustedAmount =
        order?.transactionType === TransactionType.Sell
          ? new Decimal(order?.baseAmount ?? 0).toString()
          : // : (Number(order?.quoteAmount) * priceNativeToken) / Number(order?.openPrice || 1)
            new Decimal(order?.quoteAmount)
              .mul(priceNativeToken)
              .div(order?.openPrice || 1)
              .toString()
      const orderMapped = mapOrderToPortfolio({ ...order, ...itemData }, priceNativeToken)
      const newItemCalculated = {
        ...orderMapped,
        isProcessing: true,
        isLastUpdated: false,
        isFromPendingOrder: false,
        // estimateOrderValue:
        //   (itemData?.estimateOrderValue ?? 0) +
        //   (order?.transactionType === TransactionType.Buy ? adjustedAmount : -adjustedAmount),
        estimateOrderValue: new Decimal(itemData?.estimateOrderValue ?? 0)
          .add(order?.transactionType === TransactionType.Buy ? adjustedAmount : -adjustedAmount)
          .toString(),
      }

      const newData = [newItemCalculated, ...data.filter((item) => item?.token !== order?.baseAddress)]
      // dispatch(setData(data.map((item) => (item?.token === order?.baseAddress ? newItemCalculated : item))))
      dispatch(setData(newData as PortfolioDTO[]))
    } else {
      const newPortfolio = mapOrderToPortfolio(order, priceNativeToken)

      const adjustedAmount =
        order?.transactionType === TransactionType.Sell
          ? Number(order?.baseAmount ?? 0)
          : (Number(order?.quoteAmount) * priceNativeToken) / Number(order?.openPrice || 1)

      if (newPortfolio) {
        newPortfolio.isProcessing = true
        newPortfolio.isLastUpdated = false
        newPortfolio.isFromPendingOrder = true
        newPortfolio.estimateOrderValue =
          order?.transactionType === TransactionType.Buy ? +adjustedAmount : -adjustedAmount
        dispatch(setData([newPortfolio, ...data]))
      }
    }
  }

  useEffect(() => {
    if (pendingOrders?.length < 1) return
    pendingOrders.forEach((order) => {
      mappeDataPendingOrder(order, data)
    })
  }, [pendingOrders])
  useEffect(() => {
    const channel = new BroadcastChannel(EVENT_MESSAGE_ORDER_CREATED)
    const handleMessage = (event: MessageEvent) => {
      const order = event?.data?.data as PendingOrder
      const existPendingOrder = pendingOrders?.some((item) => item?.id === order?.id)
      if (!existPendingOrder) {
        setPendingOrders((prev) => [...prev, order])
      }
      // mappeDataPendingOrder(order, data)
    }
    channel.addEventListener('message', handleMessage)

    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
    }
  }, [priceNativeToken, pendingOrders, data])

  useEffect(() => {
    return () => {
      dispatch(setPage(1))
      removeFromLocalStorage('idMqttOrderUpdated')
    }
  }, [])

  return {
    filteredData: data,
    listFallbackPrices: listFallbackPrices,
  }
}
