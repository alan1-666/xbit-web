import { ApolloError, useQuery } from '@apollo/client'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getTokenDetail } from '@services/tokens.service.ts'
import { TokenMarketStats, TokenTrending } from '@/types/token.ts'
import { mapTokenTrendingToMarketStats } from '@/utils/mappingType.ts'
import { initialTokenMarketStats } from '@hooks/useTokenPrice.ts'

interface UseFallbackPriceResult {
  data: TokenMarketStats | undefined,
  loading: boolean,
  error: ApolloError | undefined
}

interface GetTokenDetailResponse {
  getTokenDetail: TokenTrending
}

interface CachedData {
  data: TokenMarketStats
  timestamp: number
}

const CACHE_KEY_PREFIX = 'token_price_'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

const getCachedData = (address: string): TokenMarketStats | null => {
  const cached = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${address}`)
  if (!cached) return null

  const { data, timestamp }: CachedData = JSON.parse(cached)
  if (Date.now() - timestamp > CACHE_DURATION) {
    sessionStorage.removeItem(`${CACHE_KEY_PREFIX}${address}`)
    return null
  }

  return data
}

const setCachedData = (address: string, data: TokenMarketStats) => {
  const cacheData: CachedData = {
    data,
    timestamp: Date.now()
  }
  sessionStorage.setItem(`${CACHE_KEY_PREFIX}${address}`, JSON.stringify(cacheData))
}

const useFallbackPrice = (address: string, isSkip: boolean): UseFallbackPriceResult => {
  const cachedData = getCachedData(address)
  let mappedData: TokenMarketStats = initialTokenMarketStats

  const { data, loading, error } = useQuery<GetTokenDetailResponse>(getTokenDetail, {
    client: futureClient,
    variables: { input: { address }},
    skip: !address || isSkip || !!cachedData,
  })

  if (data?.getTokenDetail) {
    mappedData = mapTokenTrendingToMarketStats(data.getTokenDetail)
    setCachedData(address, mappedData)
  }

  return {
    data: cachedData ?? mappedData,
    loading,
    error
  }
}

export default useFallbackPrice
