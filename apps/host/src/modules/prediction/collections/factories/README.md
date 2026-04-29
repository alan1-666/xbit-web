# Collection Pattern - Event Factory

## Overview

The event collection factory provides a type-safe, reusable pattern for managing event data with React Query. It supports:

- **Dynamic query keys** - Each event gets its own scoped cache
- **Global instance sharing** - Components with same queryKey share the exact same collection instance
- **Optimistic updates** - Update UI immediately, rollback on error
- **Type safety** - Full TypeScript inference for data and mutations
- **Real-time updates** - Integrate with MQTT for live market data

## Collection Instance Sharing

### How it works

When multiple components use `useCollection()` with the same queryKey, they all receive **the exact same collection instance** (same object reference):

```typescript
// Component A
function ComponentA() {
  const eventCollection = useCollection(() => createEventCollection('event-123'))
  // Creates new instance, stores in global registry
}

// Component B (different part of app)
function ComponentB() {
  const eventCollection = useCollection(() => createEventCollection('event-123'))
  // ✅ Returns SAME instance from registry (eventCollectionA === eventCollectionB)
}

// Component C
function ComponentC() {
  const eventCollection = useCollection(() => createEventCollection('event-456'))
  // Different queryKey → creates NEW instance
}
```

### Benefits

1. **Zero Prop Drilling** - No need to pass collection through component tree
2. **Memory Efficient** - Only one collection object per unique queryKey
3. **Consistent State** - All components work with the same instance
4. **Mutation Sync** - Updates from one component visible to all others
5. **Cache Sharing** - React Query cache properly shared via queryKey

### Cleanup

Clear all cached collection instances (useful for logout or testing):

```typescript
import { clearCollectionRegistry } from '@/modules/prediction/collections/base'

function logout() {
  clearCollectionRegistry()  // Clear all collection instances
  queryClient.clear()         // Clear React Query cache
}
```

## Usage

### Basic Usage

```typescript
import { useCollection, useCollectionQuery } from '@/modules/prediction/collections/base'
import { createEventCollection } from '@/modules/prediction/collections/factories/event.factory'

function EventDetails({ eventSlug }: { eventSlug: string }) {
  // Create collection instance for this event
  const eventCollection = useCollection(() => createEventCollection(eventSlug))
  
  // Fetch event data
  const { data: event, isLoading } = useCollectionQuery({ 
    collection: eventCollection 
  })
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>{event?.title}</div>
}
```

### With Mutations

```typescript
import { useCollectionMutation } from '@/modules/prediction/collections/base'

function EventActions({ eventSlug }: { eventSlug: string }) {
  const eventCollection = useCollection(() => createEventCollection(eventSlug))
  
  // Update event
  const { mutate: updateEvent, isPending } = useCollectionMutation({
    collection: eventCollection,
    mutation: 'updateEvent'
  })
  
  // Update market (for MQTT updates)
  const { mutate: updateMarket } = useCollectionMutation({
    collection: eventCollection,
    mutation: 'updateMarket'
  })
  
  // Toggle favorite
  const { mutate: toggleFavorite } = useCollectionMutation({
    collection: eventCollection,
    mutation: 'toggleFavorite'
  })
  
  return (
    <div>
      <button 
        onClick={() => updateEvent({ title: 'New Title' })}
        disabled={isPending}
      >
        Update Event
      </button>
      
      <button onClick={() => toggleFavorite(true)}>
        Add to Favorites
      </button>
    </div>
  )
}
```

### Real-time Market Updates (MQTT)

```typescript
import { useEffect } from 'react'
import { useMqttSubscription } from '@/hooks/mqtt'

function EventWithLiveMarkets({ eventSlug }: { eventSlug: string }) {
  const eventCollection = useCollection(() => createEventCollection(eventSlug))
  const { data: event } = useCollectionQuery({ collection: eventCollection })
  const { mutate: updateMarket } = useCollectionMutation({
    collection: eventCollection,
    mutation: 'updateMarket'
  })
  
  // Subscribe to market updates via MQTT
  useMqttSubscription(`market/${event?.markets?.[0]?.id}`, (payload) => {
    updateMarket({
      id: payload.marketId,
      outcomePrices: payload.prices,
      volume: payload.volume
    })
  })
  
  return <div>{/* Render event with live updating markets */}</div>
}
```

## Available Mutations

### updateEvent

Update the entire event object optimistically.

```typescript
updateEvent({ 
  title: 'Updated Title',
  description: 'Updated Description'
})
```

### updateMarket

Update a specific market within the event (useful for MQTT updates).

```typescript
updateMarket({
  id: 'market-123',
  outcomePrices: ['0.65', '0.35'],
  volume: 1000000
})
```

### toggleFavorite

Toggle favorite status for the event.

```typescript
toggleFavorite(true) // Add to favorites
toggleFavorite(false) // Remove from favorites
```

## Benefits

1. **Scoped Cache** - Each event has its own cache entry by slug
2. **Automatic Rollback** - Failed mutations automatically rollback to previous state
3. **Type Safety** - Full TypeScript inference for all data and mutations
4. **Reusable** - Same pattern can be used for other entities (positions, markets, etc.)
5. **Optimistic UI** - Instant UI updates for better UX

## Architecture

```
createEventCollection(eventSlug) 
  ↓
Collection Definition
  ↓
useCollection() → Collection Instance
  ↓
useCollectionQuery() → Event Data
useCollectionMutation() → Update Functions
```

## See Also

- [Base Collection Pattern](../base.ts)
- [Example Component](../examples/EventDetailsExample.tsx)
- [Events Service](../../services/events.service.ts)
