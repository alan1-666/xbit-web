import { useQuery } from '@apollo/client'
import { getPortfolio } from '@services/tokens.service.ts'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { PortfolioResponse } from '@/types/responses.ts'

type UseGetPortfolioOptions = {
  limit?: number
  page?: number
  userAddress?: string
  token?: string
  hideSmallBalance?: boolean
  hideSmallLiquidity?: boolean
  skipCondition?: boolean
  chainId?: number
}

export const LIMIT_GET_PORTFOLIO = 20

export const useGetPortfolio = ({
  limit = LIMIT_GET_PORTFOLIO,
  page = 1,
  userAddress,
  token,
  hideSmallBalance = false,
  hideSmallLiquidity = false,
  skipCondition = false,
  chainId,
}: UseGetPortfolioOptions) => {
  const { data, loading, error, refetch } = useQuery<PortfolioResponse>(getPortfolio, {
    client: gqlClient,
    fetchPolicy: 'cache-first',
    skip: skipCondition || !userAddress,
    variables: {
      input: {
        limit,
        page,
        userAddress,
        chainId,
        token,
        hideSmallBalance,
        hideSmallLiquidity,
      },
    },
  })

  return { data, loading, error, refetch }
}
