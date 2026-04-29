import React from 'react'
import { WSClient, WSConnectionState } from './wsClient'

export interface ConnectorContextType {
  client: WSClient | null
  connectionState: WSConnectionState
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  subscribe: (topic: string) => boolean
  unsubscribe: (topic: string) => boolean
  subscribeToTrades: (eventSlug?: string) => boolean
  unsubscribeFromTrades: (eventSlug?: string) => boolean
}

// Context for accessing WebSocket client throughout the component tree
export const ConnectorContext = React.createContext<ConnectorContextType | null>(null)

// Hook to use WebSocket connector
export const useWebSocketConnector = (): ConnectorContextType => {
  const context = React.useContext(ConnectorContext)
  if (!context) {
    throw new Error('useWebSocketConnector must be used within a Connector component')
  }
  return context
}
