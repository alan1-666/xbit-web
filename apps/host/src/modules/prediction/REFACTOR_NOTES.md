# EventDetailsPageContext Refactor - useReducer Migration

## Overview
Refactored the EventDetailsPageContext from using multiple `useState` hooks to a single `useReducer` for better state management and scalability.

## What Changed

### Before (Multiple useState hooks)
```typescript
const [selectedMarketId, setSelectedMarketId] = useState<string>()
const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>('yes')
const [selectedSide, setSelectedSide] = useState<'buy' | 'sell' | undefined>('buy')
const [isTradeDrawerOpen, setTradeDrawerOpen] = useState(false)
const [isShowButtonGroup, setIsShowButtonGroup] = useState(false)
const [orderFormState, setOrderFormState] = useState<OrderFormState>({})
```

### After (Single useReducer)
```typescript
const [state, dispatch] = useEventDetailsPageReducer()
```

## Files Modified

1. **Created**: `hooks/useEventDetailsPageReducer.ts`
   - Centralized state interface `EventDetailsPageState`
   - Action types `EventDetailsPageAction`
   - Reducer function
   - Type-safe action creators in `eventDetailsPageActions`

2. **Updated**: `contexts/EventDetailsPageContext.ts`
   - Added `dispatch` function to context
   - Kept backward-compatible wrapper functions
   - Updated context default values

3. **Refactored**: `components/shared/BaseEventDetailsPage.tsx`
   - Replaced 6 `useState` hooks with 1 `useReducer`
   - Created wrapper functions using `useCallback` for backward compatibility
   - Simplified `useMemo` dependencies

## Benefits

1. **Centralized State Management**: All state updates go through a single reducer
2. **Better Scalability**: Easy to add new state properties without cluttering the component
3. **Type Safety**: Action creators ensure type-safe dispatches
4. **Easier Debugging**: State changes are predictable and traceable
5. **Better Performance**: Fewer hook calls and optimized dependencies

## Backward Compatibility

All existing components continue to work without changes. Wrapper functions are provided:
- `setSelectedMarket(market)` → `dispatch(eventDetailsPageActions.setSelectedMarket(market))`
- `setSelectedOutcome(outcome)` → `dispatch(eventDetailsPageActions.setSelectedOutcome(outcome))`
- `setTradeDrawerOpen(open)` → `dispatch(eventDetailsPageActions.setTradeDrawerOpen(open))`
- etc.

## Usage Examples

### Using Wrapper Functions (Backward Compatible)
```typescript
const { setSelectedMarket, setTradeDrawerOpen } = useEventDetailsPageContext()

// Use existing API
setSelectedMarket(market)
setTradeDrawerOpen(true)
```

### Using Dispatch Directly (Recommended for New Code)
```typescript
const { dispatch } = useEventDetailsPageContext()

// More explicit and type-safe
dispatch(eventDetailsPageActions.setSelectedMarket(market))
dispatch(eventDetailsPageActions.setTradeDrawerOpen(true))
```

## Future Improvements

1. **Gradual Migration**: Components can be gradually updated to use `dispatch` directly
2. **Complex Actions**: Can add composite actions that update multiple state properties
3. **Middleware**: Easy to add logging, analytics, or async handling
4. **Testing**: Reducer logic can be tested independently from React components

## No Breaking Changes

✅ All existing components work without modifications
✅ Full backward compatibility maintained
✅ Zero runtime errors expected
✅ TypeScript compilation successful
