import { useInfiniteQuery } from '@tanstack/react-query'
import { getTokenPools } from '@/services/tokens2.service'
import { useMemo } from 'react'
import { futureClient } from '@/lib/gql/apollo-client.ts'

export const useTokenPools = (address: string | undefined, chainId: number | undefined) => {
  return useInfiniteQuery({
    queryKey: ['tokenPools', address, chainId],
    queryFn: async ({ pageParam }) => {
      const res = await futureClient.query({
        query: getTokenPools,
        variables: {
          input: {
            tokenAddress: address!,
            chainId: chainId!,
            pagination: {
              page: pageParam,
              limit: 20,
            }
          },
        },
      })
      if (!res.data || !res.data.getTokenPoolInfo) return []
      return res.data.getTokenPoolInfo.data || []
    },
    enabled: !!address && !!chainId,
    refetchInterval: 5000,
    initialPageParam: 1,
    maxPages: 5,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20 || allPages.length >= 5) return undefined
      return allPages.length + 1
    },
    select: (data) => data?.pages.flat() || [],
  })
}

export const useOfficialPool = (address: string | undefined, chainId: number | undefined) => {
  const { data: pools } = useTokenPools(address, chainId)
  return useMemo(() => {
    if (!pools || pools.length === 0) return undefined
    return pools.reduce((acc, cur) => {
      if (!cur.dex) return acc
      const accLiquidity = acc.usdLiquidity ? +acc.usdLiquidity : 0
      const curLiquidity = cur.usdLiquidity ? +cur.usdLiquidity : 0
      if (!acc || curLiquidity > accLiquidity) {
        return cur
      }
      return acc
    }, pools[0])
  }, [pools])
}
