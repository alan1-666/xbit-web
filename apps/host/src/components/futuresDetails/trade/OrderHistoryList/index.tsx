import Container from '@components/common/Container.tsx'
import { useState, useMemo, useEffect } from 'react'
import OrderHistoryCard from './OrderHistoryCard'
import OrderHistoryFilter from './OrderHistoryFilter'
import { useQuery } from '@tanstack/react-query'
import { getPerpUserHistoryTrades } from '@/api/hyperliquid'
import { IconEmpty } from '@/components/icon'
import { Skeleton } from '@components/ui/skeleton'
import { OrderSide, All } from '../types'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import ls from '@/lib/local-storage.ts'


export type OrdersListFilter = {
  showOnlyBaseCoin: boolean
  side?: OrderSide | All
}

interface CurrentOrdersListProps {
  baseCoin?: string
  isActiveCardList?: boolean
}

const ListCardSkeleton = () => (
  <div className="mt-2.5 space-y-1.5">
    {Array.from({ length: 2 }).map((_, i) => (
      <Skeleton key={i} className="h-40" />
    ))}
  </div>
)

const OrderHistoryList = ({ baseCoin, isActiveCardList }: CurrentOrdersListProps) => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<OrdersListFilter>({
    showOnlyBaseCoin: !!ls.get('futures_order_history_is_show_base_coin'),
    side: 'All',
  })
  const walletDex = useSelector(_walletDex)

  const userAddress = walletDex?.walletAddress
  const isLogin =  useCheckLoginOnArb()

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['history_orders', userAddress],
    queryFn: () => getPerpUserHistoryTrades(userAddress!),
    enabled: isLogin,
    select: (rawOrders) => {
      return rawOrders.map((item: any) => {
        if (item.dir === 'Long > Short') item.dir = 'Open Short'
        if (item.dir === 'Short > Long') item.dir = 'Open Long'
        return item
      })/* .filter((item: any) => {
        return ['Close Long', 'Close Short', 'Open Long', 'Open Short'].indexOf(item.dir) > -1
      }) */
    },
  })

  const filterOrders = useMemo(() => {
    if (filter.side === 'All' && !filter.showOnlyBaseCoin) {
      return orders
    }

    return orders.filter((item: any) => {
      return (item.dir === filter.side || filter.side === 'All') && (!filter.showOnlyBaseCoin || baseCoin === item.coin)
    })
  }, [filter, orders, baseCoin])

  useEffect(() => {
    if (isActiveCardList) {
      refetch()
    }
  }, [isActiveCardList, refetch])

   useEffect(() => {
    ls.set('futures_order_history_is_show_base_coin', filter.showOnlyBaseCoin)
  }, [filter.showOnlyBaseCoin])

  return (
    <Container className="mt-[10px]">
      <OrderHistoryFilter filter={filter} setFilter={setFilter} />

      {(!isLogin || isError || (!isLoading && filterOrders?.length === 0)) && (
        <div className="flex flex-col items-center justify-center h-80">
          <IconEmpty />
          <span className="text-[#FFFFFF80] text-[0.75rem]">{t('futuresDetails.tips.noData')}</span>
        </div>
      )}
      {isLogin && isLoading && !isError && <ListCardSkeleton />}

      <div className="flex flex-col gap-2 pb-[200px]">
        {filterOrders.map((order: any, idx: any) => (
          <OrderHistoryCard key={idx} orderInfo={order} />
        ))}
      </div>
    </Container>
  )
}

export default OrderHistoryList
