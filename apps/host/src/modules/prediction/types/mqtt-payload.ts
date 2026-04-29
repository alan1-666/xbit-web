/**
 * MQTT Payload Types
 * Based on MQTT.md documentation
 */

// ============ Event Payloads ============

/**
 * Event Message Payload
 * Topics: public/event/new, public/event/update
 */
export interface MqttEventPayload {
  i: string // ID (system UUID)
  pi: string // Provider ID
  p: string // Provider name (e.g., "polymarket")
  t: string // Title
  s: string // Slug
  d: string // Description
  im?: string // Image URL (optional)
  a: boolean // Active
  c: boolean // Closed
  v?: string // Volume (optional)
  l?: string // Liquidity (optional)
  ts: number // Timestamp (Unix seconds)
}

// ============ Market Payloads ============

/**
 * Market Message Payload
 * Topics: public/market/new, public/market/{market_id}/update
 *
 * Note: For update messages, most fields are optional as they may be partial updates.
 * The update topic includes token-specific best bid/ask prices.
 */
export interface MqttMarketPayload {
  i: string // ID (int64 as string)
  pi?: string // Provider ID (optional for updates)
  p?: string // Provider name (optional for updates, e.g., "polymarket")
  q?: string // Question (optional for updates)
  s?: string // Slug (optional for updates)
  ty?: string // Token Yes ID (optional for updates)
  tn?: string // Token No ID (optional for updates)
  im?: string // Image URL (optional)
  a?: boolean // Active (optional)
  c?: boolean // Closed (optional)
  v?: string // Volume (optional)
  l?: string // Liquidity (optional)
  op?: string[] // Outcome prices [yes, no] (optional)
  tybb?: string // Token Yes Best Bid (optional)
  tyba?: string // Token Yes Best Ask (optional)
  tnbb?: string // Token No Best Bid (optional)
  tnba?: string // Token No Best Ask (optional)
  ts: number // Timestamp (Unix seconds)
  tyts: string // Token Yes tick size
  tnts: string // Token No tick size
}

/**
 * Price Change Payload
 * Topic: public/market/{market_id}/price
 */
export interface MqttPricePayload {
  m: string // Market ID (system UUID)
  t: string // Token ID
  p: string // Price
  ts: number // Timestamp (Unix seconds)
}

/**
 * Order Book Entry
 */
export interface MqttOrderBookEntry {
  price: string // Price
  size: string // Size
}

/**
 * Order Book Payload
 * Topic: public/market/{market_id}/orderbook
 */
export interface MqttOrderBookPayload {
  m: string // Market ID (system UUID)
  t: string // Token ID
  b: MqttOrderBookEntry[] // Bids
  a: MqttOrderBookEntry[] // Asks
  h: string // Hash
  ts: number // Timestamp (Unix seconds)
}

/**
 * Last Trade Price Payload
 * Topic: public/market/{market_id}/trade
 */
export interface MqttTradePayload {
  m: string // Market ID (system UUID)
  p: string // Price (decimal)
}

/**
 * Market Resolved Payload
 * Topic: public/market/{market_id}/resolved
 */
export interface MqttMarketResolvedPayload {
  m: string // Market ID (system UUID)
  wt: string // Winning Token ID
  wo: string // Winning Outcome (e.g., "Yes")
  ts: number // Timestamp (Unix seconds)
}

// ============ Comment Payloads ============

/**
 * Comment Payload
 * Topic: public/comment/{entity_type}/{entity_id}
 */
export interface MqttCommentPayload {
  i: string // ID (system UUID)
  pi: string // Provider ID
  p: string // Provider name (e.g., "polymarket")
  b: string // Body (comment content)
  t: 'event' | 'series' | 'market' // Type (event/series/market)
  pid: string // Parent ID (system UUID)
  ua: string // User Address
  pn?: string // Profile Name (optional)
  pm?: string // Profile Image URL (optional)
  rc: number // Reaction Count
  ca: number // Created At (Unix seconds, from provider)
  ts: number // Timestamp (Unix seconds, publish time)
}

/**
 * Order Book Update Payload (Incremental updates)
 * Topic: public/market/{market_id}/orderbook/update
 *
 * Array of order book level updates (batched), with each update representing
 * a change to a single price level for a token
 */
export interface MqttOrderBookUpdatePayload {
  m: string // Market ID (int64 as string)
  t: string // Token ID
  p: string // Price
  s: string // Size
  ty: 'BUY' | 'SELL' // Type (BUY/SELL)
  ts: number // Timestamp (Unix seconds)
}

/**
 * Order Book Update Message (Array of updates)
 * Topic: public/market/{market_id}/orderbook/update
 */
export type MqttOrderBookUpdateMessagePayload = MqttOrderBookUpdatePayload[]

// ============ Binance Price Payload ============

/**
 * Binance Price Payload (Real-time price update)
 * Topic: public/price/{symbol}
 *
 * Supported symbols: BTCUSDT, ETHUSDT, SOLUSDT, XRPUSDT
 */
export interface MqttBinancePricePayload {
  t: number // Timestamp (Unix seconds)
  p: string // Price
}

/**
 * Binance Price Message
 * Topic: public/price/{symbol}
 */
export type MqttBinancePriceMessagePayload = MqttBinancePricePayload

// ============ Polymarket Transaction Status Payload ============

/**
 * Polymarket Order Meta Information
 * Nested meta object within the main meta object
 */
export interface MqttPolymarketOrderMeta {
  id: string // Order ID
  status: string // Order status (e.g., "MATCHED")
  owner: string // Owner ID
  maker_address: string // Maker wallet address
  market: string // Market ID (hex string)
  asset_id: string // Asset ID (large number as string)
  side: string // Side (e.g., "BUY")
  original_size: string // Original order size
  size_matched: string // Matched size
  price: string // Price
  outcome: string // Outcome (e.g., "Yes")
  expiration: string // Expiration (e.g., "0")
  order_type: string // Order type (e.g., "FOK")
  associate_trades: string[] // Associated trade IDs
  created_at: number // Created timestamp (Unix seconds)
}

/**
 * Polymarket Transaction Status Meta Information
 */
export interface MqttPolymarketTxStatusMeta {
  updatedAt: string // ISO 8601 timestamp
  status: string // Status (e.g., "MATCHED")
  matchedSize: number // Matched size
  avgFillPrice: number // Average fill price
  isPartiallyFilled: boolean // Whether partially filled
  fillPercentage: number // Fill percentage
  meta: MqttPolymarketOrderMeta // Nested meta information
}

/**
 * Polymarket Transaction Status Payload
 * Topic: public/polymarket/tx_status/{proxy_wallet}
 */
export interface MqttPolymarketTxStatusPayload {
  type: string // Transaction type (e.g., "ORDER")
  orderId: string // Order ID (hex string)
  dbOrderId: string // Database order ID
  marketId: string // Market ID
  outcome: string // Outcome (e.g., "YES")
  side: string // Side (e.g., "BUY")
  orderType: string // Order type (e.g., "MARKET")
  status: string // Status (e.g., "MATCHED")
  size: number // Size
  userId: string // User ID (UUID)
  walletAddress: string // Wallet address
  meta: MqttPolymarketTxStatusMeta // Meta information
  updatedAt: string // ISO 8601 timestamp
}

// ============ Array Message Types ============

/**
 * Event New/Update Message (Array of events)
 * Topics: public/event/new, public/event/update
 */
export type MqttEventMessagePayload = MqttEventPayload[]

/**
 * Market New/Update Message (Array of markets)
 * Topics: public/market/new, public/market/update
 */
export type MqttMarketMessagePayload = MqttMarketPayload[]

/**
 * Comment Message (Array of comments)
 * Topic: public/comment/{entity_type}/{entity_id}
 */
export type MqttCommentMessagePayload = MqttCommentPayload[]
