import { useState, useMemo } from 'react'
import { useWebSocketChannel } from '@/hooks/hyperliquid/useWebSocketChannel'
import { Configs } from '@/const/configs'
import { _changeTokenAccount } from '@/redux/modules/auth.slice'

interface TickerSnapshot {
  T: number
  c: string
  h: string
  i: string
  l: string
  n: number
  o: string
  s: string
  t: number
  v: string
}
;[]

export function useCandleData(symbol: string, interval: string) {
  const [ticker, setTicker] = useState<TickerSnapshot>({
    t: 1750154760000,
    T: 1750154819999,
    s: 'BTC',
    i: '1m',
    o: '106028.0',
    c: '106114.0',
    h: '106162.0',
    l: '106027.0',
    v: '18.97547',
    n: 447,
  })

  const channel = 'candle'

  const params = useMemo(() => {
    if (!symbol || !interval) return null
    return {
      type: 'candle',
      coin: symbol,
      interval: interval,
    }
  }, [symbol, interval])

  useWebSocketChannel(channel, params, (data) => {
    if (data?.s !== params?.coin) return
    setTicker(data)
  }, Configs.getCandleWssUrl())

  return {
    ticker,
  }
}
