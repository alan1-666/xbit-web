import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { PriceChartSource, PriceChartBase, PriceAtFilter } from '@/@generated/gql/graphql-prediction.ts'

interface UsePriceAtProps {
  source: PriceChartSource
  base: PriceChartBase
  timestamp: number
  enabled?: boolean
  filter?: PriceAtFilter
}

export const usePriceAt = ({ source, base, timestamp, enabled = true, filter }: UsePriceAtProps) => {
  return useQuery({
    queryKey: QUERY_KEYS_CONFIGS.priceAt(source, base, timestamp, filter),
    enabled: enabled && !!source && !!base && !!timestamp,
    queryFn: async () => {
      return eventsService.getPriceAt(source, base, timestamp, filter)
    },
  })
}
