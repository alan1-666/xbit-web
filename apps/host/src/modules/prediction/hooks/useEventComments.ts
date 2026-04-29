import { useInfiniteQueryWithLoadMore } from '@hooks/useInfiniteQueryWithLoadMore.ts'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { CommentType } from '@/@generated/gql/graphql-prediction.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

interface UseEventCommentsOptions {
  entityId: string
  entityType: CommentType
  order?: string
}

export const useEventComments = (options: UseEventCommentsOptions) => {
  const { entityId, entityType, order } = options
  return useInfiniteQueryWithLoadMore({
    queryKey: QUERY_KEYS_CONFIGS.eventComments(`${entityType}-${entityId}-${order}`),
    enabled: !!entityId,
    queryFn: async ({ pageParam = 1 }) => {
      const offset = (pageParam - 1) * 20
      return eventsService.getComments({
        limit: 20,
        offset,
        filter: {
          type: entityType,
          parentId: entityId,
        },
        order: order,
      })
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) {
        return undefined
      }
      return allPages.length + 1
    },
    select: (data) => data.pages.flat(),
    initialPageParam: 1,
  })
}
