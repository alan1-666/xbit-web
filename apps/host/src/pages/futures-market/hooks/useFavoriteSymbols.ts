import { useQuery, useQueryClient } from '@tanstack/react-query'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { GET_FAVORITE_SYMBOLS } from '@/services/symbol.dex.service'
import { useCallback } from 'react'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { ServiceConfig } from '@/lib/gql/service-config'

/**
 * 使用 React Query 获取收藏的合约列表
 * 支持持久化缓存和自动刷新
 */
export const useFavoriteSymbols = () => {
  const queryClient = useQueryClient()

  const result = useQuery({
    queryKey: ['favorite-symbols', ServiceConfig.token],
    refetchInterval: 10000, // 10 秒自动刷新
    queryFn: async () => {
      const { data } = await symbolDexClient.query({
        query: GET_FAVORITE_SYMBOLS,
        fetchPolicy: 'network-only',
      })

      const list = (data?.getFavoriteSymbols?.list || []) as ISymbolList[]
      return list
    },
    enabled: !!ServiceConfig.token, // 只有在有 token 时才执行
    staleTime: 5000, // 5 秒内认为数据是新鲜的
  })

  // 从缓存中移除指定的合约（乐观更新）
  const removeSymbol = useCallback(
    (symbol: string) => {
      queryClient.setQueryData(['favorite-symbols', ServiceConfig.token], (oldData: ISymbolList[] | undefined) => {
        if (!oldData) return oldData
        return oldData.filter((item) => item.symbol !== symbol)
      })
    },
    [queryClient],
  )

  return {
    ...result,
    removeSymbol,
    favorites: result.data || [],
  }
}
