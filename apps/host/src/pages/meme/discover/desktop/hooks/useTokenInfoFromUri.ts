import { MemeTokenWithFormatted } from '@/types/token.ts'
import { useQuery } from '@tanstack/react-query'
import { ChainIds } from '@/types/enums.ts'
import axios from 'axios'

const getTwitter = (url: string | undefined) => {
  if (!url) return { tweetId: undefined, twitterUrl: undefined }
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?x\.com\/[^\/]+\/status\/(\d+)/)
  if (match) {
    return {
      tweetId: match[1],
      twitterUrl: undefined,
    }
  } else {
    return {
      tweetId: undefined,
      twitterUrl: url,
    }
  }
}

export type TokenInfoFromUri = {
  tweetId?: string | null
  twitterUrl?: string | null
  image?: string | null
  website?: string | null
}

const blacklistDomains = [
  'static-create.jup.ag',
  'metadata.rapidlaunch.io',
  'cdn.moonshot.com',
  'metadata.retlie.com',
  'ipfs.launchblitz.ai',
  'ipfs.io/ipfs/images',
  'metadata.uxento.io',
]

const fetchFromIPFS = async (token: MemeTokenWithFormatted): Promise<TokenInfoFromUri | null> => {
  const uri = token.uri
  if (!uri) return null
  // Check for blacklist domains
  for (const domain of blacklistDomains) {
    if (uri.includes(domain)) {
      return null
    }
  }
  try {
    const response = await axios.get(uri)
    const data = response.data
    const twitter = data?.twitter as string
    const { tweetId, twitterUrl } = getTwitter(twitter)
    const image = data?.image as string
    return {
      tweetId: tweetId || token.tweetId,
      twitterUrl: twitterUrl || token.twitterUrl,
      image: image || token.image,
      website: (data?.website as string) || token.website,
    }
  } catch (error) {
    console.log('Cannot fetch from IPFS:', uri)
    return null
  }
}

const fetchFromFourmeme = async (token: MemeTokenWithFormatted): Promise<TokenInfoFromUri | null> => {
  if (token.source !== 'new') return null
  return null
}

export const useTokenInfoFromUri = (token: MemeTokenWithFormatted): TokenInfoFromUri | null | undefined => {
  const uri = token.uri
  const { data: tokenInfoFromUri } = useQuery({
    queryKey: ['token-info-from-uri', uri],
    queryFn: async () => {
      if (token.chainId === ChainIds.Bsc) {
        return fetchFromFourmeme(token)
      }
      return fetchFromIPFS(token)
    },
    enabled: !!uri,
    retry: 0,
    staleTime: Infinity,
  })

  return tokenInfoFromUri
}
