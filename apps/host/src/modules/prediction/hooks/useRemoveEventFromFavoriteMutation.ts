import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export const useRemoveEventFromFavoriteMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (eventId: string) => eventsService.removeEventFromFavorite(eventId),
        onMutate: async (eventId) => {
            const queryKey = ['prediction', 'events']
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey })

            // Snapshot the previous value
            const previousEvents = queryClient.getQueriesData({ queryKey })

            // Optimistically update isFavorite: false in all lists
            queryClient.setQueriesData({ queryKey }, (old: any) => {
                if (!old) return old
                if (old.pages && Array.isArray(old.pages)) {
                    const newPages = old.pages.map((page: any[]) => {
                        return page.map((event: any) => {
                            if (event.id === eventId) {
                                return { ...event, isFavorite: false }
                            }
                            return event
                        })
                    })
                    return { ...old, pages: newPages }
                }
                return old
            })

            // Explicitly remove from favorites list
            queryClient.setQueryData(QUERY_KEYS_CONFIGS.favorites(), (old: any) => {
                if (!old || !old.pages) return old
                const newPages = old.pages.map((page: any[]) => page.filter((e: any) => e.id !== eventId))
                return { ...old, pages: newPages }
            })

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
