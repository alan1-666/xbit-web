import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { EventModel } from '@/modules/prediction/models/EventModel'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { DEFAULT_NEW_EVENTS_FILTER, DEFAULT_NEW_EVENTS_SORT } from '@/modules/prediction/services/events.service.ts'

export const useUpdateNewestEventsCache = () => {
  const queryClient = useQueryClient()

  const addEventsToCache = useCallback(
    (newEvents: EventModel[]) => {
      if (!newEvents || newEvents.length === 0) return

      queryClient.setQueryData<{ pages: EventModel[][]; pageParams: number[] }>(
        QUERY_KEYS_CONFIGS.new({ filter: DEFAULT_NEW_EVENTS_FILTER, sort: DEFAULT_NEW_EVENTS_SORT }),
        (oldData) => {
          if (!oldData) {
            // If no cache exists, create initial structure with new events
            return {
              pages: [newEvents],
              pageParams: [1],
            }
          }

          // Get first page
          const firstPage = oldData.pages[0] || []

          // Filter out duplicates by checking if event already exists
          const uniqueNewEvents = newEvents.filter(
            (newEvent) => !firstPage.some((existingEvent) => existingEvent.id === newEvent.id),
          )

          if (uniqueNewEvents.length === 0) {
            return oldData
          }

          // Add new events to the beginning of first page
          const updatedFirstPage = [...uniqueNewEvents, ...firstPage]

          return {
            ...oldData,
            pages: [updatedFirstPage, ...oldData.pages.slice(1)],
          }
        },
      )
    },
    [queryClient],
  )

  return { addEventsToCache }
}
