import { useQuery } from '@tanstack/react-query'
import { tagsService } from '@/modules/prediction/services/tags.service.ts'

export const useHomePageTags = () => {
  return useQuery({
    queryKey: ['prediction', 'tags', 'default'],
    queryFn: async () => {
      return tagsService.getHomePageTags()
    },
  })
}
