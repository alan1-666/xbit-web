import useSubscription from '@/lib/mqtt/useSubscription'
import { priceActions } from '@/redux/modules/price.slice'
import { useAppDispatch } from '@/redux/store'
import { useEffect } from 'react'

export default function PriceToUSDSubscription() {
  const dispatch = useAppDispatch()

  const _message = useSubscription('public/price/usd')
  const message = _message?.message?.message

  useEffect(() => {
    if (!message) return
    try {
      const data = JSON.parse(message.toString() || '')

      dispatch(priceActions.updateListPrices(data))
    } catch (error) {
      console.warn('WalletBalanceSubscription error: ', error)
    }
  }, [message])

  return <></>
}
