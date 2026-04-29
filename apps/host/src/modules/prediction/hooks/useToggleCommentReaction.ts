import { MutationToggleCommentReactionArgs } from '@/@generated/gql/graphql-prediction'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/events.service'
import { QUERY_KEYS_CONFIGS } from '../configs/queryKeys.configs'

interface UseCreateCommentsMutationInput {
  order: string
  type: string
  parentId: string
  userId: string
}
export const useToggleCommentReaction = ({ order, type, parentId, userId }: UseCreateCommentsMutationInput) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: MutationToggleCommentReactionArgs) => eventsService.toggleCommentReaction(input),
    onSuccess: async (data) => {
      const queryKey = QUERY_KEYS_CONFIGS.eventComments(`${type}-${parentId}-${order}`)
      await queryClient.cancelQueries({ queryKey })
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || !old.pages) return old

        return {
          ...old,
          pages: old.pages.map((page: any[]) => {
            return page.map((comment: any) => {
              if (comment.id === data.commentId) {
                return {
                  ...comment,
                  reactions: comment.reactions?.find((reaction: any) => reaction.userId === userId)
                    ? comment.reactions.filter((reaction: any) => reaction.userId !== userId)
                    : [...(comment.reactions || []), { userId }],
                  reactionCount: data.reactionCount,
                }
              }
              return comment
            })
          }),
        }
      })
    },
  })
}
