import { createCollection } from '@/modules/prediction/collections/base.ts'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'

/**
 * Factory function to create a collection for a specific event.
 * This allows for dynamic event-specific collections with proper queryKey scoping.
 *
 * @param eventSlug - The unique slug identifier for the event
 * @returns A collection instance for the specific event
 *
 * @example
 * // In a component:
 * function EventDetails({ eventSlug }: { eventSlug: string }) {
 *   const eventCollection = useCollection(() => createEventCollection(eventSlug))
 *   const { data: event } = useCollectionQuery({ collection: eventCollection })
 *   const { mutate: updateEvent } = useCollectionMutation({
 *     collection: eventCollection,
 *     mutation: 'updateEvent'
 *   })
 * }
 */
export const createEventCollection = (eventSlug: string) => {
  return createCollection({
    queryKey: () => ['prediction', 'event', eventSlug] as const,

    queryFn: async (): Promise<EventModel | null> => {
      return eventsService.getEvent(eventSlug)
    },

    mutations: {
      /**
       * Update event data optimistically in the cache.
       * This is useful for updating event data after mutations
       * without waiting for a server response.
       */
      updateEvent: {
        mutationKey: ['prediction', 'event', 'update', eventSlug] as const,

        mutationFn: async (updatedEvent: Partial<EventModel>): Promise<EventModel> => {
          // In a real scenario, this would call an API to update the event
          // For now, we just return the updated event
          return updatedEvent as EventModel
        },

        onMutate: async (variables, context) => {
          const { previousData } = context

          if (!previousData) return

          // Optimistically update with the new data
          return {
            ...previousData,
            ...variables,
          } as EventModel
        },

        onSuccess: () => {
          // Optionally invalidate related queries
          // queryClient.invalidateQueries({ queryKey: ['prediction', 'events'] })
        },

        onError: (error) => {
          console.error('Failed to update event:', error)
          // Rollback is handled automatically by the base collection
        },
      },

      /**
       * Update a specific market within the event.
       * This is useful for real-time market updates via MQTT.
       */
      updateMarket: {
        mutationKey: ['prediction', 'event', 'updateMarket', eventSlug] as const,

        mutationFn: async (updatedMarket: any): Promise<any> => {
          // Return the updated market
          return updatedMarket
        },

        onMutate: async (variables, context) => {
          const { previousData } = context

          if (!previousData || !previousData.markets) return

          // Find and update the specific market
          const updatedMarkets = previousData.markets.map((market) => {
            if (market?.id === variables.id) {
              return {
                ...market,
                ...variables,
              }
            }
            return market
          })

          // Return optimistically updated event
          return {
            ...previousData,
            markets: updatedMarkets,
          } as EventModel
        },

        onSuccess: () => {
          // Markets updated successfully
        },

        onError: (error) => {
          console.error('Failed to update market:', error)
        },
      },

      /**
       * Toggle favorite status for the event.
       */
      toggleFavorite: {
        mutationKey: ['prediction', 'event', 'toggleFavorite', eventSlug] as const,

        mutationFn: async (isFavorite: boolean): Promise<boolean> => {
          // In a real scenario, this would call an API
          return isFavorite
        },

        onMutate: async (_variables, context) => {
          // This mutation doesn't need to update the event cache
          // Favorite status is typically stored separately (e.g., in Redux)
          return context.previousData
        },

        onSuccess: () => {
          // Optionally update UI or other queries
        },
      },
    },
  })
}

/**
 * Type helper to infer the event collection type
 */
export type EventCollection = ReturnType<typeof createEventCollection>
