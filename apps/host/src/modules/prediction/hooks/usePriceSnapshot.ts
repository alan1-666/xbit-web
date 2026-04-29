import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service'
import { PriceChartSource, PriceChartBase } from '@/@generated/gql/graphql-prediction'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export interface UsePriceSnapshotInput {
  source: PriceChartSource
  base: PriceChartBase
  endTime: number
  enabled?: boolean
}

export const usePriceSnapshot = ({ source, base, endTime, enabled = true }: UsePriceSnapshotInput) => {
  return useQuery({
    queryKey: QUERY_KEYS_CONFIGS.priceSnapshot(source, base, endTime),
    queryFn: async () => {
      return eventsService.getPriceSnapshot(source, base, endTime)
    },
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}
