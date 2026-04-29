import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service'
import { PriceChartSource, PriceChartBase, PriceChartQuote } from '@/@generated/gql/graphql-prediction'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export interface UsePriceChartInput {
  source: PriceChartSource
  base: PriceChartBase
  quote: PriceChartQuote
  enabled?: boolean
}

export const usePriceChart = ({ source, base, quote, enabled = true }: UsePriceChartInput) => {
  return useQuery({
    queryKey: QUERY_KEYS_CONFIGS.cryptoPrice(source, base, quote),
    queryFn: async () => {
      return eventsService.getPriceChart(source, base, quote)
    },
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  })
}
