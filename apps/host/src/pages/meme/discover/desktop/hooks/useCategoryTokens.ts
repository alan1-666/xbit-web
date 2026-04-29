import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { getFullyTokensByCategory } from '@services/tokens.service.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { ChainIds } from '@/types/enums.ts'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SortDirection, TokenSortFields, TokensStatisticByCategoryDto } from '@/@generated/gql/graphql-future.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useAllBacklistAddresses } from '@pages/meme/discover/desktop/hooks/useBlacklistAddress.ts'
import { useSubscription } from '@/lib/mqtt'
import { TokenStatisticDto } from '@/@generated/gql/graphql-core.ts'
import {useActiveChainId} from "@hooks/useActiveChain.ts";

export interface UseCategoryTokensOptions {
  chainId?: number
  categoryId: string
  sortBy?: TokenSortFields
  sortType?: SortDirection
  enabled?: boolean
}

export const useCategoryTokens = (options: UseCategoryTokensOptions) => {
  const { categoryId, chainId, sortBy = 'MarketCap', sortType = SortDirection.Desc, enabled = true } = options
  const queryClient = useQueryClient()
  const activeWallet = useActiveWallet()
  const { blacklistTokens, blacklistDevs } = useAllBacklistAddresses()
  const result = useInfiniteQuery({
    queryKey: ['getTokensByCategory', chainId, categoryId, sortBy, sortType, activeWallet.walletAddress],
    initialPageParam: 1,
    enabled: !!categoryId && enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async ({ pageParam }) => {
      const res = await futureClient.query({
        query: getFullyTokensByCategory,
        variables: {
          input: {
            chainId: chainId ?? ChainIds.Solana,
            categoryId: categoryId!,
            page: pageParam,
            limit: 20,
            sortBy: sortBy,
            sortType: sortType,
          },
        },
      })
      const tokens = res.data.tokensByCategory.data as TokensStatisticByCategoryDto[]
      return tokens.map((token) => ({
        ...token,
        insider: token.insider ? +token.insider * 100 : 0,
        devHold: token.devHold ? +token.devHold * 100 : 0,
        top10Holder: token.top10Holder ? +token.top10Holder * 100 : 0,
        sniperHoldPct: token.sniperHoldPct ? +token.sniperHoldPct * 100 : 0,
      }))
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length + 1
    },
    select: (data) => data.pages.flat() ?? [],
  })

  const filteredTokens = useMemo(() => {
    const tokens = result.data ?? []
    return tokens.filter((token) => {
      const isBlacklistedToken = blacklistTokens.some(
        (blacklist) => blacklist.address.toLowerCase() === token.address?.toLowerCase(),
      )
      const isBlacklistedDev = token.creator
        ? blacklistDevs.some((blacklist) => blacklist.address.toLowerCase() === token.creator?.toLowerCase())
        : false
      return !isBlacklistedToken && !isBlacklistedDev
    })
  }, [result.data, blacklistTokens, blacklistDevs])

  const loadMore = useCallback(() => {
    if (result.isLoading || result.isFetchingNextPage || !result.hasNextPage) return
    result.fetchNextPage().then()
  }, [result.isLoading, result.hasNextPage, result.isFetchingNextPage, result.fetchNextPage])

  const onTokenFavoriteChanged = useCallback(
    (token: string, isFavorite: boolean) => {
      queryClient.setQueriesData(
        {
          predicate: (query) => query.queryKey[0] === 'getTokensByCategory' && query.queryKey[2] === categoryId,
        },
        (oldData: InfiniteData<TokensStatisticByCategoryDto[]> | undefined) => {
          if (!oldData) return oldData
          const newPages = oldData.pages.map((page) =>
            page.map((item) => {
              if (item.address === token) {
                return {
                  ...item,
                  isFavorite,
                }
              }
              return item
            }),
          )
          return {
            ...oldData,
            pages: newPages,
          }
        },
      )
    },
    [categoryId],
  )

  return {
    ...result,
    loadMore,
    tokens: filteredTokens,
    onTokenFavoriteChanged,
  }
}

export const useRemoveFavoriteToken = () => {
  const queryClient = useQueryClient()
  return useCallback((token: string) => {
    queryClient.setQueriesData(
      {
        predicate: (query) => query.queryKey[0] === 'getTokensByCategory',
      },
      (oldData: InfiniteData<TokensStatisticByCategoryDto[]> | undefined) => {
        if (!oldData) return oldData
        const newPages = oldData.pages?.map((page) =>
          page.map((item) => {
            if (item.address === token) {
              return {
                ...item,
                isFavorite: false,
              }
            }
            return item
          }),
        )
        return {
          ...oldData,
          pages: newPages,
        }
      },
      {
        updatedAt: Date.now() + 10000, // prevent immediate refetch
      }
    )
  }, [])
}

export const useRealtimeTokens = (tokens: TokensStatisticByCategoryDto[]) => {
  const [realtimeTokens, setRealtimeTokens] = useState<TokensStatisticByCategoryDto[]>(tokens)
  const activeChainId = useActiveChainId()
  const { message } = useSubscription(tokens.map((token) => `public/token_statistic/${activeChainId}/${token.address}`))

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
              marketCap: data.marketcap ? data.marketcap : token.marketCap,
              price: data.price ? data.price : token.price,
              price24hChange: data.price24hChange ? data.price24hChange : token.price24hChange,
              volume24h: data.volume24h ? data.volume24h : token.volume24h,
            }
            : token,
        ),
      )
    }
  }, [message])
  return realtimeTokens
}

export const useRealtimeCategoryTokens = (options: UseCategoryTokensOptions) => {
  const { tokens, ...rest } = useCategoryTokens(options)
  const realtimeTokens = useRealtimeTokens(tokens)
  return {
    tokens: realtimeTokens,
    ...rest,
  }
}
