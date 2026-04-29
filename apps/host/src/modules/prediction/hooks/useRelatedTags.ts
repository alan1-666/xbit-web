import { useQuery } from '@tanstack/react-query'
import { tagsService } from '@/modules/prediction/services/tags.service.ts'

export const useRelatedTags = (tagSlug: string) => {
  return useQuery({
    queryKey: ['prediction', 'relatedTags', tagSlug],
    queryFn: async () => {
      return tagsService.getRelatedTagsBySlug(tagSlug)
    },
  })
}
