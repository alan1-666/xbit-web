import { useCollection } from '@/modules/prediction/collections/base.ts'
import { useCollectionQuery } from '@/modules/prediction/collections/base.ts'
import { useCollectionMutation } from '@/modules/prediction/collections/base.ts'
import { createEventCollection } from '@/modules/prediction/collections/factories/event.factory.ts'
import { useParams } from 'react-router-dom'
import { MarketRow } from './MarketRow'

/**
 * Example component demonstrating how to use the event collection factory
 */
export function EventDetailsExample() {
  // Get eventSlug from URL params
  const { eventSlug } = useParams<{ eventSlug: string }>()

  // Early return if eventSlug is not available
  if (!eventSlug) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-400">Invalid event URL</div>
      </div>
    )
  }

  // Create a collection instance for this specific event
  const eventCollection = useCollection(() => createEventCollection(eventSlug!))

  // Fetch event data
  const {
    data: event,
    isLoading,
    error,
  } = useCollectionQuery({
    collection: eventCollection,
  })

  // Mutations
  const { mutate: updateEvent } = useCollectionMutation({
    collection: eventCollection,
    mutation: 'updateEvent',
  })

  const { mutate: toggleFavorite } = useCollectionMutation({
    collection: eventCollection,
    mutation: 'toggleFavorite',
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-400">Loading event...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error loading event</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-400">Event not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Event Header */}
      <div className="bg-[#1a1a1f] rounded-lg p-6 border border-white/5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-white">{event.title}</h1>
          <button
            onClick={() => toggleFavorite(true)}
            className="px-4 py-2 bg-[#843BEA] hover:bg-[#9547ff] text-white rounded-lg text-sm font-medium transition-colors"
          >
            ⭐ Toggle Favorite
          </button>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>

        {/* Event Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
          <div>
            <div className="text-xs text-gray-500 mb-1">Volume</div>
            <div className="text-white font-semibold">${(event.volume || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Liquidity</div>
            <div className="text-white font-semibold">${(event.liquidity || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <div className="text-white font-semibold">{event.closed ? '🔴 Closed' : '🟢 Active'}</div>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="bg-[#1a1a1f] rounded-lg p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-4">Collection Actions</h2>
        <div className="space-y-3">
          <button
            onClick={() =>
              updateEvent({
                title: event.title + ' (Updated)',
                description: 'This is an optimistically updated description',
              })
            }
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between"
          >
            <span>🔄 Update Event (Optimistic)</span>
            <span className="text-xs opacity-75">Click to test optimistic update</span>
          </button>

          <div className="text-xs text-gray-500 pl-4">
            ℹ️ This will update the event in cache immediately. If it fails, it will rollback automatically.
          </div>
        </div>
      </div>

      {/* Markets Section */}
      <div className="bg-[#1a1a1f] rounded-lg p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-4">Markets ({event.markets?.length || 0})</h2>
        <div className="space-y-3">
          {event.markets?.map((market, index) => (
            <MarketRow key={market?.id} market={market!} index={index} />
          ))}

          {(!event.markets || event.markets.length === 0) && (
            <div className="text-center py-8 text-gray-500 text-sm">No markets available</div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="text-sm text-blue-300">
          <strong>💡 Collection Pattern Demo</strong>
          <ul className="mt-2 space-y-1 text-xs text-blue-200/80">
            <li>
              • This component uses <code className="bg-blue-900/50 px-1 rounded">useCollection</code> hook with dynamic
              eventId from URL
            </li>
            <li>• All mutations support optimistic updates with automatic rollback on error</li>
            <li>
              • Query cache is scoped per event:{' '}
              <code className="bg-blue-900/50 px-1 rounded">['prediction', 'event', eventId]</code>
            </li>
            <li>• Type-safe: all data and mutations are fully typed with TypeScript</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
