# Implementation Details & Maintenance Guide

## Quick Reference

### Created Files
1. **useOptimisticUpdateUserPosition.ts** - Core hook for position updates
2. **orderCalculations.ts** - Utility functions for order processing
3. **IMPLEMENTATION_SUMMARY.md** - Overview document
4. **TECHNICAL_DIAGRAM.md** - Visual flow diagrams

### Modified Files
1. **usePlaceOrder.ts** - Added optimistic update logic to mutation
2. **OrderForm.tsx** - Removed redundant balance update logic

---

## File Details & Responsibilities

### useOptimisticUpdateUserPosition.ts

**Location**: `/apps/host/src/modules/prediction/hooks/useOptimisticUpdateUserPosition.ts`

**Responsibility**: Update user positions across all cached queries matching the predicate

**Key Implementation Details**:

```typescript
export const useOptimisticUpdateUserPosition = () => {
  // 1. Get wallet to scope updates
  const wallet = useProxyWallet()

  // 2. Define updater function (updates old cache data)
  const updater = useCallback((
    oldData: InfiniteData<PositionModel[]> | undefined,
    data: PositionUpdateData
  ) => {
    // Handle buy/sell logic here
    // Returns: updated InfiniteData structure
  }, [])

  // 3. Use predicate-based cache update hook
  return useUpdateQueriesCache<InfiniteData<PositionModel[]>, PositionUpdateData>({
    predicate: (query) => {
      // Match ALL user position queries for this wallet
      return QUERY_KEYS_CONFIGS.predicateUserPositions(
        query.queryKey as string[],
        wallet
      )
    },
    updater: updater,
  })
}
```

**Why Predicate-Based?**
- Single predicate matches all position queries regardless of eventId/filter
- Event-level and market-level positions automatically updated
- No need to manage separate update functions per query variant

**Position Matching Strategy**:
```typescript
// Find position by marketId + outcome combo
const existingPositionIndex = positions.findIndex(
  (p) => p.marketId === marketId && p.outcome === outcome
)

// This ensures we update the correct position even if multiple markets exist
```

**Weighted Average Price Calculation** (Buy Orders):
```typescript
// Example: 
// Old: size=100, avgPrice=0.50
// New order: size=50, price=0.48
// 
// newAvgPrice = (0.50 × 100 + 0.48 × 50) / (100 + 50)
//             = (50 + 24) / 150
//             = 0.4933

const newAvgPrice = (oldAvgPrice * oldSize + price * size) / newSize
```

**Sell Order Logic** (Keep avgPrice):
- avgPrice represents average entry price (weighted cost basis)
- Selling doesn't change entry price, only reduces quantity
- Only avgPrice calculation for buy orders, not sell

---

### orderCalculations.ts

**Location**: `/apps/host/src/modules/prediction/hooks/orderCalculations.ts`

**Responsibility**: Transform order responses into updateable cache payloads

**Function: createPositionUpdateData()**
```typescript
export const createPositionUpdateData = (
  order: OrderResponseDto | undefined,
  formData: OrderFormDataWithMarketId,
): PositionUpdateData | null => {
  // 1. Validate inputs
  if (!order || order.size === 0) return null
  
  // 2. Determine price (use response, fallback to form)
  let price = order.price || 0
  if (price === 0) {
    price = (formData.outcome === 'yes' ? formData.yesPrice : formData.noPrice) || 0
  }
  if (price === 0) return null  // Can't update without price
  
  // 3. Transform to PositionUpdateData type
  return {
    marketId: formData.marketId,
    outcome: formData.outcome === 'yes' ? 'Yes' : 'No',  // Format match
    side: formData.side as 'buy' | 'sell',
    size: order.size,
    price,
  }
}
```

**Fallback Price Logic**:
- Prefer: `order.price` (actual execution price from API)
- Fallback: `formData.yesPrice` or `formData.noPrice` (current market price)
- Skip: return null if both are 0 (can't update without price reference)

**Function: calculateUsdcAmount()**
```typescript
// Simple calculation: size × price = USDC amount
// Example: 100 shares × 0.48 = 48 USDC

export const calculateUsdcAmount = (order: OrderResponseDto | undefined): number => {
  if (!order) return 0
  return order.size * (order.price || 0)
}
```

---

### usePlaceOrder.ts (Modified)

**Location**: `/apps/host/src/modules/prediction/components/shared/order-form/hooks/usePlaceOrder.ts`

**Key Changes**:

```typescript
export const usePlaceOrderMutation = (options: UsePlaceOrderMutationOptions = {}) => {
  // Initialize all optimistic update hooks
  const removePosition = useRemoveUserActivePositionOptimistic()
  const optimisticUpdateUSDCBalance = useOptimisticUpdateMyUSDCBalance()
  const optimisticUpdateConditionalTokenBalance = useOptimisticUpdateMyConditionalTokenBalance()
  const optimisticUpdateUserPosition = useOptimisticUpdateUserPosition()
  
  return useMutation({
    mutationFn: async (formData) => {
      // ... order placement logic (unchanged)
    },
    onSuccess: (data, formData) => {
      // Remove old position (existing logic)
      removePosition(formData.conditionId)
      
      // NEW: Only apply optimistic updates for market orders
      if (formData.orderType === 'market' && data) {
        // 1. Calculate amounts
        const usdcAmount = calculateUsdcAmount(data)
        
        // 2. Update USDC: subtract for buy, add for sell
        optimisticUpdateUSDCBalance(
          usdcAmount,
          formData.side === 'buy' ? 'reduce' : 'add'
        )
        
        // 3. Update tokens: add for buy, subtract for sell
        optimisticUpdateConditionalTokenBalance(
          formData.tokenId,
          data.size,
          formData.side === 'buy' ? 'add' : 'reduce'
        )
        
        // 4. Update positions with calculation
        const positionUpdateData = createPositionUpdateData(data, formData)
        if (positionUpdateData) {
          optimisticUpdateUserPosition(positionUpdateData)
        }
      }
      
      // Call original callback
      onSuccess?.(data, formData)
    },
  })
}
```

**Important: Market Orders Only**
- Optimistic updates only for `orderType === 'market'`
- Limit orders skipped (async execution, harder to predict)
- Prevents errors from speculative price assumptions

---

### OrderForm.tsx (Modified)

**Location**: `/apps/host/src/modules/prediction/components/shared/OrderForm.tsx`

**Changes Made**:
1. Removed imports: `useOptimisticUpdateMyUSDCBalance`, `useOptimisticUpdateMyConditionalTokenBalance`
2. Simplified `useHandleOnOrderSuccess()` - now just a placeholder for future side effects

**Before**:
```typescript
const useHandleOnOrderSuccess = () => {
  const optimisticUpdateUSDCBalance = useOptimisticUpdateMyUSDCBalance()
  const optimisticUpdateCTBalance = useOptimisticUpdateMyConditionalTokenBalance()
  return useCallback((data: OrderResponseDto | undefined, formData) => {
    // ... manual balance updates
  }, [])
}
```

**After**:
```typescript
const useHandleOnOrderSuccess = () => {
  return useCallback((data: OrderResponseDto | undefined, formData) => {
    // Optimistic updates now handled in usePlaceOrderMutation.onSuccess
    // This callback can be used for additional side effects if needed
    console.log('Order success:', data, formData)
  }, [])
}
```

**Why Move Logic to Mutation?**
- Centralized: All order handling in one place
- Maintainability: Future devs look in mutation, not component
- Consistency: Guaranteed to run before other callbacks

---

## Testing Strategy

### Unit Tests for orderCalculations

```typescript
describe('createPositionUpdateData', () => {
  it('should create position update data from valid order', () => {
    const order: OrderResponseDto = {
      size: 100,
      price: 0.50,
      marketId: 'btc',
      outcome: Outcome.Yes,
    }
    const formData = { marketId: 'btc', outcome: 'yes', ... }
    
    const result = createPositionUpdateData(order, formData)
    
    expect(result).toEqual({
      marketId: 'btc',
      outcome: 'Yes',
      size: 100,
      price: 0.50,
    })
  })
  
  it('should return null for zero size', () => {
    const order = { size: 0, price: 0.50, ... }
    const result = createPositionUpdateData(order, formData)
    expect(result).toBeNull()
  })
})

describe('calculateUsdcAmount', () => {
  it('should calculate USDC amount correctly', () => {
    const order: OrderResponseDto = { size: 100, price: 0.50, ... }
    const result = calculateUsdcAmount(order)
    expect(result).toBe(50) // 100 × 0.50
  })
})
```

### Integration Tests for useOptimisticUpdateUserPosition

```typescript
describe('useOptimisticUpdateUserPosition', () => {
  it('should add new position for buy order', () => {
    // 1. Setup: Create query cache with existing positions
    // 2. Execute: Call optimisticUpdateUserPosition with buy order data
    // 3. Assert: New position added at beginning, avgPrice = execution price
  })
  
  it('should update existing position with weighted average', () => {
    // 1. Setup: Existing position (size=100, avgPrice=0.50)
    // 2. Execute: Buy order (size=50, price=0.48)
    // 3. Assert: newSize=150, newAvgPrice=(0.50×100+0.48×50)/150
  })
  
  it('should remove position when size becomes zero', () => {
    // 1. Setup: Existing position (size=50)
    // 2. Execute: Sell order (size=50)
    // 3. Assert: Position removed from cache
  })
  
  it('should update all event-filtered caches', () => {
    // 1. Setup: Multiple cached queries with different eventId filters
    // 2. Execute: Position update
    // 3. Assert: All matching queries updated via predicate
  })
})
```

---

## Common Issues & Solutions

### Issue: Position not updating after order

**Cause**: `orderType` is 'limit' instead of 'market'
**Solution**: Check `formData.orderType` - optimistic updates only for market orders

### Issue: avgPrice calculation incorrect

**Cause**: Not using weighted average formula
**Current**: `(oldAvgPrice × oldSize + newPrice × newSize) / totalSize` ✓
**Wrong**: `(oldAvgPrice + newPrice) / 2` ✗

### Issue: Position deleted when size still > 0

**Cause**: Using `newSize <= 0` for removal instead of `< 0`
**Current**: Removes if `newSize <= 0` ✓ (handles exact zero)
**Check**: Ensure calculation `oldSize - orderSize` isn't off

### Issue: Cache updates not visible in UI

**Cause**: Query key format doesn't match predicate
**Debug**: 
1. Check `QUERY_KEYS_CONFIGS.predicateUserPositions()` logic
2. Log query keys in cache: `queryClient.getQueriesData()`
3. Verify wallet address is consistent

---

## Future Enhancements

### 1. Market-Level Position Updates
```typescript
// If separate market position cache exists:
const useOptimisticUpdateMarketPosition = (marketId: string) => {
  // Update positions for specific market only
  // Useful if market positions cached separately from user positions
}
```

### 2. Optimistic Reversions
```typescript
// If server returns different data than optimistic update:
onError: (error, variables) => {
  queryClient.invalidateQueries({
    queryKey: ['prediction', 'users', wallet, 'positions']
  })
  // Refetch to sync with server
}
```

### 3. Position Metrics Recalculation
```typescript
// If needed, add post-update calculations:
// - cashPnl = (currentPrice - avgPrice) × size
// - curPrice (current market price)
// - percentPnl = (cashPnl / (avgPrice × size)) × 100
```

### 4. Batch Updates
```typescript
// If multiple orders executed simultaneously:
const optimisticUpdateMultiplePositions = (updates: PositionUpdateData[]) => {
  updates.forEach(update => {
    optimisticUpdateUserPosition(update)
  })
}
```

---

## Migration Checklist

If integrating with other mutation/query flows:

- [ ] Ensure all market orders use `usePlaceOrderMutation`
- [ ] Remove any manual balance updates after order placement
- [ ] Remove any manual position updates after order placement
- [ ] Use `useOptimisticUpdateUserPosition` for position-related mutations
- [ ] Use `useOptimisticUpdateMyUSDCBalance` for other USDC updates
- [ ] Use `useOptimisticUpdateMyConditionalTokenBalance` for token updates
- [ ] Test that event-filtered position queries reflect updates
- [ ] Test that market-filtered position queries reflect updates
- [ ] Verify TypeScript types are consistent (PositionUpdateData shape)

