import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { TwitterCategory, Post } from '@/@generated/gql/graphql-prediction.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export interface UsePolymarketTwitterPostsOptions {
  enabled?: boolean
  category: TwitterCategory
}

export const usePolymarketTwitterPosts = (options: UsePolymarketTwitterPostsOptions) => {
  const { enabled = true, category } = options

  return useQuery<Post[]>({
    queryKey: QUERY_KEYS_CONFIGS.polymarketTwitterPosts(category),
    queryFn: async () => {
      return eventsService.getPolymarketTwitterPosts(category)
    },
    enabled,
  })
}
