import { gqlMeme2 } from '@/lib/gql/apollo-client.ts'
import { getTop100HolderStatistics } from '@services/tokens.service.ts'
import type { GetHolderStatisticsResponse } from '@/types/responses.ts'
import type { ChainIds } from '@/types/enums.ts'
import { useIndexedDBQuery } from '@/hooks/useIndexDB'

type UseHolderStatisticsProps = {
  token?: string
  chainId?: ChainIds
}

const DB_NAME = 'xbit-holder-statistics'
const STORE_NAME = 'holder-statistics'

export const useHolderStatistics = ({ token, chainId }: UseHolderStatisticsProps) => {
  const hasParams = Boolean(token && chainId)
  const idbKey = hasParams ? `${chainId}:${token}` : 'invalid'

  return useIndexedDBQuery<GetHolderStatisticsResponse>({
    queryKey: ['holderStatistics', token, chainId],
    dbName: DB_NAME,
    storeName: STORE_NAME,
    idbKey,
    enabled: hasParams,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!token || !chainId) throw new Error('Missing params')

      const res = await gqlMeme2.query<GetHolderStatisticsResponse>({
        query: getTop100HolderStatistics,
        variables: { token, chainId },
      })

      return res.data
    },
  })
}
