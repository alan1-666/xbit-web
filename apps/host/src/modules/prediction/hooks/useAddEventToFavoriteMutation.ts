import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export const useAddEventToFavoriteMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (eventId: string) => eventsService.addEventToFavorite(eventId),
        onMutate: async (eventId) => {
            const queryKey = ['prediction', 'events']
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey })

            // Snapshot the previous value
            const previousEvents = queryClient.getQueriesData({ queryKey })

            let eventToAdd: any = null

            // Optimistically update to the new value
            queryClient.setQueriesData({ queryKey }, (old: any) => {
                if (!old) return old

                if (old.pages && Array.isArray(old.pages)) {
                    const newPages = old.pages.map((page: any[]) => {
                        return page.map((event: any) => {
                            if (event.id === eventId) {
                                const newEvent = { ...event, isFavorite: true }
                                eventToAdd = newEvent
                                return newEvent
                            }
                            return event
                        })
                    })
                    return { ...old, pages: newPages }
                }
                return old
            })

            // If we found the event and the favorites list is in the cache, add it
            if (eventToAdd) {
                queryClient.setQueryData(QUERY_KEYS_CONFIGS.favorites(), (old: any) => {
                    if (!old || !old.pages) return old

                    // Check if already exists in favorites to avoid duplicates
                    const exists = old.pages.some((page: any[]) => page.some((e: any) => e.id === eventId))
                    if (exists) return old

                    const newPages = [...old.pages]
                    if (newPages.length > 0) {
                        newPages[0] = [eventToAdd, ...newPages[0]]
                    } else {
                        newPages[0] = [eventToAdd]
                    }
                    return { ...old, pages: newPages }
                })
            }

            return { previousEvents }
        },
        onError: (_err, _newTodo, context) => {
            if (context?.previousEvents) {
                context.previousEvents.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data)
                })
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS_CONFIGS.favorites() })
        },
    })
}
