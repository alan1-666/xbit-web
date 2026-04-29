import { futureClient } from '@/lib/gql/apollo-client.ts'
import { ChainIds } from '@/types/enums.ts'
import { GetHolderChartsResponse } from '@/types/responses.ts'
import { useQuery } from '@apollo/client'
import { getHolderCharts } from '@services/tokens.service.ts'

type useGetHolderChartProps = {
  token: string,
  chainId: ChainIds
}

const useGetHolderChart = ({token, chainId}: useGetHolderChartProps) => {
  const { data, loading, error, refetch } = useQuery<GetHolderChartsResponse>(getHolderCharts,{
    client: futureClient,
    skip: !token || !chainId,
    variables: {
      input: {
        token,
        chainId
      }
    }
  });

  return {data, loading, error, refetch}
}

export default useGetHolderChart
