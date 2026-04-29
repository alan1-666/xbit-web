# Collection Registry - Architecture

## How Multiple Components Share Collection Instances

```
┌─────────────────────────────────────────────────────────────────┐
│                    Application Component Tree                    │
└─────────────────────────────────────────────────────────────────┘

    EventDetailsPage                Sidebar (different tree)
         │                                 │
         │ useCollection(...)              │ useCollection(...)
         │ eventSlug: 'bitcoin-2024'       │ eventSlug: 'bitcoin-2024'
         ▼                                 ▼
    ┌─────────────────────────────────────────────────┐
    │                                                 │
    │     Global Collection Registry (Map)            │
    │                                                 │
    │  Key: '["prediction","event","bitcoin-2024"]'  │
    │  Value: Collection Instance #1 ───────────────►│
    │         {                                       │
    │           queryKey: () => [...]                 │
    │           queryFn: async () => {...}            │
    │           mutations: { ... }                    │
    │         }                                       │
    │                                                 │
    └─────────────────────────────────────────────────┘
                        ▲
                        │
                        │ useCollection(...)
                        │ eventSlug: 'bitcoin-2024'
                        │
                    MarketRow


    Result: All 3 components get SAME instance (Instance #1)
            ✅ eventDetailsCollection === sidebarCollection === marketRowCollection
```

## Flow Diagram

```
Component A calls useCollection()
         │
         ├─► Create collection via factory()
         │   queryKey: ['prediction', 'event', 'bitcoin-2024']
         │
         ├─► Serialize queryKey to string
         │   queryKeyString: '["prediction","event","bitcoin-2024"]'
         │
         ├─► Check global registry
         │   ├─► Entry exists? → Return cached instance ✅
         │   └─► No entry? → Create new & cache it ✅
         │
         └─► Return collection instance


Component B calls useCollection() (same queryKey)
         │
         ├─► Create collection via factory()
         │   queryKey: ['prediction', 'event', 'bitcoin-2024']
         │
         ├─► Serialize queryKey to string
         │   queryKeyString: '["prediction","event","bitcoin-2024"]'
         │
         ├─► Check global registry
         │   └─► Entry exists! → Return SAME instance from A ✅
         │
         └─► Return collection instance (same as A)


Component C calls useCollection() (different queryKey)
         │
         ├─► Create collection via factory()
         │   queryKey: ['prediction', 'event', 'ethereum-2024']
         │
         ├─► Serialize queryKey to string
         │   queryKeyString: '["prediction","event","ethereum-2024"]'
         │
         ├─► Check global registry
         │   └─► No entry → Create NEW instance & cache it ✅
         │
         └─► Return collection instance (different from A & B)
```

## Memory Layout

```
Global Registry (Map):
┌──────────────────────────────────────────────────────────────┐
│ Key                                      │ Value             │
├──────────────────────────────────────────┼───────────────────┤
│ '["prediction","event","bitcoin-2024"]'  │ Collection #1 ──► │ Used by: EventPage, Sidebar, MarketRow
│ '["prediction","event","ethereum-2024"]' │ Collection #2 ──► │ Used by: EthereumPage
│ '["prediction","event","solana-2024"]'   │ Collection #3 ──► │ Used by: SolanaPage
└──────────────────────────────────────────┴───────────────────┘
```

## React Query Cache (Separate)

```
React Query Cache:
┌──────────────────────────────────────────────────────────────┐
│ QueryKey                                 │ Data              │
├──────────────────────────────────────────┼───────────────────┤
│ ['prediction','event','bitcoin-2024']    │ EventModel {...}  │
│ ['prediction','event','ethereum-2024']   │ EventModel {...}  │
│ ['prediction','event','solana-2024']     │ EventModel {...}  │
└──────────────────────────────────────────┴───────────────────┘
```

**Important:** Collection instances are separate from React Query cache.
- Collection Registry stores **collection definitions** (queryKey, queryFn, mutations)
- React Query Cache stores **actual data**
- They work together but are independent systems

## Benefits Summary

✅ **Single Source of Truth**: One collection instance per queryKey
✅ **Zero Prop Drilling**: Components don't need parent to pass collection
✅ **Memory Efficient**: No duplicate collection objects
✅ **Type Safe**: Full TypeScript inference maintained
✅ **Cache Coherent**: All components see same React Query cache
✅ **Hot Module Reload Safe**: Registry persists across re-renders
