import { Configs } from '@const/configs.ts'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import BigNumber from 'bignumber.js'

interface UseQuoteParams {
  user: string | undefined
  originChainId: number | undefined
  originCurrency: string | undefined
  destinationChainId: number | undefined
  destinationCurrency: string | undefined
  amount: string | undefined
  tradeType: 'EXACT_INPUT' | 'EXACT_OUTPUT' | 'EXPECTED_OUTPUT'
  recipient: string | undefined
  refreshIntervalMs?: number
}

interface UseQuoteReturn {
  quoteRelay: any
  isQuoteing: boolean
}

const REFRESH_INTERVAL_MS = 15_000

const useQuote = ({
  user,
  originChainId,
  originCurrency,
  destinationChainId,
  destinationCurrency,
  amount,
  tradeType = 'EXACT_INPUT',
  recipient,
  refreshIntervalMs = REFRESH_INTERVAL_MS,
}: UseQuoteParams): UseQuoteReturn => {
  const RELAY = Configs.getRelayHost()
  const canFetchQuote =
    !!user &&
    !!originChainId &&
    !!originCurrency &&
    !!destinationChainId &&
    !!destinationCurrency &&
    !!amount &&
    amount !== '0' &&
    !!tradeType &&
    !!recipient

  const { data, isFetching } = useQuery({
    queryKey: [
      'relay',
      'quote-v2',
      user,
      originChainId,
      originCurrency,
      destinationChainId,
      destinationCurrency,
      amount,
      tradeType,
      recipient,
    ],
    queryFn: async ({ signal }) => {
      try {
        const { data } = await axios.post(
          `${RELAY}/quote/v2`,
          {
            user: user,
            originChainId: originChainId,
            destinationChainId: destinationChainId,
            originCurrency: originCurrency,
            destinationCurrency: destinationCurrency,
            amount: amount,
            tradeType: 'EXACT_INPUT',
            recipient: recipient,
          },
          { signal },
        )

        return data ?? {}
      } catch (error: any) {
        if (axios.isCancel(error) || error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
          throw error
        }

        console.error('Error fetching quote:', error)
        return {}
      }
    },
    enabled: canFetchQuote,
    refetchInterval: canFetchQuote ? refreshIntervalMs : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    retry: false,
  })

  return {
    quoteRelay: canFetchQuote ? (data ?? {}) : {},
    isQuoteing: isFetching,
  }
}

export default useQuote
