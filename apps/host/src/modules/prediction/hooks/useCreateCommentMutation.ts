import { MutationCreateCommentArgs } from '@/@generated/gql/graphql-prediction'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/events.service'
import { QUERY_KEYS_CONFIGS } from '../configs/queryKeys.configs'

interface UseCreateCommentsMutationInput {
  order: string
}
export const useCreateCommentMutation = ({ order }: UseCreateCommentsMutationInput) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: MutationCreateCommentArgs) => eventsService.createComment(input),
    onSuccess: async (data) => {
      const { parentId, type } = data
      const queryKey = QUERY_KEYS_CONFIGS.eventComments(`${type}-${parentId}-${order}`)
      await queryClient.cancelQueries({ queryKey })
      if (order === 'created_at') {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old || !old.pages) return old

          const newPages = [...old.pages]
          if (newPages.length > 0) {
            newPages[0] = [data, ...newPages[0]]
          } else {
            newPages[0] = [data]
          }
          return { ...old, pages: newPages }
        })
      } else {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old || !old.pages) return old
          const newPages = [...old.pages]
          if (newPages.length > 0) {
            newPages[newPages.length - 1] = [...newPages[newPages.length - 1], data]
          } else {
            newPages[newPages.length - 1] = [data]
          }
          return { ...old, pages: newPages }
        })
      }
    },
  })
}
