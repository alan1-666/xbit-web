import { useEffect, useMemo, useRef, useState } from 'react'

type ActiveAssetCtxPayload = {
  coin: string
  ctx: {
    markPx?: string
    prevDayPx?: string
  }
}

type WsMsg = { channel: 'activeAssetCtx'; data: ActiveAssetCtxPayload } | { channel: string; data: any }

export type AssetCtx = {
  markPx?: number
  prevDayPx?: number
  changePct?: number
}

function toNum(v?: string) {
  if (v == null) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function calcChangePct(mark?: number, prev?: number) {
  if (!mark || !prev || prev === 0) return undefined
  return ((mark - prev) / prev) * 100
}

export function useHyperliquidActiveAssetCtx(args: { coins: string[]; enabled?: boolean }) {
  const { coins, enabled = true } = args

  const [map, setMap] = useState<Record<string, AssetCtx>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const closedByUserRef = useRef(false)

  const coinsKey = useMemo(
    () =>
      Array.from(new Set(coins.filter(Boolean).map((c) => c.toUpperCase())))
        .sort()
        .join('|'),
    [coins],
  )

  // 统一的“订阅发送”
  const subscribe = (ws: WebSocket, coinList: string[]) => {
    // 兼容两种：订阅全量subscribe / 按 coin 订阅per-coin
    coinList.forEach((coin) => {
      ws.send(
        JSON.stringify({
          method: 'subscribe',
          subscription: { type: 'activeAssetCtx', coin },
        }),
      )
    })
  }

  const unsubscribe = (ws: WebSocket, coinList: string[]) => {
    coinList.forEach((coin) => {
      ws.send(
        JSON.stringify({
          method: 'unsubscribe',
          subscription: { type: 'activeAssetCtx', coin },
        }),
      )
    })
  }

  const connect = (coinList: string[]) => {
    if (!enabled) return
    if (!coinList.length) return

    // 先清掉旧连接
    if (wsRef.current) {
      try {
        wsRef.current.close()
      } catch {}
      wsRef.current = null
    }

    closedByUserRef.current = false
    const ws = new WebSocket('wss://api.hyperliquid.xyz/ws')
    wsRef.current = ws

    ws.onopen = () => {
      subscribe(ws, coinList)
    }

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data) as WsMsg
        if (msg?.channel !== 'activeAssetCtx') return
        const coin = msg.data?.coin?.toUpperCase()
        if (!coin) return

        const markPx = toNum(msg.data?.ctx?.markPx)
        const prevDayPx = toNum(msg.data?.ctx?.prevDayPx)
        const changePct = calcChangePct(markPx, prevDayPx)

        setMap((prev) => ({
          ...prev,
          [coin]: { markPx, prevDayPx, changePct },
        }))
      } catch {
        // ignore
      }
    }

    ws.onclose = () => {
      if (closedByUserRef.current) return

      // 断线重连：1.5s（可按需指数退避）
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = window.setTimeout(() => {
        connect(coinList)
      }, 1500)
    }

    ws.onerror = () => {
      // 触发 close -> reconnect
      try {
        ws.close()
      } catch {}
    }
  }

  useEffect(() => {
    if (!enabled) return

    const list = coinsKey ? coinsKey.split('|') : []
    connect(list)

    return () => {
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current)

      const ws = wsRef.current
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          unsubscribe(ws, list)
        } catch {}
      }
      closedByUserRef.current = true
      try {
        ws?.close()
      } catch {}
      wsRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinsKey, enabled])

  return map
}
