import { useEffect, useState } from 'react'
import eventBus from '@/lib/eventBus.ts'
import { EVENT_MESSAGE_OHLC_UPDATED } from '@/datafeeds/dataUpdater.ts'

interface UseCurrentPriceOptions {
  initialPrice?: string
  tokenAddress?: string
}

export const useCurrentPrice = (options: UseCurrentPriceOptions) => {
  const { initialPrice, tokenAddress } = options
  const [currentPrice, setCurrentPrice] = useState(0)

  useEffect(() => {
    if (initialPrice) {
      setCurrentPrice(initialPrice ? parseFloat(initialPrice) : 0)
    }
  }, [initialPrice, tokenAddress])

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_OHLC_UPDATED, (data: any) => {
      if (data?.data) {
        setCurrentPrice(data?.data.close)
      }
    })
    return () => {
      eventBus.remove(EVENT_MESSAGE_OHLC_UPDATED)
    }
  }, [])
  return currentPrice
}
