import { usePublicSubscriptionCallback } from '@hooks/mqtt/usePublicSubscriptionCallback.ts'
import { MqttEventMessagePayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { eventMapper } from '@/modules/prediction/models/mappers/event.mapper.ts'
import { useUpdateNewestEventsCache } from './useUpdateNewestEventsCache'
import { EventModel } from '@/modules/prediction/models/EventModel'

const TOPIC = 'public/event/new'

export interface UseNewEventSubscriptionOptions {
  onNewEvents?: (events: EventModel[]) => void
  enabled?: boolean
}

export const useNewEventSubscription = (options?: UseNewEventSubscriptionOptions) => {
  const { onNewEvents, enabled = true } = options || {}
  const { addEventsToCache } = useUpdateNewestEventsCache()

  usePublicSubscriptionCallback<MqttEventMessagePayload>(TOPIC, {
    shouldSkip: !enabled,
    debug: true,
    onMessage: (_, payload) => {
      if (!Array.isArray(payload)) {
        console.warn('Invalid payload format for public/event/new:', payload)
        return
      }

      const events = payload.map((eventPayload) => eventMapper.fromMqttEventPayload(eventPayload))
      console.log('New events received:', events)

      // Update cache with new events
      if (events.length > 0) {
        addEventsToCache(events)
      }

      // Call custom callback if provided
      onNewEvents?.(events)
    },
  })
}
