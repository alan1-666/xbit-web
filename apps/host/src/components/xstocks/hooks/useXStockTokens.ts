import { useInfiniteQuery } from '@tanstack/react-query'
import { GetTokensByCategoryResponse } from '@/types/responses.ts'
import { getXStocksTokens } from '@services/tokens.service.ts'
import { useEffect, useMemo, useState } from 'react'
import { useSubscription } from '@/lib/mqtt'
import { TokenStatisticDto } from '@/@generated/gql/graphql-core.ts'
import { ChainIds } from '@/types/enums.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { SortDirection } from '@/@generated/gql/graphql-future.ts'
import { TokenSortFields, TokensStatisticByCategoryDto } from '@/@generated/gql/graphql-meme2.ts'

const CACHE_KEY = 'xStocksTokensCache_'

export type UseXStockTokensOptions = {
  chainId?: number
  sortBy?: TokenSortFields
}

const useTokens = (options?: UseXStockTokensOptions) => {
  const chainId = options?.chainId || ChainIds.Solana // Default to Solana if not provided
  const sortBy = options?.sortBy || TokenSortFields.MarketCap // Default to MarketCap if not provided
  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['tokens', 'xStocks', chainId, sortBy],
    initialPageParam: 1,
    initialData: () => {
      const cached = localStorage.getItem(CACHE_KEY + chainId)
      if (cached) {
        try {
          const parsedData = JSON.parse(cached) as TokensStatisticByCategoryDto[]
          return {
            pages: [
              {
                tokensByCategory: {
                  data: parsedData,
                  page: 1,
                  limit: 100,
                },
              },
            ],
            pageParams: [1],
          }
        } catch (error) {
          console.error('Error parsing cached data:', error)
        }
      }
    },
    getNextPageParam: (lastPage: GetTokensByCategoryResponse) => {
      // Assuming the API supports pagination, return the next page number
      return lastPage.tokensByCategory.data.length < 100 ? undefined : lastPage.tokensByCategory.page + 1
    },
    queryFn: async ({ pageParam }) => {
      const res = await futureClient.query({
        query: getXStocksTokens,
        variables: {
          input: {
            chainId: chainId,
            categoryId: 'XStock',
            page: pageParam,
            limit: 100,
            sortBy: sortBy,
            sortType: SortDirection.Desc,
          },
        },
      })
      return res.data
    },
  })
  useEffect(() => {
    if (!data?.pages || !chainId) return
    const allTokens = data.pages.flatMap((page) => page.tokensByCategory.data)
    localStorage.setItem(CACHE_KEY + chainId, JSON.stringify(allTokens))
  }, [data, chainId])
  const tokens = useMemo(() => {
    return data?.pages.flatMap((page) => page.tokensByCategory.data) || []
  }, [data])
  return {
    tokens,
    ...rest,
  }
}

const useRealtimeData = (tokens: TokensStatisticByCategoryDto[]) => {
  const [realtimeTokens, setRealtimeTokens] = useState<TokensStatisticByCategoryDto[]>(tokens)
  const activeChainId = useActiveChainId()
  const topics = useMemo(() => {
    return tokens.map((token) => `public/token_statistic/${activeChainId}/${token.address}`)
  }, [tokens, activeChainId])
  const { message } = useSubscription(topics)

  useEffect(() => {
    setRealtimeTokens(tokens)
  }, [tokens])

  useEffect(() => {
    const msg = message?.message?.toString()
    if (msg) {
      const data: TokenStatisticDto = JSON.parse(msg)
      const topic = message?.topic?.toString()
      const address = topic?.split('/').pop()
      if (!address) return
      setRealtimeTokens((prevState) =>
        prevState.map((token) =>
          token.address === address
            ? {
                ...token,
                marketCap: Number(data?.marketcap) ? data.marketcap : token.marketCap,
                price: Number(data?.price) ? data.price : token.price,
                price24hChange: Number(data?.price24hChange) ? data?.price24hChange : token.price24hChange,
                volume24h: Number(data?.volume24h) ? data?.volume24h : token.volume24h,
              }
            : token,
        ),
      )
    }
  }, [message])

  const { upCount, downCount, total } = useMemo(() => {
    const upCount = realtimeTokens.filter((token) => token.price24hChange && +token.price24hChange > 0).length
    const downCount = realtimeTokens.filter((token) => token.price24hChange && +token.price24hChange < 0).length
    return {
      upCount,
      downCount,
      total: realtimeTokens.length,
    }
  }, [realtimeTokens])

  return {
    realtimeTokens,
    upCount,
    downCount,
    total,
  }
}

export const useXStockTokens = (options?: UseXStockTokensOptions) => {
  const { tokens, isLoading } = useTokens(options)
  const { realtimeTokens } = useRealtimeData(tokens)
  return {
    tokens: realtimeTokens,
    isLoading,
  }
}

export const useXStockTokensByActiveChain = () => {
  const activeChainId = useActiveChainId()
  return useXStockTokens({ chainId: activeChainId })
}
