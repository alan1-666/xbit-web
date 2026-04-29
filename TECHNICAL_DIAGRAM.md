# Optimistic Updates Flow Diagram

## Data Flow: Market Order Placement → Optimistic Cache Updates

```
┌─────────────────────────────────────────────────────────────────┐
│ User clicks "Place Market Order"                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ usePlaceOrderMutation.mutate(OrderFormDataWithMarketId)         │
│ - orderType: 'market'                                            │
│ - side: 'buy' | 'sell'                                           │
│ - outcome: 'yes' | 'no'                                          │
│ - marketId, tokenId, size, price, etc.                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ orderService.placeMarketOrder() ← Async API Call                │
│ Returns: OrderResponseDto { size, price, outcome, marketId }    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │ onSuccess Callback Triggered   │
        └────────────────────┬───────────┘
                             │
        ┌────────────────────┴────────────────┐
        │                                     │
        ▼                                     ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│ removePosition()          │    │ if (orderType='market')  │
│ - Removes old position    │    │ - Continue with updates  │
│   from cache              │    └──────────────┬───────────┘
└──────────────────────────┘                    │
                                                ▼
                                   ┌────────────────────────────┐
                                   │ calculateUsdcAmount()      │
                                   │ = size × price             │
                                   └────────────┬───────────────┘
                                                │
                        ┌───────────────────────┼───────────────────────┐
                        │                       │                       │
                        ▼                       ▼                       ▼
                ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
                │ Update USDC      │   │ Update Cond.     │   │ Update Positions │
                │ Balance          │   │ Token Balance    │   │                  │
                ├──────────────────┤   ├──────────────────┤   ├──────────────────┤
                │ optimisticUpdate │   │ optimisticUpdate │   │ createPosition   │
                │ USDCBalance()    │   │ ConditionalToken │   │ UpdateData()     │
                │                  │   │ Balance()        │   │                  │
                │ Direction:       │   │ Direction:       │   │ Then:            │
                │ buy → 'reduce'   │   │ buy → 'add'      │   │ optimisticUpdate │
                │ sell → 'add'     │   │ sell → 'reduce'  │   │ UserPosition()   │
                └──────────────────┘   └──────────────────┘   └──────────────────┘
                        │                       │                       │
                        └───────────────────────┼───────────────────────┘
                                                ▼
                        ┌───────────────────────────────────────┐
                        │ All React Query Caches Updated        │
                        │ - User position queries updated       │
                        │ - Event position queries updated      │
                        │ - Market position queries updated     │
                        │ (via predicateUserPositions match)    │
                        └───────────────────────────────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────────────┐
                        │ UI Redraws Immediately with:          │
                        │ - New USDC balance                    │
                        │ - New token balance                   │
                        │ - Updated positions                   │
                        │ (optimistic update: no loading wait)  │
                        └───────────────────────────────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────────────┐
                        │ Server eventually responds            │
                        │ - If matches optimistic: no change    │
                        │ - If differs: automatic refetch       │
                        └───────────────────────────────────────┘
```

---

## Cache Update Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│            React Query Cache Layer                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ USDC Balance Cache                                         │  │
│  │ Key: ['prediction', 'usdc-balance', walletAddress]         │  │
│  │ ─────────────────────────────────────────────────────────  │  │
│  │ useOptimisticUpdateMyUSDCBalance() → Direct update         │  │
│  │ Old: 1000.50 USDC                                          │  │
│  │ Buy order (100 USDC): New: 900.50 USDC ✓                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Conditional Token Balance Cache                            │  │
│  │ Key: ['prediction', 'conditional-token-balance',           │  │
│  │        walletAddress, tokenId]                             │  │
│  │ ─────────────────────────────────────────────────────────  │  │
│  │ useOptimisticUpdateMyConditionalTokenBalance() → Direct    │  │
│  │ Old: 500 tokens                                            │  │
│  │ Buy order (100 tokens): New: 600 tokens ✓                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ User Positions Caches (Multiple)                           │  │
│  │ ─────────────────────────────────────────────────────────  │  │
│  │ Key Pattern 1: ['prediction', 'users', wallet, 'positions']│  │
│  │ Key Pattern 2: ['prediction', 'users', wallet, 'positions',│  │
│  │                 eventId, filter]                           │  │
│  │ ─────────────────────────────────────────────────────────  │  │
│  │ Matching Strategy: predicateUserPositions()                │  │
│  │ ├─ Checks: queryKey[0] === 'prediction'                    │  │
│  │ ├─ Checks: queryKey[1] === 'users'                         │  │
│  │ ├─ Checks: queryKey[2] === walletAddress                   │  │
│  │ └─ Checks: queryKey[3] === 'positions'                     │  │
│  │ ─────────────────────────────────────────────────────────  │  │
│  │ useOptimisticUpdateUserPosition() → Predicate Match + Update│  │
│  │                                                             │  │
│  │ Before Buy Order (Market: ETH/BTC, Outcome: YES):          │  │
│  │ [ { marketId: 'eth', outcome: 'Yes', size: 100, ... } ]    │  │
│  │                                                             │  │
│  │ After Buy Order (New position):                            │  │
│  │ [ { marketId: 'btc', outcome: 'Yes', size: 50,             │  │
│  │      avgPrice: 0.48, ... },                                │  │
│  │   { marketId: 'eth', outcome: 'Yes', size: 100, ... } ] ✓  │  │
│  │                                                             │  │
│  │ After Buy Order (Existing position):                       │  │
│  │ [ { marketId: 'eth', outcome: 'Yes', size: 150,            │  │
│  │      avgPrice: 0.495, ... } ] ✓                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Position Update Logic: Buy vs Sell

### BUY Order: Adding/Updating Position

```
Step 1: Find existing position
├─ Query: p.marketId === formData.marketId AND p.outcome === outcome
└─ Result: existing position OR undefined

Step 2A: No existing position → CREATE
├─ Insert at beginning of array
├─ New position: {
│  ...templatePosition,
│  marketId: 'btc',
│  outcome: 'Yes',
│  size: 100,
│  avgPrice: 0.50
│ }
└─ Return: [NEW_POSITION, ...oldPositions]

Step 2B: Position exists → UPDATE (Weighted Average)
├─ Calculate new size: newSize = oldSize + orderSize
│  Example: 100 + 50 = 150
│
├─ Calculate new avgPrice: 
│  newAvgPrice = (oldAvgPrice × oldSize + orderPrice × orderSize) / newSize
│  Example: (0.50 × 100 + 0.48 × 50) / 150
│         = (50 + 24) / 150
│         = 0.4933
│
└─ Return updated position with new size & avgPrice
```

### SELL Order: Decreasing/Removing Position

```
Step 1: Find existing position
├─ Query: p.marketId === formData.marketId AND p.outcome === outcome
└─ Result: existing position (must exist for sell)

Step 2: Calculate remaining size
├─ newSize = oldSize - orderSize
├─ Example: 100 - 30 = 70
└─ Continue to Step 3

Step 3: Check if position should be removed
├─ if newSize <= 0:
│  └─ Remove entire position from cache
│     Return: [otherPositions...] without current
│
└─ if newSize > 0:
   └─ Update position with new size
      avgPrice remains unchanged (= average entry price)
      Return: updated position with new size
```

---

## Type Safety: PositionUpdateData

```typescript
// Input from Order Response
OrderResponseDto {
  size: 100,           // Actual executed size
  price: 0.48,         // Actual execution price
  marketId: 'btc',
  outcome: 'Yes',
  side: 'BUY'
}

// Input from Form
OrderFormDataWithMarketId {
  side: 'buy',
  outcome: 'yes',
  yesPrice: 0.50,      // Current market price (fallback)
  noPrice: 0.45,
  ...
}

// Transform to PositionUpdateData
↓ createPositionUpdateData(order, formData)

PositionUpdateData {
  marketId: 'btc',           // ← From order
  outcome: 'Yes',            // ← Convert from 'yes' to 'Yes'
  side: 'buy',               // ← From formData
  size: 100,                 // ← From order
  price: 0.48                // ← From order (or formData fallback)
}

// Used by updater function
↓ useOptimisticUpdateUserPosition(positionUpdateData)

Updates ALL matching caches via predicate
```

---

## Error Handling & Edge Cases

```
Input Validation:
├─ order is undefined → return null, skip update
├─ order.size === 0 → return null, skip update
├─ order.price === 0 && formData.price === 0 → return null, skip update
└─ Valid data → proceed with cache update

Position Update Edge Cases:
├─ Buy order, no existing position
│  └─ Create new position
│
├─ Buy order, position exists
│  └─ Update size + recalculate avgPrice
│
├─ Sell order, no existing position
│  └─ Skip update (shouldn't happen in practice)
│
├─ Sell order, newSize = 0
│  └─ Remove position entirely
│
├─ Sell order, newSize < 0
│  └─ Remove position (safety: shouldn't happen due to order validation)
│
└─ Sell order, newSize > 0
   └─ Update size, keep avgPrice
```

