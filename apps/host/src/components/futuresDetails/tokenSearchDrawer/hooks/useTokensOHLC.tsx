import { useSubscription } from '@/lib/mqtt'
import { TokenTrending } from '@/types/token'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'

const useTokensOHLC = (tokens: TokenTrending[]) => {
  const [ohlcData, setOhlcData] = useState<{ [key: string]: any }>({})
  const queueRef = useRef<any[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const maxBatchSize = 10
  const maxWait = 800

  const topics = useMemo(
    () => tokens.map((token) => `public/kline/ohlc_1d/${token.token}`),
    [tokens.map((t) => t.token).join(',')],
  )

  const { message } = useSubscription(topics, {
    shouldSkip: tokens.length === 0,
  })

  const processBatch = useCallback((batchMessages: any[]) => {
    const updates: { [key: string]: any } = {}

    batchMessages.forEach((messageData) => {
      if (!messageData || !messageData.topic) return

      const topicMatch = messageData.topic.match(/public\/kline\/ohlc_1d\/(.+)$/)

      if (topicMatch) {
        const tokenAddress = topicMatch[1]
        const msgString = messageData.message?.toString()

        if (msgString) {
          try {
            const data = JSON.parse(msgString)

            const currentPrice = parseFloat(data.c)
            const openPrice = parseFloat(data.o)
            const price24hChange = openPrice !== 0 ? ((currentPrice - openPrice) / openPrice) * 100 : 0

            if (tokenAddress === '2mXHsN9sLkr3BLvsGZfpjp5uwaXeZDhjZ5WmfwnWk6He') {
              console.log(
                { price: data.c, openPrice24h: data.o, precent: price24hChange, time: dayjs().format('HH:mm:ss') },
                'msgString',
              )
            }

            updates[tokenAddress] = {
              price: currentPrice,
              price24hChange,
            }
          } catch (error) {
            console.error('Error parsing OHLC data:', error)
          }
        }
      }
    })

    if (Object.keys(updates).length > 0) {
      setOhlcData((prev) => ({ ...prev, ...updates }))
    }
  }, [])

  // Flush batch function
  const flushBatch = useCallback(() => {
    if (queueRef.current.length > 0) {
      processBatch(queueRef.current)
      queueRef.current = []
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [processBatch])

  const addToBatch = useCallback(
    (messageData: any) => {
      queueRef.current.push(messageData)

      if (queueRef.current.length >= maxBatchSize) {
        flushBatch()
      } else if (!timerRef.current) {
        timerRef.current = setTimeout(flushBatch, maxWait)
      }
    },
    [flushBatch, maxBatchSize, maxWait],
  )

  useEffect(() => {
    if (message) {
      addToBatch(message)
    }
  }, [message, addToBatch])

  useEffect(() => {
    setOhlcData({})
    queueRef.current = []
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [tokens.map((t) => t.token).join(',')])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return ohlcData
}

export default useTokensOHLC
