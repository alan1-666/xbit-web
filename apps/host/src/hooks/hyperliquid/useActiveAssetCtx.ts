import { useState, useEffect, useMemo } from 'react'
import { useWebSocketChannel } from '@/hooks/hyperliquid/useWebSocketChannel'
import { WsActiveAssetCtx } from '@/types/hyperliquid'
import { loadSymbolSnapshot, saveSymbolSnapshot } from '@/utils/indexedDB/marketDB'
import { setSymbolInfo } from '@/redux/modules/futuresCurrentSymbol.slice'
import { useAppSelector, useAppDispatch } from '@/redux/store'

export const defaultSymbolData = {
  dayNtlVlm: '',
  prevDayPx: '',
  markPx: '',
  midPx: '',
  funding: 0,
  openInterest: 0,
  oraclePx: 0,
  circulatingSupply: 0,
}
export function useActiveAssetCtx(symbol: string) {
  const dispatch = useAppDispatch()

  const [activeAssetCtx, setActiveAssetCtx] = useState<WsActiveAssetCtx>({
    coin: symbol,
    ctx: defaultSymbolData,
  })

  const channel = 'activeAssetCtx'

  const params = useMemo(() => {
    if (!symbol) return null
    return {
      type: 'activeAssetCtx',
      coin: symbol,
    }
  }, [symbol])

  useEffect(() => {
    if (!symbol) return
    try {
      loadSymbolSnapshot(symbol).then((cached) => {
        if (cached) {
          const oraclePx = cached?.oraclePx
          const prevDayPx = cached?.prevDayPx
          const cachedMarkPx = cached?.markPx

          dispatch(
            setSymbolInfo({
              price: oraclePx,
              markPrice: cachedMarkPx ?? oraclePx,
              lastTradePrice: oraclePx,
            }),
          )
          setActiveAssetCtx({
            coin: symbol,
            ctx: {
              ...defaultSymbolData,
              oraclePx: oraclePx,
              prevDayPx: prevDayPx,
              markPx: cachedMarkPx ?? '',
            },
          })
        }
      })
    } catch (error) {}
  }, [symbol])

  useWebSocketChannel(channel, params, (data: WsActiveAssetCtx) => {
    if (!symbol || !data?.ctx) return
    if (symbol !== params?.coin) return
    setActiveAssetCtx(data)
    saveSymbolSnapshot(symbol, data?.ctx)

    // 同步最新价格到 Redux，避免页面其他组件读到旧值或 0 值
    const nextOraclePx = data?.ctx?.oraclePx ?? 0
    const nextMarkPx = Number(data?.ctx?.markPx ?? 0)
    dispatch(
      setSymbolInfo({
        price: nextOraclePx,
        markPrice: String(nextMarkPx),
      }),
    )
  })

  const price = activeAssetCtx?.ctx.oraclePx || 0
  const markPrice = Number(activeAssetCtx?.ctx.markPx || 0)
  const prevDayPrice = parseFloat(activeAssetCtx?.ctx.prevDayPx || '0')
  // 24小时交易量
  const dayNtlVlm = Number(activeAssetCtx?.ctx.dayNtlVlm || 0)
  const dayBaseVlm = Number(activeAssetCtx?.ctx.dayBaseVlm || 0)
  const openInterest = Number(activeAssetCtx?.ctx.openInterest || 0)
  const coinOpenInterest = Number(activeAssetCtx?.ctx.openInterest || 0) * markPrice

  const funding = Number(activeAssetCtx?.ctx.funding || 0)

  const change = useMemo(() => {
    if (!markPrice || !prevDayPrice || markPrice === 0) return '0.00'
    return (((markPrice - prevDayPrice) / prevDayPrice) * 100).toFixed(2)
  }, [markPrice, prevDayPrice])

  return {
    activeAssetCtx,
    price,
    markPrice,
    prevDayPrice,
    change,
    funding,
    dayNtlVlm,
    dayBaseVlm,
    coinOpenInterest,
    openInterest,
  }
}
