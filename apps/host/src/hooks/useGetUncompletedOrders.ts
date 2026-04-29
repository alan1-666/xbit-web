import { useQuery } from '@apollo/client'
import { tradingClient } from '@/lib/gql/apollo-client.ts'
import { getUncompletedOrders } from '@services/order.service.ts'
import { GetUncompletedOrdersResponse } from '@/types/responses.ts'
import { SearchOrderInput } from '@/@generated/gql/graphql-trading'


const useGetUncompletedOrders = (input: SearchOrderInput) => {
  const { data, loading, error, refetch } = useQuery<GetUncompletedOrdersResponse>(getUncompletedOrders, {
    client: tradingClient,
    skip: !input?.userAddress,
    variables: {
      input
    },
  })

  return { data: data?.getUncompletedOrders, loading, error, refetch }
}

export default useGetUncompletedOrders
