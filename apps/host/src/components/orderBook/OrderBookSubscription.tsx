import { useSubscription } from '@/lib/mqtt'
import { useEffect, useRef } from 'react'
import { LastTransaction } from '@/@generated/gql/graphql-core.ts'
import { useAppDispatch } from '@/redux/store'
import { updateOrderBook } from '@/redux/modules/orderBookSubscription.slice.ts'
import {useActiveChainId} from "@hooks/useActiveChain.ts";

type OrderBookSubscriptionProps = {
  tokenAddress?: string
}

const OrderBookSubscription = ({ tokenAddress }: OrderBookSubscriptionProps) => {
  const dispatch = useAppDispatch()
  const transactionBufferRef = useRef<LastTransaction[]>([])
  const activeChainId = useActiveChainId()

  const { message: transactionMessage } = useSubscription(`public/transaction/new/${activeChainId}/${tokenAddress}`, {
    shouldSkip: !tokenAddress,
    clientOptions: { qos: 0 },
  })

  // Collect new transactions in a buffer
  useEffect(() => {
    if (!transactionMessage) return

    try {
      const messageStr = transactionMessage.message?.toString()
      const newTransactions: LastTransaction[] = messageStr ? JSON.parse(messageStr) : []

      if (Array.isArray(newTransactions) && newTransactions.length > 0) {
        transactionBufferRef.current.push(...newTransactions)
      }
    } catch (error) {
      console.error('Failed to parse transaction message:', error)
    }
  }, [transactionMessage])

  // Dispatch every 500ms if buffer has data
  useEffect(() => {
    const interval = setInterval(() => {
      const buffer = transactionBufferRef.current
      if (buffer.length > 0) {
        const transactionsToDispatch = [...buffer]
        transactionBufferRef.current = []
        dispatch(updateOrderBook(transactionsToDispatch))
      }
    }, 500)

    return () => clearInterval(interval)
  }, [dispatch])

  return null
}

export default OrderBookSubscription
