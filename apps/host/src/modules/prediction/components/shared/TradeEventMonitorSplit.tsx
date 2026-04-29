import { formatAmount } from '@/lib/format'
import { useEffect, useMemo, useRef, useState } from 'react'

// Animation styles
const TRADE_ITEM_STYLES = `
  @keyframes slideUpFromBottom {
    from {
      transform: translate3d(0, 40px, 0) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
    }
  }

  @keyframes fadeOutTop {
    from {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
    }
    to {
      transform: translate3d(0, -20px, 0) scale(0.95);
      opacity: 0;
    }
  }

  .trade-item-slide-in {
    animation: slideUpFromBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    transform-style: preserve-3d;
    will-change: transform, opacity;
  }

  .trade-item-fade-out {
    animation: fadeOutTop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    transform-style: preserve-3d;
    will-change: transform, opacity;
  }

  .trade-item-static {
    transform-style: preserve-3d;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
  }
`

// Inject styles once
if (typeof document !== 'undefined' && !document.getElementById('trade-item-split-styles')) {
  const styleEl = document.createElement('style')
  styleEl.id = 'trade-item-split-styles'
  styleEl.textContent = TRADE_ITEM_STYLES
  document.head.appendChild(styleEl)
}

export interface TopicTradeEvent {
  id: number
  receivedAt: Date
  outcome: number | string
  value: number
  isFadingOut?: boolean
}

interface TradeEventMonitorSplitProps {
  trades?: TopicTradeEvent[]
  maxPerSide?: number
}

const normalizeSide = (outcome: TopicTradeEvent['outcome']): 'up' | 'down' => {
  if (typeof outcome === 'number') {
    return outcome === 0 ? 'up' : 'down'
  }

  const value = String(outcome).toLowerCase()
  if (value === '0') return 'up'
  if (value === '1') return 'down'

  if (value === 'up' || value === 'buy' || value === 'long' || value === 'true') {
    return 'up'
  }

  return 'down'
}

const formatValue = (value: number) => {
  if (Number.isNaN(value)) return '$0'
  return formatAmount(value, { showCurrency: true })
}

export const TradeEventMonitorSplit = ({ trades = [], maxPerSide = 3 }: TradeEventMonitorSplitProps) => {
  const [displayTrades, setDisplayTrades] = useState<TopicTradeEvent[]>([])
  const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map())
  const mountedRef = useRef(true)
  const previousTradesRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      timeoutsRef.current.clear()
    }
  }, [])

  // Handle incoming trades with fade-out animation
  useEffect(() => {
    if (!trades || trades.length === 0) {
      setDisplayTrades([])
      return
    }

    const currentTradeIds = new Set(trades.map((t) => t.id))
    const newTrades = trades.filter((trade) => !previousTradesRef.current.has(trade.id))

    // Update previous trades set
    previousTradesRef.current = currentTradeIds

    // Add new trades to display
    if (newTrades.length > 0) {
      setDisplayTrades((prev) => {
        const filtered = prev.filter((t) => currentTradeIds.has(t.id))
        return [...newTrades, ...filtered]
      })

      // Set up fade-out timeouts for new trades
      newTrades.forEach((trade) => {
        const existingTimeout = timeoutsRef.current.get(trade.id)
        if (existingTimeout) clearTimeout(existingTimeout)

        const timeoutId = setTimeout(() => {
          if (!mountedRef.current) return

          // Start fade out
          setDisplayTrades((prev) => prev.map((t) => (t.id === trade.id ? { ...t, isFadingOut: true } : t)))

          // Remove after animation
          setTimeout(() => {
            if (!mountedRef.current) return
            setDisplayTrades((prev) => prev.filter((t) => t.id !== trade.id))
            timeoutsRef.current.delete(trade.id)
          }, 300)
        }, 4500)

        timeoutsRef.current.set(trade.id, timeoutId)
      })
    }
  }, [trades])

  const { upTrades, downTrades } = useMemo(() => {
    const up = displayTrades.filter((item) => normalizeSide(item.outcome) === 'up').slice(-maxPerSide)
    const down = displayTrades.filter((item) => normalizeSide(item.outcome) === 'down').slice(-maxPerSide)

    return { upTrades: up, downTrades: down }
  }, [displayTrades, maxPerSide])

  if (upTrades.length === 0 && downTrades.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1 z-60">
      <TradeColumn trades={upTrades} side="up" />
      <TradeColumn trades={downTrades} side="down" />
    </div>
  )
}

// Individual column component
interface TradeColumnProps {
  trades: TopicTradeEvent[]
  side: 'up' | 'down'
}

const TradeColumn = ({ trades, side }: TradeColumnProps) => {
  const tradesWithMeta = useMemo(() => {
    return [...trades].reverse().map((trade, index) => ({
      trade,
      isNew: index === trades.length - 1,
      position: trades.length - 1 - index,
    }))
  }, [trades])

  const alignClass = side === 'up' ? 'items-start' : 'items-end'

  return (
    <div className={`flex min-h-10 w-1/2 flex-col ${alignClass} justify-center gap-0.5`}>
      {tradesWithMeta.map(({ trade, isNew, position }) => (
        <TradeItem
          key={trade.id}
          trade={trade}
          side={side}
          isNew={isNew}
          position={position}
          totalItems={trades.length}
        />
      ))}
    </div>
  )
}

// Individual trade item with animations
interface TradeItemProps {
  trade: TopicTradeEvent
  side: 'up' | 'down'
  isNew: boolean
  position: number
  totalItems: number
}

const TradeItem = ({ trade, side, isNew, position, totalItems }: TradeItemProps) => {
  const colorClass = side === 'up' ? 'text-green-400' : 'text-red-400'

  const formattedValue = useMemo(() => formatValue(trade.value), [trade.value])

  const opacity = useMemo(() => {
    const maxOpacity = 1
    const minOpacity = 0.2
    const opacityStep = (maxOpacity - minOpacity) / Math.max(totalItems - 1, 1)
    return Math.max(minOpacity, maxOpacity - position * opacityStep)
  }, [position, totalItems])

  const scale = useMemo(() => {
    const maxScale = 1
    const minScale = 0.85
    const scaleStep = (maxScale - minScale) / Math.max(totalItems - 1, 1)
    return Math.max(minScale, maxScale - position * scaleStep)
  }, [position, totalItems])

  const animationClass = useMemo(() => {
    if (trade.isFadingOut) return 'trade-item-fade-out'
    return isNew ? 'trade-item-slide-in' : 'trade-item-static'
  }, [trade.isFadingOut, isNew])

  return (
    <div
      className={`rounded px-1.5 py-0.5 text-[11px] font-medium leading-none ${colorClass} ${animationClass}`}
      style={{
        opacity: trade.isFadingOut ? undefined : opacity,
        transform: trade.isFadingOut ? undefined : `scale(${scale})`,
      }}
    >
      +{formattedValue}
    </div>
  )
}
