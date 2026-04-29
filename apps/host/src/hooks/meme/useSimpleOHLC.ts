import { Ohlcdto, Timeframe } from '@/@generated/gql/graphql-meme2.ts'
import { useQuery } from '@tanstack/react-query'
import { gqlMeme2 } from '@/lib/gql/apollo-client.ts'
import { getOHLCWithUsdVolumeQuery } from '@services/pairs.service.ts'

export interface UseSimpleOHLCOptions {
  tokenAddress: string
  chainId: number
  timeframe: Timeframe
  limit?: number
  filterFn?: (data: Ohlcdto) => boolean
}

export const useSimpleOHLC = (options: UseSimpleOHLCOptions) => {
  const { tokenAddress, chainId, timeframe, limit, filterFn = () => true } = options
  return useQuery({
    queryKey: ['ohlc', timeframe],
    queryFn: async () => {
      const res = await gqlMeme2.query({
        query: getOHLCWithUsdVolumeQuery,
        variables: {
          input: {
            token: tokenAddress,
            chainId: chainId,
            timeframe: timeframe,
            limit,
          },
        },
      })
      return res.data.getOHLC.slice(0, limit).filter((item) => filterFn(item))
    },
  })
}
