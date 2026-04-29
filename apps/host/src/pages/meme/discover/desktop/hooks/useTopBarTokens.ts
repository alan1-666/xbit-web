import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { futureClient, gqlClient, gqlMeme2 } from '@/lib/gql/apollo-client.ts'
import {
  getManyToken,
  getPortfolio,
  getSimpleFavoriteTokens,
  removeTokenFromFavorite,
} from '@services/tokens.service.ts'
import { Token } from '@/@generated/gql/graphql-core.ts'
import { getBlockChainLogo } from '@/utils/helpers.ts'
import { ChainIds } from '@/types/enums.ts'
import { TopBarToken } from '@components/v2/desktop/TokenTopBarCard.tsx'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getBrowsingHistory } from '@services/settings.service.ts'
import { browsingHistoryActions } from '@/redux/modules/browsingHistory.slice.ts'
import { useActiveChainType } from '@hooks/useActiveChain.ts'
import { ChainType, Dex, TimeRange } from '@/@generated/gql/graphql-meme2.ts'
import { useRemoveFavoriteToken } from '@pages/meme/discover/desktop/hooks/useCategoryTokens.ts'
import { useIndexedDBQuery } from '@/hooks/useIndexDB'

const hashString = (input: string) => {
  // simple deterministic hash (fast, non-crypto)
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

const fetchManyTokens = async (chainId: number, tokens: string[]) => {
  const res = await gqlClient.query({
    query: getManyToken,
    variables: {
      input: {
        chainId: chainId,
        tokens: tokens,
      },
    },
  })
  return (res.data.getManyToken || []) as Token[]
}

export const useWatchlistTopBarTokens = () => {
  const activeWallet = useActiveWallet()
  const queryClient = useQueryClient()
  const activeChainType = useActiveChainType()
  const removeFavoriteTokenInCategory = useRemoveFavoriteToken()

  const walletKey = activeWallet.walletAddress || 'guest'
  const chainKey = activeChainType || ChainType.Solana

  const query = useIndexedDBQuery<TopBarToken[]>({
    queryKey: ['topBarTokens', 'favorite', walletKey, chainKey],
    dbName: 'xbit-topbar-watchlist',
    storeName: 'favorite',
    idbKey: `${walletKey}:${chainKey}:Dex.All:H24`,
    enabled: activeWallet.isConnected,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await futureClient.query({
        query: getSimpleFavoriteTokens,
        variables: {
          input: {
            chain: chainKey,
            dex: Dex.All,
            timeRange: TimeRange.H24,
          },
        },
      })

      const favoriteTokens = res.data.getFavoriteToken?.data || []
      return favoriteTokens.map((token) => ({
        address: token.token,
        avatar: token.image || getBlockChainLogo(token.chainId, token.token),
        name: token.symbol ?? '--',
        marketCap: token.marketcap ? +token.marketcap : 0,
        priceChange: token.price24hChange ? +token.price24hChange : 0,
        chainId: token.chainId,
        sector: token.name?.includes('xStock') ? 'xstock' : 'meme',
      })) as TopBarToken[]
    },
  })

  const removeFavoriteToken = async (token: TopBarToken) => {
    await futureClient.mutate({
      mutation: removeTokenFromFavorite,
      variables: {
        token: token.address,
        chain: activeChainType,
      },
    })

    // keep UI snappy
    queryClient.setQueryData(['topBarTokens', 'favorite', walletKey, chainKey], (old: TopBarToken[] | undefined) =>
      old ? old.filter((t) => t.address !== token.address) : old,
    )

    void queryClient.invalidateQueries({ queryKey: ['topBarTokens', 'favorite'] })
    void queryClient.invalidateQueries({ queryKey: ['tokens', 'watchlist'] })
    void queryClient.invalidateQueries({ queryKey: ['tokens'] })

    removeFavoriteTokenInCategory(token.address || '')
  }

  return {
    tokens: query.data || [],
    removeFavoriteToken,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  }
}

export const useHoldingTopBarTokens = () => {
  const activeWallet = useActiveWallet()
  const chainId = activeWallet.chainId || ChainIds.Solana
  const walletKey = activeWallet.walletAddress || 'guest'

  const query = useIndexedDBQuery<TopBarToken[]>({
    queryKey: ['topBarTokens', 'holding', walletKey, chainId],
    dbName: 'xbit-topbar-holding',
    storeName: 'holding',
    idbKey: `${walletKey}:${chainId}:tag=meme:sort=-holdingValue`,
    enabled: activeWallet.isConnected,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await gqlClient.query({
        query: getPortfolio,
        variables: {
          input: {
            chainId: chainId,
            userAddress: walletKey,
            hideSmallLiquidity: false,
            hideSmallBalance: false,
            sortBy: '-holdingValue',
            tag: 'meme',
          },
        },
      })

      const holdingTokens = res.data.getPortfolio?.data || []

      const tokenAddresses: string[] = holdingTokens.map((t) => t.token ?? '').filter(Boolean) ?? []

      const tokenInfos = tokenAddresses.length ? await fetchManyTokens(chainId, tokenAddresses) : []

      return holdingTokens.map((token) => {
        const tokenInfo = tokenInfos.find((item) => item.address === token.token)
        const totalSupply = tokenInfo?.totalSupply ? +tokenInfo.totalSupply : 0
        const price = token.price ? +token.price : 0
        const decimals = token?.decimals ? +token.decimals : 0
        const marketCap = (totalSupply * price) / 10 ** decimals

        return {
          address: token.token,
          avatar: tokenInfo?.logo || getBlockChainLogo(token.chainId ?? ChainIds.Solana, token.token ?? ''),
          name: token.symbol ?? '--',
          marketCap,
          priceChange: token.price24hChange ? +token.price24hChange : 0,
          chainId: token.chainId,
          sector: tokenInfo?.tags?.includes('xStock') ? 'xstock' : 'meme',
        }
      }) as TopBarToken[]
    },
  })

  return { data: query.data || [], isFetching: query.isFetching }
}

export const useRecentTopBarTokens = () => {
  const browsingHistory = useAppSelector((state) => state.browsingHistory.tokens as string[])
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const history20 = useMemo(() => browsingHistory.slice(0, 20), [browsingHistory])
  const historyKey = useMemo(() => hashString(history20.join('|')), [history20])

  const query = useIndexedDBQuery<TopBarToken[]>({
    queryKey: ['topBarTokens', 'recent', historyKey],
    dbName: 'xbit-topbar-recent',
    storeName: 'recent',
    idbKey: historyKey,
    enabled: history20.length > 0,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await gqlMeme2.query({
        query: getBrowsingHistory,
        variables: {
          input: {
            tokenAddresses: history20, // Limit to 20 tokens for query
          },
        },
      })

      const recentTokens = res.data.getBrowserHistory || []
      const tokens: TopBarToken[] = []

      for (const tokenAddr of history20) {
        const found = recentTokens.find((item) => item.token === tokenAddr)
        if (found) {
          tokens.push({
            address: found.token,
            avatar: found.image || getBlockChainLogo(found.chainId ?? ChainIds.Solana, found.token ?? ''),
            name: found.symbol || '--',
            marketCap: found.marketCap ? +found.marketCap : 0,
            priceChange: found.price24hChange ? +found.price24hChange : 0,
            chainId: found.chainId,
            sector: found.categoryIds?.includes('XStock') ? 'xstock' : 'meme',
          })
        }
        if (tokens.length >= 20) break
      }

      return tokens
    },
  })

  const removeToken = useCallback(
    (token: TopBarToken) => {
      dispatch(browsingHistoryActions.removeTokenFromHistory(token.address || ''))

      queryClient.setQueryData(['topBarTokens', 'recent', historyKey], (oldData: TopBarToken[] | undefined) => {
        if (!oldData) return oldData
        return oldData.filter((item) => item.address !== token.address)
      })
    },
    [dispatch, queryClient, historyKey],
  )

  return {
    data: query.data || [],
    removeToken,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  }
}
