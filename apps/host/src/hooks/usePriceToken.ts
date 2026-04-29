import { useEffect, useState } from 'react'
import { useSubscription } from '@/lib/mqtt'

export const usePriceToken = (address: string) => {
  const [price, setPrice] = useState()
  const { message } = useSubscription(`public/kline/ohlc_1m/${address}`, {
    shouldSkip: !address,
  })
  useEffect(() => {
    const msg = message?.message?.toString()
    if (msg) {
      const data = JSON.parse(msg)
      setPrice(data?.c)
    }
  }, [message])
  return { price }
}
