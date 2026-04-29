import { ChainIds } from '@/types/enums.ts'
import { gqlMeme2 } from '@/lib/gql/apollo-client.ts'
import { getClassificationStatistic } from '@services/tokens2.service.ts'
import { ClassificationStatisticType } from '@/@generated/gql/graphql-meme2.ts'
import { useQuery } from '@tanstack/react-query'

type UseGetClassificationStatisticProps = {
  type: ClassificationStatisticType
  token: string
  chainId?: ChainIds
}

const INTERVAL_TIME = 5000

export const useGetClassificationStatistic = (props: UseGetClassificationStatisticProps) => {
  const { token, type, chainId } = props

  return useQuery({
    queryKey: ['getClassificationStatistic', token, type, chainId],
    queryFn: async () => {
      const response = await gqlMeme2.query({
        query: getClassificationStatistic,
        variables: {
          input: {
            token,
            chainId,
            type,
          },
        },
      })
      const { data } = response
      return data
    },
    enabled: !!token && !!type && !!chainId,
    refetchInterval: INTERVAL_TIME,
    staleTime: INTERVAL_TIME,
    refetchIntervalInBackground: false,
  })
}
