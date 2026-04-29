import { symbolDexClient } from '@/lib/gql/apollo-client'
import { GET_BANNERS } from '@/services/symbol.dex.service'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

type BannerPlatform = 'PC' | 'H5' | 'APP' | 'ALL'

type BannerItem = {
  id: string
  route: string
  platform: BannerPlatform
  enImageUrl?: string
  enImage1Url?: string
  zhImageUrl?: string
  zhImage1Url?: string
  category: string
  isActive: boolean
  startAt?: string
  clickCount?: number
  createdAt?: string
  updatedAt?: string
  sortIndex?: number
}

type GetBannersResponse = {
  getBanners: {
    data: BannerItem[]
    message?: string
  }
}

const useBanners = (platform: 'PC' | 'H5') => {
  const { data, isFetching } = useReactQuery({
    queryKey: ['GET_BANNERS', platform],
    queryFn: async () => {
      const res = await symbolDexClient.query<GetBannersResponse>({
        query: GET_BANNERS,
        variables: {
          input: {
            platform,
          },
        },
      })
      return res?.data
    },
    retry: 1,
    staleTime: 60 * 60 * 1000, // 1小时缓存
  })

  // 筛选和排序广告数据
  const banners = useMemo(() => {
    if (!data?.getBanners?.data) {
      return []
    }

    const allBanners = data.getBanners.data

    // 1. 筛选平台：只保留当前平台或 ALL 平台的广告
    const platformFiltered = allBanners.filter((banner) => {
      return banner.platform === platform || banner.platform === 'ALL'
    })

    // 2. 筛选激活状态
    const activeBanners = platformFiltered.filter((banner) => {
      return banner.isActive === true
    })

    // 3. 按 category 分组，每个 category 只保留一条数据
    const bannersByCategory = new Map<string, BannerItem>()

    activeBanners.forEach((banner) => {
      const category = banner.category
      if (!bannersByCategory.has(category)) {
        bannersByCategory.set(category, banner)
      }
    })

    // 4. 转换为数组
    return Array.from(bannersByCategory.values())
  }, [data, platform])

  return {
    banners,
    loading: !data && isFetching,
  }
}

export default useBanners
export type { BannerItem }
