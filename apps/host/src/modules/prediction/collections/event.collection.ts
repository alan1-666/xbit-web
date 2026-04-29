import { createCollection } from '@/modules/prediction/collections/base.ts'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { EventModel } from '@/modules/prediction/models/EventModel.ts'

export const eventCollection = createCollection({
  queryKey: () => ['events', 'newEvents'],
  queryFn: async () => {
    return eventsService.getNewEvents({ offset: 0, limit: 20 })
  },
  mutations: {
    updateEvent: {
      mutationKey: ['events', 'updateEvent'],
      mutationFn: async (event: EventModel) => {
        return event
      },
    },
  },
})
