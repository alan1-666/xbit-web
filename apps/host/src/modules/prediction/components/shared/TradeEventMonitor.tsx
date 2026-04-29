import React from 'react'
import { Connector, TradeEvent, useWebSocketConnector, WSConnectionState } from '@/modules/prediction/websocket'
import { formatAmount } from '@/lib/format.ts'
import { useSubscribeMarketEvent } from '@/modules/prediction/hooks/useSubscribeMarketEvent.ts'
import { usePublicSubscriptionCallback } from '@/hooks/mqtt/usePublicSubscriptionCallback'

// Move CSS to a constant to avoid re-creating on every render
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

  @keyframes shiftUp {
    from {
      transform: translate3d(0, 0, 0);
    }
    to {
      transform: translate3d(0, -40px, 0);
    }
  }

  .trade-wheel-container {
    perspective: 1000px;
    perspective-origin: center bottom;
    position: relative;
    overflow: hidden;
    min-height: 240px;
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

// Inject styles once at module level
if (typeof document !== 'undefined' && !document.getElementById('trade-item-styles')) {
  const styleEl = document.createElement('style')
  styleEl.id = 'trade-item-styles'
  styleEl.textContent = TRADE_ITEM_STYLES
  document.head.appendChild(styleEl)
}

export interface TradeEventMonitorProps {
  eventSlug: string
  wsUrl?: string
  debug?: boolean
  showTradeList?: boolean
}

interface TradeWithId extends TradeEvent {
  id: string // Add unique ID for animation key
  receivedAt: number // Add received timestamp for sorting
  isFadingOut?: boolean // Add fade out state
}

export const TradeEventMonitor = (props: TradeEventMonitorProps) => {
  const { eventSlug, wsUrl = import.meta.env.VITE_PREDICTION_WS_URL, debug = false, showTradeList = true } = props
  const [recentTrades, setRecentTrades] = React.useState<TradeWithId[]>([])
  const timeoutsRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map())
  const mountedRef = React.useRef(true)

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      // Clear all timeouts on cleanup
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      timeoutsRef.current.clear()
    }
  }, [])

  // Optimized trade handler with batched updates
  const handleTradeEvent = React.useCallback(
    (trade: TradeEvent) => {
      if (!mountedRef.current) return

      const tradeWithId: TradeWithId = {
        ...trade,
        id: `${trade.transactionHash}-${trade.timestamp}`,
        receivedAt: Date.now(),
      }

      // Clear existing timeout for this trade if any
      const existingTimeout = timeoutsRef.current.get(tradeWithId.id)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Batch state update
      setRecentTrades((prev) => {
        // Filter out existing trade with same ID to avoid duplicates
        const filtered = prev.filter((t) => t.id !== tradeWithId.id)
        return [tradeWithId, ...filtered].slice(0, 7) // Keep max 7 items
      })

      // Single timeout per trade with optimized cleanup
      const timeoutId = setTimeout(() => {
        if (!mountedRef.current) return

        // Start fade out
        setRecentTrades((prev) => prev.map((t) => (t.id === tradeWithId.id ? { ...t, isFadingOut: true } : t)))

        // Remove after animation (250ms to match fadeOutUp duration)
        setTimeout(() => {
          if (!mountedRef.current) return
          setRecentTrades((prev) => prev.filter((t) => t.id !== tradeWithId.id))
          timeoutsRef.current.delete(tradeWithId.id)
        }, 250)
      }, 4500)

      timeoutsRef.current.set(tradeWithId.id, timeoutId)
    },
    [], // Remove eventSlug dependency to prevent recreation
  )

  // Use stable callback references
  const handleConnectionStateChange = React.useRef((state: WSConnectionState) => {
    if (debug) console.log(`[TradeEventMonitor] Connection state changed:`, state)
  }).current

  const handleError = React.useRef((error: Event) => {
    console.error(`[TradeEventMonitor] WebSocket error:`, error)
  }).current

  // Memoize Connector props with stable references
  const connectorProps = React.useMemo(
    () => ({
      url: wsUrl,
      debug,
      autoConnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      onTradeEvent: handleTradeEvent,
      onConnectionStateChange: handleConnectionStateChange,
      onError: handleError,
    }),
    [wsUrl, debug, handleTradeEvent], // Reduced dependencies
  )

  return (
    <Connector {...connectorProps}>
      <TradeEventSubscriber eventSlug={eventSlug} />
      {showTradeList && <TradeList trades={recentTrades} />}
    </Connector>
  )
}
//
export const TradeEventMonitorV2 = (props: TradeEventMonitorProps) => {
  const { eventSlug, showTradeList = true } = props
  const [recentTrades, setRecentTrades] = React.useState<TradeWithId[]>([])
  const timeoutsRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map())
  const mountedRef = React.useRef(true)

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      timeoutsRef.current.clear()
    }
  }, [])

  const handleTradeEvent = React.useCallback((trade: TradeEvent) => {
    if (!mountedRef.current) return

    const tradeWithId: TradeWithId = {
      ...trade,
      id: `${trade.transactionHash}-${trade.timestamp}`,
      receivedAt: Date.now(),
    }

    const existingTimeout = timeoutsRef.current.get(tradeWithId.id)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    setRecentTrades((prev) => {
      const filtered = prev.filter((t) => t.id !== tradeWithId.id)
      return [tradeWithId, ...filtered].slice(0, 7)
    })

    const timeoutId = setTimeout(() => {
      if (!mountedRef.current) return

      setRecentTrades((prev) => prev.map((t) => (t.id === tradeWithId.id ? { ...t, isFadingOut: true } : t)))

      setTimeout(() => {
        if (!mountedRef.current) return
        setRecentTrades((prev) => prev.filter((t) => t.id !== tradeWithId.id))
        timeoutsRef.current.delete(tradeWithId.id)
      }, 250)
    }, 4500)

    timeoutsRef.current.set(tradeWithId.id, timeoutId)
  }, [])

  useSubscribeMarketEvent(eventSlug)
  usePublicSubscriptionCallback(`public/orders_matched/${eventSlug}`, {
    onMessage: (_, data: TradeEvent) => {
      handleTradeEvent(data)
    },
  })

  if (!showTradeList) return null

  return <TradeList trades={recentTrades} />
}

// Internal component that handles subscription after connection is established
const TradeEventSubscriber = React.memo(({ eventSlug }: { eventSlug: string }) => {
  const { subscribeToTrades, unsubscribeFromTrades, isConnected, connectionState } = useWebSocketConnector()

  React.useEffect(() => {
    if (isConnected && eventSlug) {
      console.log(`[TradeEventSubscriber] Subscribing to trades for event: ${eventSlug}`)

      // Subscribe to specific event trades
      const success = subscribeToTrades(eventSlug)

      if (success) {
        console.log(`[TradeEventSubscriber] Successfully subscribed to ${eventSlug}`)
      } else {
        console.warn(`[TradeEventSubscriber] Failed to subscribe to ${eventSlug}`)
      }

      // Cleanup subscription when component unmounts or eventSlug changes
      return () => {
        console.log(`[TradeEventSubscriber] Unsubscribing from trades for event: ${eventSlug}`)
        unsubscribeFromTrades(eventSlug)
      }
    }
  }, [isConnected, eventSlug, subscribeToTrades, unsubscribeFromTrades])

  React.useEffect(() => {
    console.log(`[TradeEventSubscriber] Connection state: ${connectionState}, Connected: ${isConnected}`)
  }, [connectionState, isConnected])

  // Return null since we're not rendering anything visual yet
  return null
})

// Trade List Component with optimizations
interface TradeListProps {
  trades: TradeWithId[]
}

const TradeList = React.memo<TradeListProps>(({ trades }) => {
  // Pre-calculate which items are new to avoid recalculation in renders
  // Reverse array so newest items appear at bottom
  const tradesWithIndex = React.useMemo(
    () =>
      [...trades].reverse().map((trade, index) => ({
        trade,
        isNew: index === trades.length - 1, // Last item in reversed array is newest
        position: trades.length - 1 - index, // Position for opacity: 0 = bottom (newest), high = top (oldest)
      })),
    [trades],
  )

  // Early return for empty trades
  if (trades.length === 0) {
    return null
  }

  return (
    <div className="trade-wheel-container space-y-1 py-2 mt-2">
      {tradesWithIndex.map(({ trade, isNew, position }) => (
        <TradeItem key={trade.id} trade={trade} isNew={isNew} position={position} totalItems={trades.length} />
      ))}
    </div>
  )
})

// Individual Trade Item with optimized animations
interface TradeItemProps {
  trade: TradeWithId
  isNew: boolean
  position: number
  totalItems: number
}

const TradeItem = React.memo<TradeItemProps>(({ trade, isNew, position, totalItems }) => {
  const sideColor = trade.outcomeIndex === 0 ? 'text-green-400' : 'text-red-400'

  // Memoize expensive calculation
  const formattedAmount = React.useMemo(() => {
    const amount = trade.price * trade.size
    return formatAmount(amount, { showCurrency: true })
  }, [trade.price, trade.size])

  // Calculate opacity based on position - REVERSED: items at bottom (position 0) are brightest, items at top fade out
  const opacity = React.useMemo(() => {
    const maxOpacity = 1
    const minOpacity = 0.2
    // Reverse: bottom items (position 0) are brightest, top items (higher position) are dimmer
    const opacityStep = (maxOpacity - minOpacity) / Math.max(totalItems - 1, 1)
    // Invert the calculation: higher position = lower opacity
    return Math.max(minOpacity, maxOpacity - position * opacityStep)
  }, [position, totalItems])

  // Calculate scale based on position - bottom items are bigger, top items are smaller
  const scale = React.useMemo(() => {
    const maxScale = 1
    const minScale = 0.85
    const scaleStep = (maxScale - minScale) / Math.max(totalItems - 1, 1)
    return Math.max(minScale, maxScale - position * scaleStep)
  }, [position, totalItems])

  // Determine animation class based on state
  const animationClass = React.useMemo(() => {
    if (trade.isFadingOut) {
      return 'trade-item-fade-out'
    }
    return isNew ? 'trade-item-slide-in' : 'trade-item-static'
  }, [trade.isFadingOut, isNew])

  return (
    <div
      className={`text-sm font-medium bg-red ${sideColor} ${animationClass}`}
      style={{
        opacity: trade.isFadingOut ? undefined : opacity,
        transform: trade.isFadingOut ? undefined : `scale(${scale})`,
      }}
    >
      +{formattedAmount}
    </div>
  )
})
