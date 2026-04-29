import { useCollection, useCollectionQuery, useCollectionMutation } from '@/modules/prediction/collections/base'
import { createEventCollection } from '@/modules/prediction/collections/factories/event.factory'
import { useParams } from 'react-router-dom'
import { useState } from 'react'

/**
 * Demo component showing how collection instances are shared
 * across multiple components with the same queryKey.
 */

// Component A - Top of the page
export function EventHeader() {
  const { eventSlug } = useParams<{ eventSlug: string }>()
  const eventCollection = useCollection(() => createEventCollection(eventSlug!))
  const { data: event } = useCollectionQuery({ collection: eventCollection })
  const { mutate: updateEvent, isPending } = useCollectionMutation({
    collection: eventCollection,
    mutation: 'updateEvent',
  })

  const [updateCount, setUpdateCount] = useState(0)

  console.log('EventHeader - Collection instance:', eventCollection)
  console.log('EventHeader - Event data:', event)

  const handleUpdate = () => {
    const newCount = updateCount + 1
    setUpdateCount(newCount)

    updateEvent({
      title: `${event?.title || 'Event'} (Updated #${newCount} from EventHeader)`,
      description: `This event was updated ${newCount} time(s) from EventHeader component at ${new Date().toLocaleTimeString()}`,
    })
  }

  return (
    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded">
      <h2 className="text-blue-300 font-semibold">EventHeader Component</h2>
      <p className="text-xs text-blue-200/80 mt-2">Event: {eventSlug}</p>
      <p className="text-xs text-blue-200/80">Collection: {JSON.stringify(eventCollection.queryKey())}</p>

      <div className="mt-3 p-3 bg-blue-950/50 rounded border border-blue-500/20">
        <div className="text-sm text-blue-100 font-medium mb-1">Current Event Data:</div>
        <div className="text-xs text-blue-200/80">Title: {event?.title || 'Loading...'}</div>
        <div className="text-xs text-blue-200/80 mt-1">Description: {event?.description || 'Loading...'}</div>
      </div>

      <button
        onClick={handleUpdate}
        disabled={isPending}
        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded text-sm font-medium transition-colors"
      >
        {isPending ? 'Updating...' : `🔄 Update Event (from EventHeader)`}
      </button>
      <p className="text-xs text-blue-200/60 mt-2">
        ⚡ Click to update event. Watch Sidebar and Footer update instantly!
      </p>
    </div>
  )
}

// Component B - Sidebar (different component tree)
export function EventSidebar() {
  const { eventSlug } = useParams<{ eventSlug: string }>()
  const eventCollection = useCollection(() => createEventCollection(eventSlug!))
  const { data: event } = useCollectionQuery({ collection: eventCollection })
  const { mutate: updateEvent, isPending } = useCollectionMutation({
    collection: eventCollection,
    mutation: 'updateEvent',
  })

  const [updateCount, setUpdateCount] = useState(0)

  console.log('EventSidebar - Collection instance:', eventCollection)
  console.log('EventSidebar - Event data:', event)

  const handleUpdate = () => {
    const newCount = updateCount + 1
    setUpdateCount(newCount)

    updateEvent({
      title: `${event?.title || 'Event'} (Updated #${newCount} from EventSidebar)`,
      volume: (event?.volume || 0) + 1000000, // Add 1M to volume
    })
  }

  return (
    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded">
      <h2 className="text-green-300 font-semibold">EventSidebar Component</h2>
      <p className="text-xs text-green-200/80 mt-2">Event: {eventSlug}</p>
      <p className="text-xs text-green-200/80">✅ SAME collection instance as EventHeader</p>
      <p className="text-xs text-green-200/80">Collection: {JSON.stringify(eventCollection.queryKey())}</p>

      <div className="mt-3 p-3 bg-green-950/50 rounded border border-green-500/20">
        <div className="text-sm text-green-100 font-medium mb-1">Current Event Data:</div>
        <div className="text-xs text-green-200/80">Title: {event?.title || 'Loading...'}</div>
        <div className="text-xs text-green-200/80 mt-1">Volume: ${(event?.volume || 0).toLocaleString()}</div>
      </div>

      <button
        onClick={handleUpdate}
        disabled={isPending}
        className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded text-sm font-medium transition-colors"
      >
        {isPending ? 'Updating...' : `💰 Update Volume (from EventSidebar)`}
      </button>
      <p className="text-xs text-green-200/60 mt-2">
        ⚡ Click to update volume. Watch Header and Footer update instantly!
      </p>
    </div>
  )
}

// Component C - Footer (yet another component tree)
export function EventFooter() {
  const { eventSlug } = useParams<{ eventSlug: string }>()
  const eventCollection = useCollection(() => createEventCollection(eventSlug!))
  const { data: event } = useCollectionQuery({ collection: eventCollection })
  const { mutate: updateEvent, isPending } = useCollectionMutation({
    collection: eventCollection,
    mutation: 'updateEvent',
  })
  const { mutate: toggleFavorite, isPending: isTogglingFavorite } = useCollectionMutation({
    collection: eventCollection,
    mutation: 'toggleFavorite',
  })

  const [updateCount, setUpdateCount] = useState(0)

  console.log('EventFooter - Collection instance:', eventCollection)
  console.log('EventFooter - Event data:', event)

  const handleUpdate = () => {
    const newCount = updateCount + 1
    setUpdateCount(newCount)

    updateEvent({
      liquidity: (event?.liquidity || 0) + 50000, // Add 50K to liquidity
    })
  }

  const handleToggleFavorite = () => {
    toggleFavorite(true)
  }

  return (
    <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded">
      <h2 className="text-purple-300 font-semibold">EventFooter Component</h2>
      <p className="text-xs text-purple-200/80 mt-2">Event: {eventSlug}</p>
      <p className="text-xs text-purple-200/80">✅ SAME collection instance as EventHeader and EventSidebar</p>
      <p className="text-xs text-purple-200/80">Collection: {JSON.stringify(eventCollection.queryKey())}</p>

      <div className="mt-3 p-3 bg-purple-950/50 rounded border border-purple-500/20">
        <div className="text-sm text-purple-100 font-medium mb-1">Current Event Data:</div>
        <div className="text-xs text-purple-200/80">Title: {event?.title || 'Loading...'}</div>
        <div className="text-xs text-purple-200/80 mt-1">Volume: ${(event?.volume || 0).toLocaleString()}</div>
        <div className="text-xs text-purple-200/80 mt-1">Liquidity: ${(event?.liquidity || 0).toLocaleString()}</div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleUpdate}
          disabled={isPending}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded text-sm font-medium transition-colors"
        >
          {isPending ? 'Updating...' : `📊 Update Liquidity`}
        </button>
        <button
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white rounded text-sm font-medium transition-colors"
        >
          {isTogglingFavorite ? 'Toggling...' : `⭐ Toggle Favorite`}
        </button>
      </div>
      <p className="text-xs text-purple-200/60 mt-2">
        ⚡ Click to update liquidity. Watch Header and Sidebar update instantly!
      </p>
    </div>
  )
}

// Demo page combining all components
export function CollectionSharingDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-4">
        <h1 className="text-yellow-300 font-bold text-xl mb-2">🎯 Collection Instance Sharing - Interactive Demo</h1>
        <p className="text-sm text-yellow-200/80 mb-2">
          This demo proves that multiple components share the EXACT SAME collection instance and React Query cache.
        </p>
        <div className="bg-yellow-950/50 rounded p-3 mt-3">
          <p className="text-xs text-yellow-200 font-semibold mb-2">📌 Try this:</p>
          <ol className="text-xs text-yellow-200/80 space-y-1 list-decimal list-inside">
            <li>
              Click "Update Event" in <span className="text-blue-300 font-medium">EventHeader</span> (blue box)
            </li>
            <li>
              Watch the <span className="text-green-300 font-medium">EventSidebar</span> (green) and{' '}
              <span className="text-purple-300 font-medium">EventFooter</span> (purple) update instantly!
            </li>
            <li>
              Click "Update Volume" in <span className="text-green-300 font-medium">EventSidebar</span>
            </li>
            <li>
              Watch <span className="text-blue-300 font-medium">EventHeader</span> and{' '}
              <span className="text-purple-300 font-medium">EventFooter</span> update instantly!
            </li>
            <li>
              Click "Update Liquidity" in <span className="text-purple-300 font-medium">EventFooter</span>
            </li>
            <li>Watch all other components update instantly!</li>
          </ol>
        </div>
        <p className="text-xs text-yellow-200/80 mt-3">
          💡 Open browser console to see that all components log the same collection instance reference.
        </p>
      </div>

      <EventHeader />
      <EventSidebar />
      <EventFooter />

      <div className="bg-gray-900/50 border border-gray-500/30 rounded p-4">
        <h3 className="text-gray-300 font-semibold mb-2">🔍 How it works:</h3>
        <ul className="text-xs text-gray-400 space-y-2">
          <li>
            1️⃣ First component calls <code className="bg-gray-800 px-1 rounded">useCollection()</code> with queryKey{' '}
            <code className="bg-gray-800 px-1 rounded">['prediction', 'event', eventSlug]</code>
          </li>
          <li>
            2️⃣ Hook creates collection instance and stores it in <strong>global registry</strong> with queryKey as key
          </li>
          <li>
            3️⃣ Second component calls <code className="bg-gray-800 px-1 rounded">useCollection()</code> with{' '}
            <strong>same queryKey</strong>
          </li>
          <li>
            4️⃣ Hook finds existing instance in registry and <strong>returns it</strong> (no new creation)
          </li>
          <li>
            5️⃣ Third component → same process → <strong>same instance returned</strong>
          </li>
          <li>
            ✅ Result: All components share the <strong>exact same collection object reference</strong>
          </li>
          <li>
            🔄 When one component mutates → React Query cache updates →{' '}
            <strong>all components re-render with new data</strong>
          </li>
        </ul>
      </div>

      <div className="bg-red-900/20 border border-red-500/30 rounded p-4">
        <h3 className="text-red-300 font-semibold mb-2">✨ Benefits Demonstrated:</h3>
        <ul className="text-xs text-red-200/80 space-y-1">
          <li>
            ✅ <strong>Zero prop drilling</strong> - Components don't pass collection via props
          </li>
          <li>
            ✅ <strong>Instant updates</strong> - Mutation in one component → all others update immediately
          </li>
          <li>
            ✅ <strong>Consistent state</strong> - All components always see the same data
          </li>
          <li>
            ✅ <strong>Better performance</strong> - Single collection instance, shared cache
          </li>
          <li>
            ✅ <strong>Optimistic updates</strong> - UI updates instantly, rollback on error
          </li>
          <li>
            ✅ <strong>Type safety</strong> - Full TypeScript inference throughout
          </li>
        </ul>
      </div>
    </div>
  )
}
