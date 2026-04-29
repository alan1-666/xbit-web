import { usePublicSubscriptionCallback } from '@hooks/mqtt/usePublicSubscriptionCallback.ts'
import { TOPICS } from '@/lib/topics.ts'
import { MqttCommentMessagePayload } from '@/modules/prediction/types/mqtt-payload.ts'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { commentMapper } from '@/modules/prediction/models/mappers/comment.mapper.ts'
import { useCallback } from 'react'
import { CommentModel } from '@/modules/prediction/models/CommentModel.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export interface UseEventCommentsUpdatedOptions {
  eventId: string
  enabled?: boolean
}

export const useEventCommentsUpdated = (options: UseEventCommentsUpdatedOptions) => {
  const { eventId, enabled = true } = options
  const queryClient = useQueryClient()

  const handleNewComments = useCallback(
    (_: string, payload: MqttCommentMessagePayload) => {
      if (!Array.isArray(payload)) {
        console.warn('Invalid payload format for event comments:', payload)
        return
      }

      const newComments = payload.map((commentPayload) => commentMapper.fromMqttCommentPayload(commentPayload))

      // Update the infinite query cache for event comments
      queryClient.setQueryData<InfiniteData<CommentModel[]>>(QUERY_KEYS_CONFIGS.eventComments(eventId), (oldData) => {
        if (!oldData) {
          // If no cache exists, create initial structure with new comments
          return {
            pages: [newComments],
            pageParams: [1],
          }
        }

        // Get first page
        const firstPage = oldData.pages[0] || []

        // Filter out duplicates by checking if comment already exists
        const uniqueNewComments = newComments.filter(
          (newComment) => !firstPage.some((existingComment) => existingComment.id === newComment.id),
        )

        if (uniqueNewComments.length === 0) {
          return oldData
        }

        // Prepend new comments to the first page
        const updatedFirstPage = [...uniqueNewComments, ...firstPage]

        return {
          ...oldData,
          pages: [updatedFirstPage, ...oldData.pages.slice(1)],
        }
      })
    },
    [queryClient, eventId],
  )

  usePublicSubscriptionCallback<MqttCommentMessagePayload>(TOPICS.prediction.comments('event', eventId), {
    shouldSkip: !eventId || !enabled,
    onMessage: handleNewComments,
  })
}
