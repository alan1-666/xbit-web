// Trade Event Types
export interface TradeEvent {
  bio: string
  conditionId: string
  eventSlug: string
  icon: string
  name: string
  outcome: string
  outcomeIndex: number
  price: number
  profileImage: string
  proxyWallet: string
  pseudonym: string
  side: 'BUY' | 'SELL'
  size: number
  slug: string
  timestamp: number
  title: string
  tokenID: string
  transactionHash: string
}

// WebSocket Message Types
export interface WSMessage<T = any> {
  type: string
  data: T
  timestamp?: number
}

// Server message formats (what we receive)
export interface TradeEventMessage extends WSMessage<TradeEvent> {
  type: 'trade'
  data: TradeEvent
}

// Client message formats (what we send)
export interface ClientSubscriptionMessage {
  action: 'subscribe' | 'unsubscribe'
  topic: string
}

export interface PingMessage extends WSMessage {
  type: 'ping'
  data: Record<string, never>
}

export interface PongMessage extends WSMessage {
  type: 'pong'
  data: Record<string, never>
}

// Union type for all possible messages
export type WSMessageTypes = TradeEventMessage | ClientSubscriptionMessage | PingMessage | PongMessage

export interface WSClientOptions {
  url: string
  protocols?: string | string[]
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  debug?: boolean
}

export interface WSClientEventHandlers {
  onOpen?: (event: Event) => void
  onMessage?: <T = any>(message: WSMessage<T>) => void
  onTradeEvent?: (event: TradeEvent) => void
  onError?: (error: Event) => void
  onClose?: (event: CloseEvent) => void
  onReconnect?: (attempt: number) => void
  onReconnectFailed?: () => void
}

export enum WSConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

export class WSClient {
  private ws: WebSocket | null = null
  private options: Required<Omit<WSClientOptions, 'protocols'>> & Pick<WSClientOptions, 'protocols'>
  private handlers: WSClientEventHandlers = {}
  private reconnectAttempts = 0
  private reconnectTimeoutId: NodeJS.Timeout | null = null
  private heartbeatTimeoutId: NodeJS.Timeout | null = null
  private state: WSConnectionState = WSConnectionState.DISCONNECTED
  private messageQueue: WSMessage[] = []
  private isIntentionalDisconnect = false

  constructor(options: WSClientOptions) {
    this.options = {
      url: options.url,
      protocols: options.protocols,
      reconnectInterval: options.reconnectInterval ?? 5000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
      heartbeatInterval: options.heartbeatInterval ?? 30000,
      debug: options.debug ?? false,
    }
  }

  private log(message: string, ...args: any[]) {
    if (this.options.debug) {
      console.log(`[WSClient] ${message}`, ...args)
    }
  }

  private logError(message: string, ...args: any[]) {
    if (this.options.debug) {
      console.error(`[WSClient] ${message}`, ...args)
    }
  }

  public getState(): WSConnectionState {
    return this.state
  }

  public isConnected(): boolean {
    return this.state === WSConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected()) {
        resolve()
        return
      }

      this.isIntentionalDisconnect = false
      this.setState(WSConnectionState.CONNECTING)
      this.log('Connecting to WebSocket:', this.options.url)

      try {
        this.ws = new WebSocket(this.options.url, this.options.protocols)

        this.ws.onopen = (event) => {
          this.log('WebSocket connected')
          this.setState(WSConnectionState.CONNECTED)
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.processMessageQueue()

          this.handlers.onOpen?.(event)
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data)
            this.log('Received message:', message)

            // Handle general message
            this.handlers.onMessage?.(message)

            // Handle specific trade events
            if (this.isTradeEvent(message)) {
              this.handlers.onTradeEvent?.(message as TradeEvent)
            }
          } catch (error) {
            this.logError('Failed to parse message:', event.data, error)
          }
        }

        this.ws.onerror = (event) => {
          this.logError('WebSocket error:', event)
          this.handlers.onError?.(event)
          if (this.state === WSConnectionState.CONNECTING) {
            reject(new Error('Failed to connect to WebSocket'))
          }
        }

        this.ws.onclose = (event) => {
          this.log('WebSocket closed:', event.code, event.reason)
          this.stopHeartbeat()

          if (this.state === WSConnectionState.CONNECTED) {
            this.handlers.onClose?.(event)
          }

          if (!this.isIntentionalDisconnect && this.shouldReconnect(event)) {
            this.setState(WSConnectionState.RECONNECTING)
            this.scheduleReconnect()
          } else {
            this.setState(WSConnectionState.DISCONNECTED)
          }
        }
      } catch (error) {
        this.logError('Failed to create WebSocket:', error)
        this.setState(WSConnectionState.FAILED)
        reject(error)
      }
    })
  }

  public disconnect(): void {
    this.log('Disconnecting WebSocket')
    this.isIntentionalDisconnect = true
    this.clearReconnectTimeout()
    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.setState(WSConnectionState.DISCONNECTED)
  }

  public send(message: WSMessage | ClientSubscriptionMessage): boolean {
    if (this.isConnected()) {
      try {
        let messageToSend: any

        // Handle client subscription messages (no timestamp needed)
        if ('action' in message) {
          messageToSend = message
        } else {
          // Handle regular WSMessage with timestamp
          messageToSend = {
            ...message,
            timestamp: Date.now(),
          }
        }

        this.ws!.send(JSON.stringify(messageToSend))
        this.log('Sent message:', messageToSend)
        return true
      } catch (error) {
        this.logError('Failed to send message:', error)
        return false
      }
    } else {
      // Queue message for later sending
      this.log('Queueing message (not connected):', message)
      this.messageQueue.push(message as WSMessage)
      return false
    }
  }

  public subscribe(topic: string): boolean {
    return this.send({
      action: 'subscribe',
      topic: topic,
    })
  }

  public unsubscribe(topic: string): boolean {
    return this.send({
      action: 'unsubscribe',
      topic: topic,
    })
  }

  public on(handlers: Partial<WSClientEventHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers }
  }

  public off(eventType: keyof WSClientEventHandlers): void {
    delete this.handlers[eventType]
  }

  // Trade-specific methods
  public subscribeToTrades(eventSlug?: string): boolean {
    if (eventSlug) {
      return this.subscribe(`public/order_matched/${eventSlug}`)
    } else {
      return this.subscribe('public/order_matched')
    }
  }

  public unsubscribeFromTrades(eventSlug?: string): boolean {
    if (eventSlug) {
      return this.unsubscribe(`public/order_matched/${eventSlug}`)
    } else {
      return this.unsubscribe('public/order_matched')
    }
  }

  // Type guard for trade events
  private isTradeEvent(data: any): data is TradeEvent {
    return !!data
  }

  private setState(newState: WSConnectionState): void {
    if (this.state !== newState) {
      this.log(`State changed: ${this.state} -> ${newState}`)
      this.state = newState
    }
  }

  private shouldReconnect(event: CloseEvent): boolean {
    // Don't reconnect if it was intentional or if we've exceeded max attempts
    if (this.isIntentionalDisconnect || this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      return false
    }

    // Don't reconnect for certain close codes
    const dontReconnectCodes = [1000, 1001, 1005, 4000, 4001, 4002, 4003]
    return !dontReconnectCodes.includes(event.code)
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeoutId) {
      return
    }

    const delay = Math.min(
      this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      30000, // Max 30 seconds
    )

    this.log(`Scheduling reconnect attempt ${this.reconnectAttempts + 1} in ${delay}ms`)

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectTimeoutId = null
      this.reconnectAttempts++

      this.handlers.onReconnect?.(this.reconnectAttempts)

      this.connect().catch(() => {
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
          this.logError('Max reconnection attempts reached')
          this.setState(WSConnectionState.FAILED)
          this.handlers.onReconnectFailed?.()
        }
      })
    }, delay)
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId)
      this.reconnectTimeoutId = null
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatTimeoutId = setTimeout(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping', data: {} })
        this.startHeartbeat() // Schedule next heartbeat
      }
    }, this.options.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimeoutId) {
      clearTimeout(this.heartbeatTimeoutId)
      this.heartbeatTimeoutId = null
    }
  }

  private processMessageQueue(): void {
    if (this.messageQueue.length > 0) {
      this.log(`Processing ${this.messageQueue.length} queued messages`)
      const messages = [...this.messageQueue]
      this.messageQueue = []

      messages.forEach((message) => {
        this.send(message)
      })
    }
  }

  public getConnectionStats() {
    return {
      state: this.state,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      isConnected: this.isConnected(),
    }
  }

  public destroy(): void {
    this.log('Destroying WebSocket client')
    this.disconnect()
    this.clearReconnectTimeout()
    this.handlers = {}
    this.messageQueue = []
  }
}

// Singleton instance for the prediction module
let wsClientInstance: WSClient | null = null

export const createWSClient = (options: WSClientOptions): WSClient => {
  if (wsClientInstance) {
    wsClientInstance.destroy()
  }
  wsClientInstance = new WSClient(options)
  return wsClientInstance
}

export const getWSClient = (): WSClient | null => {
  return wsClientInstance
}

export const destroyWSClient = (): void => {
  if (wsClientInstance) {
    wsClientInstance.destroy()
    wsClientInstance = null
  }
}

// Usage Example:
//
// const wsClient = createWSClient({
//   url: 'wss://api.prediction.com/ws',
//   debug: true,
//   reconnectInterval: 3000,
//   maxReconnectAttempts: 5
// })
//
// wsClient.on({
//   onOpen: () => console.log('WebSocket connected!'),
//   onTradeEvent: (trade: TradeEvent) => {
//     console.log('New trade:', {
//       eventSlug: trade.eventSlug,
//       side: trade.side,
//       price: trade.price,
//       size: trade.size,
//       outcome: trade.outcome
//     })
//   },
//   onError: (error) => console.error('WebSocket error:', error),
//   onReconnect: (attempt) => console.log(`Reconnecting... attempt ${attempt}`)
// })
//
// // Connect and subscribe to all trade events
// await wsClient.connect()
// wsClient.subscribeToTrades()
//
// // Or subscribe to specific event (matches server format)
// wsClient.subscribeToTrades('btc-updown-15m-1770811200')
// // This sends: { "action": "subscribe", "topic": "public/order_matched/btc-updown-15m-1770811200" }
//
// // You can also subscribe directly with custom topic
// wsClient.subscribe('public/order_matched/btc-updown-15m-1770811200')
