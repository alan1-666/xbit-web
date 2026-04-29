import { Configs } from '@const/configs.ts'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import BigNumber from 'bignumber.js'

interface UsePriceParams {
  address: string | undefined
  chainId: number | string | undefined
  refreshIntervalMs?: number
}

const usePrice = ({ address, chainId, refreshIntervalMs }: UsePriceParams) => {
  const RELAY = Configs.getRelayHost()
  const canFetchPrice = !!address && !!chainId

  const { data } = useQuery({
    queryKey: ['relay', 'token-price', address, chainId],
    queryFn: async ({ signal }) => {
      try {
        const { data } = await axios.get(`${RELAY}/currencies/token/price`, {
          params: { address, chainId },
          signal,
        })

        return new BigNumber(data.price).toString()
      } catch (error: any) {
        if (axios.isCancel(error) || error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
          throw error
        }

        console.error('Error fetching price:', error)
        throw error
      }
    },
    enabled: canFetchPrice,
    refetchInterval: canFetchPrice && refreshIntervalMs ? refreshIntervalMs : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    retry: false,
  })

  return canFetchPrice ? (data ?? '1') : '1'
}

export default usePrice
