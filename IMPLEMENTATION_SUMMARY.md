# Implementation Summary: Optimistic Updates for Place Order

## Overview
Successfully implemented optimistic cache updates for market orders in the prediction module. When a market order succeeds, the system now immediately updates:
1. USDC balance
2. Conditional token balance  
3. User positions (across all event/market filters)

## Files Created

### 1. `/apps/host/src/modules/prediction/hooks/useOptimisticUpdateUserPosition.ts`
**Purpose**: Hook to optimistically update user positions across all React Query caches matching `predicateUserPositions`.

**Key Features**:
- Automatically applies updates to all user position queries regardless of event/market filters
- **Buy orders**: Adds new position or updates existing by:
  - Calculating new size: `newSize = oldSize + orderSize`
  - Calculating new avgPrice: `newAvgPrice = (oldAvgPrice × oldSize + orderPrice × orderSize) / newSize`
- **Sell orders**: Decreases position by:
  - Calculating remaining size: `newSize = oldSize - orderSize`
  - Removing position entirely if `newSize <= 0`
  - Keeping avgPrice unchanged (avgPrice = average entry price)
- Uses `useUpdateQueriesCache` with predicate pattern for broad cache matching

**Exports**:
- `useOptimisticUpdateUserPosition()` - Main hook
- `PositionUpdateData` - Type interface for position update payload

---

### 2. `/apps/host/src/modules/prediction/hooks/orderCalculations.ts`
**Purpose**: Utility functions to convert order responses into position update payloads.

**Functions**:
- `createPositionUpdateData(order, formData)` - Transforms OrderResponseDto + OrderFormDataWithMarketId into PositionUpdateData
  - Returns `null` if data insufficient (order size = 0 or price = 0)
  - Fallback: Uses form data prices if order response lacks price
  
- `calculateUsdcAmount(order)` - Calculates USDC amount to update balance
  - Formula: `size × price`

---

## Files Modified

### 3. `/apps/host/src/modules/prediction/components/shared/order-form/hooks/usePlaceOrder.ts`

**Changes**:
- Added imports for optimistic update hooks and calculation utilities
- Updated `usePlaceOrderMutation` to call optimistic update hooks in `onSuccess` callback
- Optimistic updates only apply to **market orders** (`formData.orderType === 'market'`)

**Logic Flow** (on market order success):
```
1. Remove old position (existing logic)
2. Calculate USDC amount from response
3. Update USDC balance (reduce for buy, add for sell)
4. Update conditional token balance (add for buy, reduce for sell)
5. Create position update data from order response
6. Update all user position caches using predicate matching
```

---

### 4. `/apps/host/src/modules/prediction/components/shared/OrderForm.tsx`

**Changes**:
- Removed redundant optimistic update imports (`useOptimisticUpdateMyUSDCBalance`, `useOptimisticUpdateMyConditionalTokenBalance`)
- Simplified `useHandleOnOrderSuccess` hook - now only used for additional side effects
- All balance and position updates handled in `usePlaceOrderMutation.onSuccess`

---

## How It Works: Cache Update Strategy

### User Positions
The implementation leverages existing `QUERY_KEYS_CONFIGS.predicateUserPositions()` to match ALL user position queries:
- ✅ Top-level user positions (no event filter)
- ✅ Event-scoped positions (filtered by eventId)
- ✅ Market-scoped positions (all positions for a market)

Single `useUpdateQueriesCache` call updates all matching caches simultaneously.

### USDC & Token Balances
Direct cache updates using exact query keys from:
- `useOptimisticUpdateMyUSDCBalance` (from `useMyUSDCBalance`)
- `useOptimisticUpdateMyConditionalTokenBalance` (from `useConditionalTokenBalance`)

---

## Type Safety

**PositionUpdateData Interface**:
```typescript
interface PositionUpdateData {
  marketId: string        // Required to match position
  outcome: 'Yes' | 'No'   // Required to match position
  side: 'buy' | 'sell'    // Determines update logic
  size: number            // Order size
  price: number           // Execution price
}
```

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Buy order, no existing position | Create new position with avgPrice = execution price |
| Buy order, position exists | Update size and recalculate avgPrice using weighted average |
| Sell order, position size becomes 0 | Remove position entirely |
| Sell order, position size becomes negative | Remove position (safety check) |
| Order price missing from response | Fallback to formData outcome prices |
| Order size = 0 | Skip position update (return null) |
| Limit orders | Skip all optimistic updates (only market orders) |

---

## Testing Checklist

- [ ] Buy market order updates USDC balance correctly
- [ ] Buy market order updates conditional token balance correctly  
- [ ] Buy market order creates new position when none exists
- [ ] Buy market order updates existing position with correct avgPrice
- [ ] Sell market order reduces position size correctly
- [ ] Sell market order removes position when size reaches 0
- [ ] Event-filtered position queries reflect the update
- [ ] Market-filtered position queries reflect the update
- [ ] Limit orders do NOT trigger optimistic updates
- [ ] Null responses don't cause errors

---

## Future Enhancements

1. **Market-Level Position Cache**: If separate market positions collection cache exists, could add dedicated hook `useOptimisticUpdateMarketPosition` for direct market position updates
   
2. **Event-Level Updates**: Could create `useOptimisticUpdateEventPositions` if event-specific position queries exist separately from user positions

3. **Position Metrics**: Could add avgPrice and profitability recalculations if needed

4. **Optimistic Reversions**: Add support for reverting optimistic updates on error (currently relies on query invalidation/refetch)

---

## Dependencies

- `@tanstack/react-query` - Cache management
- `useProxyWallet()` - Get current user wallet
- `useUpdateQueriesCache()` - Predicate-based cache updates
- `QUERY_KEYS_CONFIGS` - Standardized query key configs
- `PositionModel` - Position type definition

---

## Migration Notes

If you have other places that manually update position caches after orders:
- Remove those manual updates (now handled in mutation)
- All position updates should go through `useOptimisticUpdateUserPosition` for consistency
- Balance updates should use the `useOptimisticUpdateMy*Balance` hooks

