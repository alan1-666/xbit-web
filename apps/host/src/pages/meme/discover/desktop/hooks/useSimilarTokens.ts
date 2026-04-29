import { useQuery } from '@tanstack/react-query'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { getSimilarTokens } from '@services/tokens.service.ts'

export const useSimilarTokens = (options: { token: string; chainId: number }) => {
  const { token, chainId } = options
  return useQuery({
    queryKey: ['similar-tokens', token],
    enabled: !!token,
    queryFn: async () => {
      const res = await futureClient.query({
        query: getSimilarTokens,
        variables: { input: { token, chainId } },
      })
      return res.data.searchSimilar.data
    },
  })
}
