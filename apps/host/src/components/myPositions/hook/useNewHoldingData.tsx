import { useState, useEffect, useMemo, useRef } from 'react'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import {
  appendToLocalStorageArrayWithTTL,
  getArrayFromLocalStorageWithTTL,
  removeFromLocalStorage,
  saveToLocalStorageWithTTL,
} from '@/utils/storage'
import { Order, Status } from '@/@generated/gql/graphql-trading'
import { GetPricesResponse, PortfolioResponse, TokenPrices } from '@/types/responses'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { gqlClient, gqlMeme2 } from '@/lib/gql/apollo-client'
import { getPortfolio, getPrices } from '@/services/tokens.service'
import { TTL_PORTFOLIO_STORAGE } from '@/const/configs'
import { PortfolioDTO } from '@/types/holding'
import { priceChain } from '@/redux/modules/price.slice'
import {
  cleanupTempHoldings,
  HoldingState,
  setCurrentData,
  setData,
  setHasMore,
  setListPendingOrders,
  setLoading,
  setloadingCurrent,
  setLoadingMore,
  setPage,
  updateMergedCurrentPortfolio,
  updateMergedPortfolio,
} from '@/redux/modules/holding.slice.ts'
import useGetUncompletedOrders from '@/hooks/useGetUncompletedOrders'
import dayjs from 'dayjs'
import { PortfolioAddressMetadata } from '@/@generated/gql/graphql-core'
import { EVENT_MESSAGE_ORDER_CREATED } from '@/components/orderForm'
import { useSubscription } from '@/lib/mqtt'
import { _userInfo } from '@/redux/modules/newAuth.slice'

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

export const useNewHoldingData = () => {
  const dispatch = useAppDispatch()
  const [listFallbackPrices, setListFallbackPrices] = useState<TokenPrices[]>(
    getArrayFromLocalStorageWithTTL('tokenPricesData') ?? [],
  )
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>(
    getArrayFromLocalStorageWithTTL<PendingOrder>('holdingUnCompleted') ?? [],
  )

  const [dataMetaData, setDataMetaData] = useState<PortfolioAddressMetadata>()
  const activeWallet = useSelector(_activeWallet)
  const userAddress = activeWallet?.walletAddress
  const chainId = activeWallet?.chainId
  const priceNativeToken = useAppSelector(priceChain(activeWallet.chainType))
  const isXStock = window.location.pathname.startsWith('/xstocks')
  const {
    data,
    currentData,
    page,
    hideModestBalance,
    sortBy,
    hideZeroBalance,
    isHiddenSmallPoll,
    isShowOnlyCurrentCurrency,
    listPendingOrders,
    mergedPortfolio,
    shadowHoldingUpdates,
    mergedCurrentPortfolio,
  } = useAppSelector((state: RootState) => state.holding as HoldingState)
  const userId = useSelector(_userInfo)?.userId
  const tokenAddress = useMemo(() => location.pathname.split('/').filter(Boolean).at(-1) || '', [location.pathname])
  //Get list orders uncomplete
  const [fromTime, setFromTime] = useState(() => {
    return dayjs().subtract(30, 'minute').valueOf()
  })
  const { data: dataUnCompleteOrder } = useGetUncompletedOrders({
    userAddress: userAddress,
    isXStock: isXStock,
    fromTime: fromTime,
    // status: Status.Pending
  })

  useEffect(() => {
    if (dataUnCompleteOrder && dataUnCompleteOrder?.orders) {
      dispatch(setListPendingOrders([...pendingOrders, ...dataUnCompleteOrder?.orders]))
    }
  }, [dataUnCompleteOrder])

  // Fetch portfolio from API
  const queryGetPortfolio = async () => {
    try {
      if (data?.length <= 0) dispatch(setLoading(true))
      if (!userAddress) return

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
      const metaData = res?.getPortfolio?.addressMetadata ?? {}
      setDataMetaData(metaData)

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
        dispatch(setData(fetched))
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

  const queryGetCurrentPortfolio = async () => {
    try {
      if (!userAddress) return
      dispatch(setloadingCurrent(true))
      const { data: res } = await gqlClient.query<PortfolioResponse>({
        query: getPortfolio,
        variables: {
          input: {
            chainId: activeWallet.chainId,
            userAddress: userAddress,
            hideSmallLiquidity: false,
            hideModestBalance: false,
            hideZeroBalance: false,
            token: tokenAddress,
            tag: isXStock ? 'XStock' : 'meme',
          },
        },
        fetchPolicy: 'no-cache',
      })

      const fetched = res?.getPortfolio?.data ?? []
      dispatch(setCurrentData(fetched))
      dispatch(setloadingCurrent(false))
    } catch (err) {
      console.error(err)
    } finally {
    }
  }

  const ranOnceRef = useRef(false)
  useEffect(() => {
    if (ranOnceRef.current) {
      return
    }
    if (dataMetaData && listPendingOrders) {
      const listPendingOrderUncompleted = filterCompletedTransactions(dataMetaData, listPendingOrders)
      dispatch(setListPendingOrders(listPendingOrderUncompleted))
      ranOnceRef.current = true
    }
  }, [dataMetaData, listPendingOrders])

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

  useEffect(() => {
    queryGetCurrentPortfolio().catch(console.error)
  }, [userAddress, tokenAddress])

  function filterCompletedTransactions(a: PortfolioDTO | PortfolioAddressMetadata | undefined, b: PendingOrder[]) {
    const completedTxSet = new Set(a?.completedTxs)

    const filteredList = b.filter((item) => {
      return !completedTxSet.has(item?.txid)
    })

    return filteredList
  }

  const { message: _orderMessageUpdated } = useSubscription(`users/${userId}/order_updated`, {
    clientOptions: {
      qos: 1,
    },
    shouldSkip: !userId,
  })

  useEffect(() => {
    if (!_orderMessageUpdated || !userId) return

    try {
      const message = _orderMessageUpdated?.message
      const data = JSON.parse(message?.toString() || '')
      if (data && data?.id && (data?.status === Status.Confirmed || data?.status === Status.Completed)) {
        const findItem = listPendingOrders.find((item: PendingOrder) => item?.id === data?.id)
        if (!findItem) return
        const listPendingOrdersUpdated = listPendingOrders.map((item: PendingOrder) => {
          if (item?.id === data?.id) {
            return { ...item, ...data }
          }
          return item
        })
        dispatch(setListPendingOrders(listPendingOrdersUpdated))

        const itemData = mergedPortfolio?.find((item) => item?.token === data?.baseAddress)
        if (itemData) {
          const isHadCompletedTxs = itemData?.completedTxs?.includes(data?.txid)
          const isHadRelatedTxHashes = itemData?.relatedTxHashes?.includes(data?.txid)
          if (isHadCompletedTxs && isHadRelatedTxHashes) {
            dispatch(setListPendingOrders(listPendingOrdersUpdated.filter((item) => item.id !== data?.id)))
          }
        }
      }
    } catch (error) {
      console.warn('_orderMessageUpdated error: ', error)
    }
  }, [_orderMessageUpdated])

  const { message: _orderMessageFailed } = useSubscription(`users/${userId}/order_submit_failed`, {
    clientOptions: {
      qos: 1,
    },
    shouldSkip: !userId,
  })

  useEffect(() => {
    if (!_orderMessageFailed || !userId) return

    try {
      const message = _orderMessageFailed?.message
      const data = JSON.parse(message?.toString() || '')

      if (data && data?.order) {
        const findItem = listPendingOrders.find((item: PendingOrder) => item?.id === data?.order?.id)
        if (!findItem) return
        const listPendingOrdersFilter = listPendingOrders.filter((item: PendingOrder) => item?.id !== data?.order?.id)
        dispatch(setListPendingOrders(listPendingOrdersFilter))
      }
    } catch (error) {
      console.warn('_orderMessageFailed error: ', error)
    }
  }, [_orderMessageFailed])

  useEffect(() => {
    const channel = new BroadcastChannel(EVENT_MESSAGE_ORDER_CREATED)
    const handleMessage = (event: MessageEvent) => {
      const order = event?.data?.data as PendingOrder
      dispatch(setListPendingOrders([order, ...listPendingOrders]))
    }
    channel.addEventListener('message', handleMessage)

    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
    }
  }, [listPendingOrders])

  useEffect(() => {
    return () => {
      dispatch(setPage(1))
      removeFromLocalStorage('idMqttOrderUpdated')
    }
  }, [])

  useEffect(() => {
    dispatch(
      updateMergedPortfolio({
        priceNativeToken: priceNativeToken,
        chainId: chainId,
        shadowHoldingUpdates,
      }),
    )
  }, [data, listPendingOrders, chainId, shadowHoldingUpdates, dispatch])

  // console.log('mergedPortfolio', mergedPortfolio)
  //Logic Current Token
  useEffect(() => {
    dispatch(
      updateMergedCurrentPortfolio({
        priceNativeToken: priceNativeToken,
        chainId: chainId,
        shadowHoldingUpdates,
      }),
    )
  }, [currentData, listPendingOrders, chainId, shadowHoldingUpdates, dispatch])

  useEffect(() => {
    dispatch(cleanupTempHoldings([]))
  }, [])

  return {
    currentData: mergedCurrentPortfolio,
    filteredData: mergedPortfolio,
    listFallbackPrices: listFallbackPrices,
  }
}
