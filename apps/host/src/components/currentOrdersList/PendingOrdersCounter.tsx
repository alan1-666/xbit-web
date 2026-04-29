import { useQuery } from '@apollo/client'
import { countPendingOrders } from '@services/order.service.ts'
import { tradingClient } from '@/lib/gql/apollo-client.ts'
import { memo, useEffect } from 'react'
import { useAppDispatch } from '@/redux/store'
import { updateTotalPendingOrders } from '@/redux/modules/pendingOrders.slice.ts'
import { REFETCH_PENDING_ORDERS } from '@/lib/eventMessages.ts'
import eventBus from '@/lib/eventBus.ts'
import { useActiveChainType } from '@/hooks/useActiveChain'
import { useIsXStockPath } from '@/hooks/xstock/useIsXStockPath'

interface PendingOrdersCounterProps {
  userAddress?: string
}

const PendingOrdersCounter = ({ userAddress }: PendingOrdersCounterProps) => {
  const dispatch = useAppDispatch()
  const activeChainType = useActiveChainType()
  const isXStockPath = useIsXStockPath()
  
  const { data: dataCountPendingOrders, refetch: reCountPendingOrders } = useQuery(countPendingOrders, {
    skip: !userAddress,
    client: tradingClient,
    variables: {
      input: {
        userAddress,
        chain: activeChainType,
        isXStock: isXStockPath,
      },
    },
  })

  useEffect(() => {
    if (dataCountPendingOrders) {
      const totalPendingOrders = dataCountPendingOrders?.getPendingOrders?.total ?? 0
      dispatch(updateTotalPendingOrders(totalPendingOrders))
    }
  }, [dataCountPendingOrders])

  useEffect(() => {
    eventBus.on(REFETCH_PENDING_ORDERS, (data: any) => {
      const needRefetch = data?.data?.needRefetch
      if (needRefetch) {
        reCountPendingOrders().catch(console.error)
      }
    })
    return () => {
      eventBus.remove(REFETCH_PENDING_ORDERS)
    }
  }, [])

  return <></>
}

export default memo(PendingOrdersCounter)
