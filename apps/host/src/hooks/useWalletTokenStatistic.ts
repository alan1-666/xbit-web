import { QueryGetWalletTokenStatisticArgs, WalletTokenStatisticDto } from '@/@generated/gql/graphql-meme2'
import { gqlMeme2 } from '@/lib/gql/apollo-client'
import { getWalletTokenStatistic } from '@/services/tokens.service'
import { useQuery } from '@apollo/client'

export const useWalletTokenStatistic = (args: QueryGetWalletTokenStatisticArgs, skip: boolean = false) => {
  return useQuery<{ getWalletTokenStatistic: WalletTokenStatisticDto }>(getWalletTokenStatistic, {
    variables: args,
    client: gqlMeme2,
    fetchPolicy: 'no-cache',
    skip: !args?.address || !args?.address || !args?.chainId || skip,
  })
}
