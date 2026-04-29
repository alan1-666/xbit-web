import { useSubscription } from '@/lib/mqtt'
import { useAppDispatch } from '@/redux/store'
import { useEffect } from 'react'
import { updateLastTransactionUpdated } from '@/redux/modules/lastTransactionSubscription.slice.ts'

interface LastTransactionSubscriptionProps {
  baseAddress?: string
}

const LastTransactionSubscription: React.FC<LastTransactionSubscriptionProps> = ({ baseAddress }) => {
  const dispatch = useAppDispatch()

  const { message: _lastTransactionMessage } = useSubscription(
    `public/last_transaction_updated/${baseAddress}`,
    {
      shouldSkip: !baseAddress,
    }
  )

  useEffect(() => {
    if (!_lastTransactionMessage || !baseAddress) return

    try {
      const message = _lastTransactionMessage?.message
      const data = JSON.parse(message?.toString() || '')

      if (data) {
        dispatch(updateLastTransactionUpdated(data))
        return
      }
    } catch (error) {
      console.warn('_lastTransactionMessage error: ', error)
    }
  }, [_lastTransactionMessage, baseAddress])

  return <></>
}

export default LastTransactionSubscription
