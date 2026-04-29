import { useQuery } from '@apollo/client'
import { getFollowingSmartMoney } from '@services/smartMoney.service.ts'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { ChainType, SmartMoneySortType } from '@/@generated/gql/graphql-core.ts'
import { GetFollowingSmartMoneysResponse } from '@/types/responses.ts'
import { LIMIT_PER_PAGE } from '@const/smartMoney.ts'

type useGetFollowingSmartMoneyProps = {
  page?: number
  limit?: number
  chain?: ChainType
  sortType?: SmartMoneySortType
}

const useGetFollowingSmartMoney = ({
  page = 1,
  limit = LIMIT_PER_PAGE,
  chain = ChainType.Solana,
  sortType = SmartMoneySortType.FollowTime
}: useGetFollowingSmartMoneyProps) => {
  const { data, loading, error } = useQuery<GetFollowingSmartMoneysResponse>(getFollowingSmartMoney, {
    client: gqlClient,
    variables: {
      filter: {
        page,
        limit,
        chain,
        sortType
      }
    }
  })

  return {data, loading, error}
}

export default useGetFollowingSmartMoney;
