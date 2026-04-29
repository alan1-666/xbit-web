import { TokensStatisticByCategoryDto } from '@/@generated/gql/graphql-future'
import { useActiveChainId } from '@/hooks/useActiveChain'
import { useQueryClient } from '@tanstack/react-query'
import { isEqual } from 'lodash-es'

const handleUpdateCacheXstock = () => {
  const queryClient = useQueryClient()
  const activeChainId = useActiveChainId()

  const onAdded = ({ token }: { token: TokensStatisticByCategoryDto }) => {
    queryClient.setQueriesData(
      {
        predicate: (query) => isEqual(query.queryKey.slice(0, 3), ['getTokensByCategory', activeChainId, 'XStock']),
      },
      (oldData: { pages: TokensStatisticByCategoryDto[][]; pageParams: any[] } | TokensStatisticByCategoryDto[]) => {
        const updateTokenFavorite = (tokenItem: TokensStatisticByCategoryDto): TokensStatisticByCategoryDto => {
          if (tokenItem.address === token.address) {
            return { ...tokenItem, isFavorite: true, favoriteAt: new Date().toISOString() }
          }
          return tokenItem
        }
        // Check if it's infinite query data like [oldData.pages]
        if ('pages' in oldData && Array.isArray(oldData.pages)) {
          return {
            ...oldData,
            pages: oldData.pages.map((page) => (Array.isArray(page) ? page.map(updateTokenFavorite) : page)),
          }
        }
        // Check if it's flat array (from select)
        if (Array.isArray(oldData)) {
          return oldData.map(updateTokenFavorite)
        }
        return oldData
      },
    )
  }

  const onRemoveSuccess = ({ token }: { token: TokensStatisticByCategoryDto }) => {
    queryClient.setQueriesData(
      {
        predicate: (query) => isEqual(query.queryKey.slice(0, 3), ['getTokensByCategory', activeChainId, 'XStock']),
      },
      (oldData: { pages: TokensStatisticByCategoryDto[][]; pageParams: any[] } | TokensStatisticByCategoryDto[]) => {
        const updateTokenFavorite = (tokenItem: TokensStatisticByCategoryDto): TokensStatisticByCategoryDto => {
          if (tokenItem.address === token.address) {
            return { ...tokenItem, isFavorite: false }
          }
          return tokenItem
        }
        // Check if it's infinite query data like [oldData.pages]
        if ('pages' in oldData && Array.isArray(oldData.pages)) {
          return {
            ...oldData,
            pages: oldData.pages.map((page) => (Array.isArray(page) ? page.map(updateTokenFavorite) : page)),
          }
        }
        // Check if it's flat array (from select)
        if (Array.isArray(oldData)) {
          return oldData.map(updateTokenFavorite)
        }
        return oldData
      },
    )
  }

  return {
    onAdded,
    onRemoveSuccess,
  }
}

export default handleUpdateCacheXstock
