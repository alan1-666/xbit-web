# EventDetailsPage State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      BaseEventDetailsPage                            │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  useEventDetailsPageReducer()                               │    │
│  │                                                              │    │
│  │  State:                          Actions:                   │    │
│  │  • selectedMarketId             • SET_SELECTED_MARKET      │    │
│  │  • selectedOutcome              • SET_SELECTED_OUTCOME     │    │
│  │  • selectedSide                 • SET_SELECTED_SIDE        │    │
│  │  • isTradeDrawerOpen            • SET_TRADE_DRAWER_OPEN    │    │
│  │  • isShowButtonGroup            • SET_SHOW_BUTTON_GROUP    │    │
│  │  • orderFormState               • SET_ORDER_FORM_STATE     │    │
│  │                                  • RESET_STATE              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  EventDetailsPageContext                                    │    │
│  │                                                              │    │
│  │  Provides:                                                  │    │
│  │  • dispatch(action)          [NEW - Direct access]         │    │
│  │  • setSelectedMarket(m)      [Wrapper function]            │    │
│  │  • setSelectedOutcome(o)     [Wrapper function]            │    │
│  │  • setTradeDrawerOpen(b)     [Wrapper function]            │    │
│  │  • ... other wrappers ...                                   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Provides Context
                              ▼
        ┌─────────────────────────────────────────────┐
        │        Consumer Components                   │
        ├─────────────────────────────────────────────┤
        │                                              │
        │  EventDetailsBottomBar                       │
        │  ├─ setSelectedOutcome('yes')               │
        │  └─ setTradeDrawerOpen(true)                │
        │                                              │
        │  MarketItem                                  │
        │  ├─ setSelectedMarket(market)               │
        │  └─ setSelectedOutcome('no')                │
        │                                              │
        │  OrderForm                                   │
        │  ├─ selectedOutcome (read)                  │
        │  └─ setSelectedOutcome(outcome)             │
        │                                              │
        │  EventDetailsPage                            │
        │  ├─ setSelectedMarket(market)               │
        │  └─ isTradeDrawerOpen (read)                │
        │                                              │
        └─────────────────────────────────────────────┘
```

## State Update Flow

### Example: User clicks "Buy Yes" button

```
User Action
    │
    ▼
EventDetailsBottomBar
    │
    │ handleBuyYes() {
    │   setSelectedOutcome('yes')  ← Wrapper function
    │   setTradeDrawerOpen(true)
    │ }
    │
    ▼
Wrapper Function (useCallback)
    │
    │ dispatch(eventDetailsPageActions.setSelectedOutcome('yes'))
    │
    ▼
Action Creator
    │
    │ Returns: { type: 'SET_SELECTED_OUTCOME', payload: 'yes' }
    │
    ▼
Reducer Function
    │
    │ switch(action.type) {
    │   case 'SET_SELECTED_OUTCOME':
    │     return { ...state, selectedOutcome: action.payload }
    │ }
    │
    ▼
State Updated
    │
    ▼
Context Re-renders
    │
    ▼
All Consumers Get New State
```

## Benefits of This Architecture

1. **Single Source of Truth**: All state in one reducer
2. **Predictable Updates**: Actions clearly describe what happened
3. **Easy to Debug**: Can log all actions and state changes
4. **Type Safe**: TypeScript ensures correct action payloads
5. **Scalable**: Easy to add new state properties
6. **Testable**: Reducer is a pure function

## Migration Path

### Phase 1: ✅ Complete (Current)
- Reducer created
- Context updated with dispatch
- Wrapper functions for backward compatibility
- All existing code works without changes

### Phase 2: Future (Optional)
- Update components to use dispatch directly
- Remove wrapper functions
- Simpler, more explicit code

```typescript
// Before (using wrapper)
setSelectedMarket(market)
setTradeDrawerOpen(true)

// After (using dispatch)
dispatch(eventDetailsPageActions.setSelectedMarket(market))
dispatch(eventDetailsPageActions.setTradeDrawerOpen(true))

// Or batch updates
dispatch(eventDetailsPageActions.setSelectedMarket(market))
dispatch(eventDetailsPageActions.setTradeDrawerOpen(true))
```
