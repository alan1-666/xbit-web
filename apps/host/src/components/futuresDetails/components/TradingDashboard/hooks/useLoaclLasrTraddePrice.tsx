import { useOrderTradeData } from '@/hooks/hyperliquid/useOrderTradeData'
import { setSymbolInfo, symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useEffect, useRef, useState } from 'react'

const useLoaclLasrTraddePrice = ({ baseCoin, open }: { baseCoin: string; open: boolean }) => {
  const lastPriceRef = useRef<string | null>(null)
  const dispatch = useAppDispatch()
  const { lastTradePrice } = useAppSelector(symbolInfoSelector)
  const [localLastTradePrice, setLocalLastTradePrice] = useState<string>(lastTradePrice || '--')
  const trades = useOrderTradeData(baseCoin)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (trades.length > 0) {
      const latestTrade = trades[0]
      const newPrice = String(latestTrade.price)

      if (newPrice !== lastPriceRef.current) {
        lastPriceRef.current = newPrice
        setLocalLastTradePrice(newPrice)

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(() => {
          dispatch(setSymbolInfo({ lastTradePrice: newPrice }))
        }, 500)
      }
    }
  }, [trades, dispatch])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current && !open) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [open])

  return { localLastTradePrice }
}

export default useLoaclLasrTraddePrice
