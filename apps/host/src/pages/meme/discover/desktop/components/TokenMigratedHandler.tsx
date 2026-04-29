import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { useTokenMigratedSubscription } from '@hooks/useTokenMigratedSubscription.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'
import { LifecycleStates } from '@/@generated/gql/graphql-future.ts'
import { MemeTokenWithFormatted } from '@/types/token.ts'
import { useCallback } from 'react'

export interface TokenMigratedHandlerProps {
  onMigrated?: (tokenAddress: string) => void
}

export const TokenMigratedHandler = (props: TokenMigratedHandlerProps) => {
  const { onMigrated } = props
  const queryClient = useQueryClient()
  const chainId = useActiveChainId()

  const handler = useCallback(
    ({ tokenAddress }: { tokenAddress: string; migratedAt: number }) => {
      const queries = queryClient.getQueriesData({
        predicate: (query) =>
          query.queryKey[0] === 'tokens' &&
          query.queryKey[1] === 'meme' &&
          (query.queryKey[2] === LifecycleStates.NewCreation || query.queryKey[2] === LifecycleStates.Completing),
      })

      // Remove from newCreation and completing caches
      queries.forEach(([queryKey, oldData]) => {
        const data = oldData as InfiniteData<MemeTokenWithFormatted[]> | undefined
        if (!data) return

        const newPages = data.pages.map((page) => {
          return page.filter((t) => t.token.toLowerCase() !== tokenAddress.toLowerCase())
        })

        const newData = {
          ...data,
          pages: newPages,
        }

        queryClient.setQueryData(queryKey, newData)
      })

      // Refetch completed cache to include the migrated token
      setTimeout(() => {
        queryClient
          .refetchQueries(
            {
              predicate: (query) =>
                query.queryKey[0] === 'tokens' &&
                query.queryKey[1] === 'meme' &&
                query.queryKey[2] === LifecycleStates.Completed,
            },
            {},
          )
          .then(() => {})
      }, 1000)

      onMigrated?.(tokenAddress)
    },
    [onMigrated],
  )

  useTokenMigratedSubscription({
    chainId: chainId || ChainIds.Solana,
    onTokenMigrated: handler,
  })

  return null
}
