import { useSubscription } from '@/lib/mqtt'
import { IMessage } from '@/lib/mqtt/types'
import { useAppDispatch } from '@/redux/store'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Order } from '@/@generated/gql/graphql-trading'
import {
  updateFillWeb3OrderFailed,
  updateOrderSubmitFailed,
  updateOrderUpdated,
} from '@/redux/modules/ordersSubscription.slice.ts'
import useShowToastOrder from '@/hooks/useShowToastOrder'
import { useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import eventBus from '@/lib/eventBus.ts'
import { REFETCH_PENDING_ORDERS, REMOVE_FAILED_ITEM } from '@/lib/eventMessages.ts'
import { removeItemFromLocalStorageArray } from '@/utils/storage.ts'

const OrdersSubscription: React.FC = () => {
  const dispatch = useAppDispatch()
  const userId = useSelector(_userInfo)?.userId
  const { showToastSubmittedSuccessOrder, showToastSubmittedFailOrder, newHiddenToastProcessOrder } =
    useShowToastOrder()

  const commonOptions = useMemo(
    () => ({
      clientOptions: {
        qos: 1 as const,
      },
      shouldSkip: !userId,
    }),
    [userId],
  )

  // Split subscriptions to handle topics individually
  const { message: msgOrderUpdated } = useSubscription(
    userId ? `users/${userId}/order_updated` : '',
    commonOptions,
  )
  const { message: msgSubmitFailed } = useSubscription(
    userId ? `users/${userId}/order_submit_failed` : '',
    commonOptions,
  )
  const { message: msgFillWeb3Failed } = useSubscription(
    userId ? `users/${userId}/fill_web3_order_failed` : '',
    commonOptions,
  )
  const { message: msgOrderConfirmation } = useSubscription(
    userId ? `users/${userId}/order_confirmation` : '',
    commonOptions,
  )

  const processMessage = useCallback(
    (_orderMessage: IMessage | undefined) => {
      if (!_orderMessage || !userId) return

      const _messageTopic = _orderMessage?.topic

      try {
        const message = _orderMessage?.message
        const data = JSON.parse(message?.toString() || '')

        if (_messageTopic?.includes('/order_confirmation')) {
          if (data?.commitment === 'proceed' && !data?.err) {
            newHiddenToastProcessOrder(data)
            showToastSubmittedSuccessOrder(data as Order)
          }
          return
        }

        if (_messageTopic?.includes('/order_updated')) {
          dispatch(updateOrderUpdated(data))
          removeItemFromLocalStorageArray('holdingUnCompleted', `${data?.id}`)

          eventBus.dispatch(REFETCH_PENDING_ORDERS, {
            data: {
              needRefetch: true,
            },
          })

          return
        }

        if (_messageTopic?.includes('/order_submit_failed')) {
          dispatch(updateOrderSubmitFailed(data))
          newHiddenToastProcessOrder(data)
          showToastSubmittedFailOrder(data?.code, data?.order)
          eventBus.dispatch(REMOVE_FAILED_ITEM, {
            data: {
              id: data?.order?.id,
            },
          })
          removeItemFromLocalStorageArray('holdingUnCompleted', `${data?.order?.id}`)
          return
        }

        if (_messageTopic?.includes('/fill_web3_order_failed')) {
          dispatch(updateFillWeb3OrderFailed(data))
          return
        }
      } catch (error) {
        console.warn('_orderMessage error: ', error)
      }
    },
    [userId, dispatch, newHiddenToastProcessOrder, showToastSubmittedSuccessOrder, showToastSubmittedFailOrder],
  )

  // Use a ref to keep track of the latest processMessage function
  // This allows us to use it in useEffect without adding it to the dependency array
  // preventing re-execution when standard hooks (like useShowToastOrder) cause re-renders
  const processMessageRef = React.useRef(processMessage)

  useEffect(() => {
    processMessageRef.current = processMessage
  }, [processMessage])

  useEffect(() => {
    if (msgOrderUpdated) processMessageRef.current(msgOrderUpdated)
  }, [msgOrderUpdated])

  useEffect(() => {
    if (msgSubmitFailed) processMessageRef.current(msgSubmitFailed)
  }, [msgSubmitFailed])

  useEffect(() => {
    if (msgFillWeb3Failed) processMessageRef.current(msgFillWeb3Failed)
  }, [msgFillWeb3Failed])

  useEffect(() => {
    if (msgOrderConfirmation) processMessageRef.current(msgOrderConfirmation)
  }, [msgOrderConfirmation])

  return <></>
}

export default OrdersSubscription
