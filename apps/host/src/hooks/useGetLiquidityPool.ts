import { ChainIds } from '@/types/enums.ts'
import { LIMIT_PER_PAGE } from '@const/smartMoney.ts'
import { useQuery } from '@apollo/client'
import { GetLiquidityChartResponse } from '@/types/responses.ts'
import { getLiquidityChart } from '@services/tokens.service.ts'
import { gqlClient } from '@/lib/gql/apollo-client.ts'

type useGetLiquidityPoolProps = {
  token: string
  chainId: ChainIds
  page: number
  pageSize: number
}

const useGetLiquidityPool = ({
  token,
  chainId,
  page = 1,
  pageSize = LIMIT_PER_PAGE,
}: useGetLiquidityPoolProps) => {
  const { data, loading, error, refetch } = useQuery<GetLiquidityChartResponse>(getLiquidityChart, {
    client: gqlClient,
    skip: !token || !chainId,
    variables: {
      input: {
        token,
        chainId,
        page,
        pageSize,
      }
    }
  })

  return { data, loading, error, refetch }
}

export default useGetLiquidityPool
