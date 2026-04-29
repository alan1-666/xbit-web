import { useSubscription } from '@/lib/mqtt'
import { useEffect, useState } from 'react'

export type UseTokenPriceChangeOptions = {
  address?: string
  defaultValue?: string
}

export const useTokenPriceChange = (options: UseTokenPriceChangeOptions) => {
  const { address, defaultValue } = options
  const [tokenPrice, setNewTokenPrice] = useState(defaultValue)
  const { message: mqttMessage } = useSubscription(`public/prices/usd/${address}`, {
    shouldSkip: !address,
  })

  useEffect(() => {
    if (!mqttMessage || !mqttMessage.message) return
    const payload = JSON.parse(mqttMessage.message.toString())
    if (payload && payload.usd_price) {
      setNewTokenPrice(payload.usd_price)
    }
  }, [mqttMessage])
  return tokenPrice
}

export const usePriceOHLC = (options: UseTokenPriceChangeOptions) => {
  const { address, defaultValue } = options
  const [tokenPrice, setNewTokenPrice] = useState(defaultValue)
  const { message: mqttMessage } = useSubscription(`public/kline/ohlc_1m/${address}`, {
    shouldSkip: !address,
  })

  useEffect(() => {
    setNewTokenPrice(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    if (!mqttMessage || !mqttMessage.message) return
    const payload = JSON.parse(mqttMessage.message.toString())
    if (payload && payload.c) {
      setNewTokenPrice(payload.c)
    }
  }, [mqttMessage])

  return tokenPrice
}
