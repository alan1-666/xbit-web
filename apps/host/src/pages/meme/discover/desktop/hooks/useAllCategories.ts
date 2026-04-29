import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useQuery } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getCategories } from '@services/tokens.service.ts'
import { ChainIds } from '@/types/enums.ts'

export const useAllCategories = () => {
  const activeChainId = useActiveChainId()
  return useQuery({
    queryKey: ['allCategories', activeChainId],
    queryFn: async () => {
      const res = await futureClient.query({
        query: getCategories,
        variables: {
          input: {
            chainId: activeChainId ?? ChainIds.Solana,
          },
        },
      })
      return res.data.getAllCategories.data ?? []
    },
    select: (data) => data ?? [],
  })
}
