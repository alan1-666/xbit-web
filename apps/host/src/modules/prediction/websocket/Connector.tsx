import React, { useEffect, useRef, useCallback, useState } from 'react'
import { createWSClient, destroyWSClient, WSClient, WSClientOptions, WSConnectionState, TradeEvent } from './wsClient'
import { ConnectorContext, ConnectorContextType, useWebSocketConnector } from './ConnectorContext'

export interface ConnectorProps {
  url: string
  protocols?: string | string[]
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  debug?: boolean
  autoConnect?: boolean
  children?: React.ReactNode
  onTradeEvent?: (trade: TradeEvent) => void
  onConnectionStateChange?: (state: WSConnectionState) => void
  onError?: (error: Event) => void
}

export const Connector: React.FC<ConnectorProps> = ({
  url,
  protocols,
  reconnectInterval = 5000,
  maxReconnectAttempts = 10,
  heartbeatInterval = 30000,
  debug = false,
  autoConnect = true,
  children,
  onTradeEvent,
  onConnectionStateChange,
  onError,
}) => {
  const [connectionState, setConnectionState] = useState<WSConnectionState>(WSConnectionState.DISCONNECTED)
  const [isConnected, setIsConnected] = useState(false)

  const clientRef = useRef<WSClient | null>(null)
  const isUnmountedRef = useRef(false)
  const connectionAttemptRef = useRef<Promise<void> | null>(null)
  const currentUrlRef = useRef<string>(url)

  // Use refs for callbacks to prevent unnecessary reinitialization
  const callbacksRef = useRef({
    onTradeEvent,
    onConnectionStateChange,
    onError,
  })

  // Update callback refs when props change
  callbacksRef.current = {
    onTradeEvent,
    onConnectionStateChange,
    onError,
  }

  // Initialize WebSocket client - memoize with stable dependencies
  const initializeClient = useCallback(() => {
    if (clientRef.current || isUnmountedRef.current) {
      return clientRef.current
    }

    if (debug) {
      console.log('[Connector] Initializing new WebSocket client')
    }

    const options: WSClientOptions = {
      url,
      protocols,
      reconnectInterval,
      maxReconnectAttempts,
      heartbeatInterval,
      debug,
    }

    const client = createWSClient(options)
    clientRef.current = client

    // Set up event handlers using callback refs
    client.on({
      onOpen: () => {
        if (!isUnmountedRef.current) {
          setConnectionState(WSConnectionState.CONNECTED)
          setIsConnected(true)
          callbacksRef.current.onConnectionStateChange?.(WSConnectionState.CONNECTED)
        }
      },
      onClose: () => {
        if (!isUnmountedRef.current) {
          setConnectionState(WSConnectionState.DISCONNECTED)
          setIsConnected(false)
          callbacksRef.current.onConnectionStateChange?.(WSConnectionState.DISCONNECTED)
        }
      },
      onError: (error) => {
        if (!isUnmountedRef.current) {
          setConnectionState(WSConnectionState.FAILED)
          setIsConnected(false)
          callbacksRef.current.onConnectionStateChange?.(WSConnectionState.FAILED)
          callbacksRef.current.onError?.(error)
        }
      },
      onReconnect: (attempt) => {
        if (!isUnmountedRef.current) {
          setConnectionState(WSConnectionState.RECONNECTING)
          setIsConnected(false)
          callbacksRef.current.onConnectionStateChange?.(WSConnectionState.RECONNECTING)
          if (debug) {
            console.log(`[Connector] Reconnecting... attempt ${attempt}`)
          }
        }
      },
      onReconnectFailed: () => {
        if (!isUnmountedRef.current) {
          setConnectionState(WSConnectionState.FAILED)
          setIsConnected(false)
          callbacksRef.current.onConnectionStateChange?.(WSConnectionState.FAILED)
          if (debug) {
            console.log('[Connector] Max reconnection attempts reached')
          }
        }
      },
      onTradeEvent: (trade) => {
        if (!isUnmountedRef.current) {
          callbacksRef.current.onTradeEvent?.(trade)
        }
      },
    })

    return client
  }, [url, protocols, reconnectInterval, maxReconnectAttempts, heartbeatInterval, debug]) // Remove callback dependencies

  // Connect function with connection deduplication
  const connect = useCallback(async (): Promise<void> => {
    if (isUnmountedRef.current) {
      return
    }

    // If already connecting, return the existing promise
    if (connectionAttemptRef.current) {
      return connectionAttemptRef.current
    }

    const client = initializeClient()
    if (!client) {
      return
    }

    // If already connected, no need to connect again
    if (client.isConnected()) {
      return
    }

    setConnectionState(WSConnectionState.CONNECTING)
    onConnectionStateChange?.(WSConnectionState.CONNECTING)

    // Create and store the connection promise
    connectionAttemptRef.current = client
      .connect()
      .then(() => {
        connectionAttemptRef.current = null
      })
      .catch((error) => {
        connectionAttemptRef.current = null
        if (!isUnmountedRef.current) {
          console.error('[Connector] Connection failed:', error)
        }
        throw error
      })

    return connectionAttemptRef.current
  }, [initializeClient, onConnectionStateChange])

  // Disconnect function
  const disconnect = useCallback(() => {
    if (clientRef.current && !isUnmountedRef.current) {
      clientRef.current.disconnect()
      setConnectionState(WSConnectionState.DISCONNECTED)
      setIsConnected(false)
      onConnectionStateChange?.(WSConnectionState.DISCONNECTED)
    }
  }, [onConnectionStateChange])

  // Subscribe function
  const subscribe = useCallback((topic: string): boolean => {
    if (clientRef.current && clientRef.current.isConnected()) {
      return clientRef.current.subscribe(topic)
    }
    return false
  }, [])

  // Unsubscribe function
  const unsubscribe = useCallback((topic: string): boolean => {
    if (clientRef.current && clientRef.current.isConnected()) {
      return clientRef.current.unsubscribe(topic)
    }
    return false
  }, [])

  // Trade-specific subscribe function
  const subscribeToTrades = useCallback((eventSlug?: string): boolean => {
    if (clientRef.current && clientRef.current.isConnected()) {
      return clientRef.current.subscribeToTrades(eventSlug)
    }
    return false
  }, [])

  // Trade-specific unsubscribe function
  const unsubscribeFromTrades = useCallback((eventSlug?: string): boolean => {
    if (clientRef.current && clientRef.current.isConnected()) {
      return clientRef.current.unsubscribeFromTrades(eventSlug)
    }
    return false
  }, [])

  // Effect for auto-connect and cleanup
  useEffect(() => {
    isUnmountedRef.current = false

    if (autoConnect) {
      connect().catch((error) => {
        console.error('[Connector] Auto-connect failed:', error)
      })
    }

    // Cleanup function
    return () => {
      isUnmountedRef.current = true

      // Cancel any pending connection attempts
      if (connectionAttemptRef.current) {
        connectionAttemptRef.current = null
      }

      // Destroy the WebSocket client to prevent resource leaks
      if (clientRef.current) {
        try {
          clientRef.current.destroy()
          destroyWSClient()
        } catch (error) {
          console.error('[Connector] Error during cleanup:', error)
        }
        clientRef.current = null
      }

      // Reset state
      setConnectionState(WSConnectionState.DISCONNECTED)
      setIsConnected(false)
    }
  }, [autoConnect, connect])

  // Effect to handle URL changes - only reconnect if URL actually changed
  useEffect(() => {
    // Check if URL actually changed
    if (currentUrlRef.current !== url) {
      if (debug) {
        console.log(`[Connector] URL changed from ${currentUrlRef.current} to ${url}`)
      }

      currentUrlRef.current = url

      // If we have an active client and it's connected, disconnect and reconnect
      if (clientRef.current && clientRef.current.isConnected() && !isUnmountedRef.current) {
        if (debug) {
          console.log('[Connector] Disconnecting due to URL change')
        }

        disconnect()

        // Small delay to ensure clean disconnect before reconnecting
        setTimeout(() => {
          if (!isUnmountedRef.current) {
            connect().catch((error) => {
              console.error('[Connector] Reconnection after URL change failed:', error)
            })
          }
        }, 100)
      }
    }
  }, [url]) // Remove disconnect and connect from dependencies

  // Context value
  const contextValue: ConnectorContextType = {
    client: clientRef.current,
    connectionState,
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    subscribeToTrades,
    unsubscribeFromTrades,
  }

  return <ConnectorContext.Provider value={contextValue}>{children}</ConnectorContext.Provider>
}

// Connection status component for debugging/monitoring
export const ConnectionStatus: React.FC<{ className?: string }> = ({ className }) => {
  const { connectionState, isConnected } = useWebSocketConnector()

  const getStatusColor = (state: WSConnectionState): string => {
    switch (state) {
      case WSConnectionState.CONNECTED:
        return 'text-green-500'
      case WSConnectionState.CONNECTING:
      case WSConnectionState.RECONNECTING:
        return 'text-yellow-500'
      case WSConnectionState.FAILED:
        return 'text-red-500'
      case WSConnectionState.DISCONNECTED:
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (state: WSConnectionState): string => {
    switch (state) {
      case WSConnectionState.CONNECTED:
        return '🟢'
      case WSConnectionState.CONNECTING:
      case WSConnectionState.RECONNECTING:
        return '🟡'
      case WSConnectionState.FAILED:
        return '🔴'
      case WSConnectionState.DISCONNECTED:
      default:
        return '⚫'
    }
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className || ''}`}>
      <span>{getStatusIcon(connectionState)}</span>
      <span className={getStatusColor(connectionState)}>
        {connectionState} {isConnected && '(Connected)'}
      </span>
    </div>
  )
}

export default Connector
