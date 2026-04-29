# OrderBook Component

A modular order book component for displaying market order books with buy/sell orders, prices, and depth visualization.

## Structure

```
order-book/
├── index.ts                      # Barrel export file
├── types.ts                      # TypeScript type definitions
├── OrderBookHeader.tsx           # Header component (Price, Shares, Total)
├── OrderBookRow.tsx              # Individual order row component
├── OrderBookSpread.tsx           # Spread and last price component
├── OrderBookSkeleton.tsx         # Loading skeleton component
├── OrderBookEmptyState.tsx       # Empty state component (No bids/asks)
├── OrderBookSellOrders.tsx       # Sell orders list component
├── OrderBookBuyOrders.tsx        # Buy orders list component
└── useOrderBookProcessor.ts      # Hook for processing order book data
```

## Components

### OrderBook (Main Component)

The main container component that orchestrates all sub-components.

**Props:**
- `marketId: string` - Market identifier
- `tokenId: string` - Token identifier

**Usage:**
```tsx
<OrderBook marketId="123" tokenId="abc" />
```

### OrderBookHeader

Displays the header row with column labels (Price, Shares, Total).

### OrderBookRow

Displays a single order row with price, size, and total value. Supports both buy (green) and sell (red) orders with depth visualization.

**Props:**
- `order: OrderWithDepth` - Order data with depth information
- `type: 'buy' | 'sell'` - Order type for styling

### OrderBookSpread

Displays the last traded price and the spread between best bid and ask.

**Props:**
- `last: number` - Last traded price
- `spread: number` - Spread value

### OrderBookSkeleton

Loading state component with skeleton placeholders.

### OrderBookEmptyState

Displays an empty state message when there are no orders.

**Props:**
- `type: 'bids' | 'asks'` - Type of orders missing

**Usage:**
```tsx
<OrderBookEmptyState type="bids" />  // Shows "No bids"
<OrderBookEmptyState type="asks" />  // Shows "No asks"
```

### OrderBookSellOrders

Renders the list of sell orders (asks). Automatically shows empty state if no orders.

**Props:**
- `orders: OrderWithDepth[]` - Array of sell orders with depth

**Usage:**
```tsx
<OrderBookSellOrders orders={sellOrders} />
```

### OrderBookBuyOrders

Renders the list of buy orders (bids). Automatically shows empty state if no orders.

**Props:**
- `orders: OrderWithDepth[]` - Array of buy orders with depth

**Usage:**
```tsx
<OrderBookBuyOrders orders={buyOrders} />
```

## Hooks

### useOrderBookProcessor

Processes raw order book data into structured buy/sell orders with depth calculations.

**Options:**
- `data: OrderBookData[] | undefined` - Raw order book data
- `maxOrders?: number` - Maximum number of orders to display (default: 5)

**Returns:**
- `buyOrders: OrderWithDepth[]` - Processed buy orders
- `sellOrders: OrderWithDepth[]` - Processed sell orders
- `last: number` - Last price
- `spread: number` - Spread value

**Usage:**
```tsx
const { buyOrders, sellOrders, last, spread } = useOrderBookProcessor({ 
  data,
  maxOrders: 10 
})
```

## Types

### OrderWithDepth
```ts
{
  price: string
  size: string
  depth: number  // 0-1 representing cumulative depth
}
```

### OrderBookData
```ts
{
  bids: Array<{ price: string; size: string }>
  asks: Array<{ price: string; size: string }>
}
```

## Features

- ✅ Modular component architecture
- ✅ Type-safe with TypeScript
- ✅ Depth visualization with gradient backgrounds
- ✅ Separate buy (green) and sell (red) styling
- ✅ Loading skeleton for better UX
- ✅ Customizable max orders display
- ✅ Spread and last price calculation
- ✅ Responsive grid layout

## Styling

The component uses Tailwind CSS classes and custom CSS variables:
- `--rise-transaction-bg` - Background gradient for buy orders
- `--fall-transaction-bg` - Background gradient for sell orders
- `.text-rise` - Green text for buy orders
- `.text-fall` - Red text for sell orders
