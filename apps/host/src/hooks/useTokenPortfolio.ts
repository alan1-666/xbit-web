import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { PortfolioResponse } from '@/types/responses.ts'
import { useQuery } from '@apollo/client'
import { getPortfolio } from '@services/tokens.service.ts'

export const useTokenPortfolio = ({ userAddress, token }: { userAddress: string; token: string }) => {
  const { data, loading, error, refetch } = useQuery<PortfolioResponse>(getPortfolio, {
    client: gqlClient,
    fetchPolicy: 'no-cache',
    skip: !userAddress || !token,
    variables: {
      input: {
        limit: 1,
        page: 1,
        sortBy: '-holdingValue',
        userAddress,
        token,
      },
    },
  })

  const portfolio = data?.getPortfolio?.data?.[0] ?? null

  return { portfolio, loading, error, refetch }
}
