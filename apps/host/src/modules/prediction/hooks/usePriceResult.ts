import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'
import { PriceChartSource, PriceChartBase, PriceTimeframe } from '@/@generated/gql/graphql-prediction.ts'

interface UsePriceResultProps {
  source: PriceChartSource
  base: PriceChartBase
  timestamp?: number
  timeframe: PriceTimeframe
  enabled?: boolean
  seriesID?: string
}

export const usePriceResult = ({
  source,
  base,
  timestamp,
  timeframe,
  seriesID,
  enabled = true,
}: UsePriceResultProps) => {
  return useQuery({
    queryKey: QUERY_KEYS_CONFIGS.priceResult(source, base, timeframe, timestamp, seriesID),
    enabled: enabled && !!source && !!base && !!timestamp,
    queryFn: async () => {
      return eventsService.getPriceResult(source, base, timeframe, timestamp, seriesID)
    },
  })
}
