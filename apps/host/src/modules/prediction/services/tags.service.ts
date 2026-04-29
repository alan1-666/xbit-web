import { TagModel } from '@/modules/prediction/models/TagModel.ts'
import { predictionClient } from '@/lib/gql/apollo-client.ts'
import { getRelatedTags } from '@/modules/prediction/gql/prediction.gql.ts'

interface ITagsService {
  getHomePageTags(): Promise<Pick<TagModel, 'slug' | 'label'>[]>
  getRelatedTagsBySlug: (slug: string) => Promise<TagModel[]>
}

class TagsService implements ITagsService {
  async getHomePageTags(): Promise<Pick<TagModel, 'slug' | 'label'>[]> {
    return [
      { slug: 'politics', label: 'Politics' },
      { slug: 'sports', label: 'Sports' },
      { slug: 'crypto', label: 'Crypto' },
      { slug: 'finance', label: 'Finance' },
      { slug: 'geopolitics', label: 'Geopolitics' },
      { slug: 'earnings', label: 'Earnings' },
      { slug: 'tech', label: 'Tech' },
      { slug: 'culture', label: 'Culture' },
      { slug: 'world', label: 'World' },
      { slug: 'economy', label: 'Economy' },
      { slug: 'climate-science', label: 'Climate & Science' },
      { slug: 'elections', label: 'Elections' },
    ]
  }

  async getRelatedTagsBySlug(slug: string): Promise<TagModel[]> {
    const res = await predictionClient.query({
      query: getRelatedTags,
      variables: {
        slug: slug,
      },
    })
    return res.data.getRelatedTag
  }
}

export const tagsService = new TagsService()
