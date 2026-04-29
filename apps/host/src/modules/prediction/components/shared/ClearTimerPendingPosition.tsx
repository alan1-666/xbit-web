import { removePendingOrder, selectAllPendingOrders } from '@/redux/modules/pendingOrders.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useEffect } from 'react'

const CLEAR_PENDING_ORDER_TIME = 30000

const ClearTimerPendingPosition = () => {
  const pendingOrders = useAppSelector(selectAllPendingOrders)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []

    pendingOrders.forEach((order) => {
      const timeElapsed = Date.now() - order.createdAt
      const timeLeft = Math.max(0, CLEAR_PENDING_ORDER_TIME - timeElapsed)

      const timeout = setTimeout(() => {
        dispatch(removePendingOrder(order.orderId))
      }, timeLeft)

      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [pendingOrders, dispatch])

  return <></>
}

export default ClearTimerPendingPosition
