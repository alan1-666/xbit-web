import {useQuery} from "@tanstack/react-query";
import {futureClient} from "@/lib/gql/apollo-client.ts";
import {getSmartMoneyHolderCount} from "@services/tokens.service.ts";
import dayjs from "dayjs";

export interface UseSmartMoneyHolderCountOptions {
  token: string
  chainId: number
  createdAt: string
}

export const useSmartMoneyHolderCount = (options: UseSmartMoneyHolderCountOptions) => {
  const { token, chainId, createdAt } = options
  const isLessThan1h = dayjs(createdAt).diff(dayjs(), 'second') < 3600
  return useQuery({
    queryKey: ['smart-money-holder-count', token, chainId],
    queryFn: async () => {
      const res = await futureClient.query({
        query: getSmartMoneyHolderCount,
        variables: {
          req: {
            tokenAddress: token,
            chainId,
          }
        }
      })
      return res.data.getSmartMoneyHolderCount
    },
    refetchInterval: isLessThan1h ? 5000 : 15000,
  })
}
