import Container from '@components/common/Container.tsx'
import CurrentOrdersFilter from '@/components/currentOrdersList/CurrentOrdersFilter'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Skeleton } from '../ui/skeleton'
import { IconEmpty } from '../icon'
import { Order, OrderSortField, OrderType, SortDirection, TransactionType } from '@/@generated/gql/graphql-trading'
import CurrentOrderCard from '@/components/currentOrdersList/CurrentOrderCard'
import { useAppSelector } from '@/redux/store'
import eventBus from '@/lib/eventBus.ts'
import { REFETCH_PENDING_ORDERS } from '@/lib/eventMessages.ts'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import TableCurrentOrders from './TableCurrentOrders'
import { ChainIds } from '@/types/enums'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { getManyToken } from '@services/tokens.service.ts'
import { useIsXStockPath } from '@hooks/xstock/useIsXStockPath.ts'
import { useMaxHeightInGridLayout } from '@hooks/useMaxHeightInGridLayout.ts'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { usePendingOrders } from '@hooks/usePendingOrders.ts'
import { LIMIT_PER_PAGE } from '@const/smartMoney.ts'
import { selectOrderUpdated } from '@/redux/modules/ordersSubscription.slice.ts'

export type OrdersListFilterTransactionType = 'all' | TransactionType
export type OrdersListFilterOrderType = 'all' | OrderType

export type OrdersListFilter = {
  transactionType?: OrdersListFilterTransactionType
  baseAddress?: string
  limit?: number
  offset?: number
  fromTime?: number
  toTime?: number
  orderType?: OrdersListFilterOrderType
  sortDir?: SortDirection
  sortField?: OrderSortField
}

interface CurrentOrdersListProps {
  currentToken?: string
}

const CurrentOrdersList: React.FC<CurrentOrdersListProps> = ({ currentToken }) => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()

  const activeWallet = useSelector(_activeWallet)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const address = activeWallet?.walletAddress
  const orderUpdated = useAppSelector(selectOrderUpdated)

  const isXStockPath = useIsXStockPath()

  // keep only filter cached in sessionStorage (optional)
  const cachedFilter: OrdersListFilter = useMemo(() => {
    const raw = sessionStorage.getItem('cachedPendingOrdersFilter')
    const parsed = raw ? JSON.parse(raw) : { limit: LIMIT_PER_PAGE }
    if (parsed?.baseAddress && parsed?.baseAddress !== currentToken) {
      delete parsed.baseAddress
      sessionStorage.setItem('cachedPendingOrdersFilter', JSON.stringify(parsed))
    }
    return parsed
  }, [currentToken])

  const [filter, setFilter] = useState<OrdersListFilter>(cachedFilter)

  const updateFilter = useCallback((next: OrdersListFilter) => {
    sessionStorage.setItem('cachedPendingOrdersFilter', JSON.stringify(next))
    setFilter(next)
  }, [])

  const { orders, isLoading, refetchPendingOrders } = usePendingOrders({
    address,
    activeChain,
    filter,
    isXStockPath,
  })

  useEffect(() => {
    const handler = (payload: any) => {
      const needRefetch = payload?.data?.needRefetch
      if (needRefetch) {
        refetchPendingOrders?.()
      }
    }

    eventBus.on(REFETCH_PENDING_ORDERS, handler)
    return () => {
      eventBus.remove(REFETCH_PENDING_ORDERS)
    }
  }, [refetchPendingOrders])

  useEffect(() => {
    let isMounted = true
    if (isMounted) refetchPendingOrders().catch(console.error)

    return () => {
      isMounted = false
    }
  }, [orderUpdated])

  const [manyTokenData, setManyTokenData] = useState<any[]>([])

  const tokenAddresses = useMemo(() => {
    const list = (orders ?? []).map((o: Order) => o.baseAddress).filter(Boolean)
    return Array.from(new Set(list)).slice(0, 200) // guard, in case huge
  }, [orders])

  const chainIdForOrders = useMemo(() => {
    return (orders?.[0]?.chainId as unknown as number) || ChainIds.Solana
  }, [orders])

  useEffect(() => {
    let cancelled = false
    if (!tokenAddresses.length) {
      setManyTokenData([])
      return
    }

    const run = async () => {
      const response = await gqlClient.query({
        query: getManyToken,
        fetchPolicy: 'cache-first',
        variables: {
          input: {
            tokens: tokenAddresses,
            chainId: Number(chainIdForOrders),
          },
        },
      })

      const raw = response?.data?.getManyToken
      if (!raw || cancelled) return

      const mapped = raw.map((token: any) => ({
        symbol: token.symbol,
        address: token.address,
        totalSupply: token.totalSupply,
        decimals: token.decimals,
      }))

      if (!cancelled) setManyTokenData(mapped)
    }

    run().catch(console.error)

    return () => {
      cancelled = true
    }
  }, [tokenAddresses, chainIdForOrders])

  const totalSupply = useCallback(
    (addr: string) => {
      if (!manyTokenData?.length) return '--'
      const token = manyTokenData.find((t: any) => t.address === addr)
      if (!token) return '--'
      return token.totalSupply / Math.pow(10, token.decimals)
    },
    [manyTokenData],
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const maxHeight = useMaxHeightInGridLayout({ containerRef, padding: 110 })

  useEffect(() => {
    containerRef.current = document.getElementById('meme-bottom-tabs') as HTMLDivElement
  }, [])

  return (
    <Container className="mt-2 lg:mt-4 lg:px-0">
      <CurrentOrdersFilter filter={filter} setFilter={updateFilter} currentToken={currentToken} />

      <div className="flex flex-col">
        {(!orders || orders.length === 0) && isLoading && (
          <div className="space-y-[5px]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton className="h-[167px]" key={index} />
            ))}
          </div>
        )}

        {/* Empty state (mobile) */}
        <div className="block pc:hidden">
          {!isLoading && (!orders || orders.length === 0) && (
            <div className="flex flex-col items-center justify-center h-80">
              <IconEmpty />
              <span className="text-[#FFFFFF80] text-[0.75rem] max-w-[360px] text-center">
                {t('currentOrdersList.noData')}
              </span>
            </div>
          )}
        </div>

        <div>
          {isDesktop ? (
            <div className="overflow-y-auto relative" style={{ maxHeight }}>
              <TableCurrentOrders
                pendingOrders={orders || []}
                refetch={refetchPendingOrders}
                manyTokenData={manyTokenData}
                filter={filter}
                setFilter={setFilter}
              />
            </div>
          ) : (
            orders &&
            orders.length > 0 && (
              <div className="space-y-2">
                {orders.map((order: Order) => (
                  <CurrentOrderCard
                    key={order.id}
                    order={{
                      ...order,
                      totalSupply: manyTokenData.length ? totalSupply(order.baseAddress) : 0,
                    }}
                    refetch={refetchPendingOrders}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </Container>
  )
}

export default CurrentOrdersList
