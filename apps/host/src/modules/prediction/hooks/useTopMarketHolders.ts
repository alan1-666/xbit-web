import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/modules/prediction/services/events.service.ts'
import { TokenHolders } from '@/@generated/gql/graphql-prediction.ts'

export interface UseTopMarketHoldersOptions {
  conditionIds?: string[]
  limit?: number
  minBalance?: number
  enabled?: boolean
}

export const useTopMarketHolders = (options: UseTopMarketHoldersOptions = {}) => {
  const { conditionIds = [], limit, minBalance, enabled = true } = options

  return useQuery<TokenHolders[]>({
    queryKey: ['prediction', 'top-market-holders', conditionIds, limit, minBalance],
    queryFn: async () => {
      if (!conditionIds || conditionIds.length === 0) {
        return []
      }
      return eventsService.getTopMarketHolder(conditionIds, { limit, minBalance })
    },
    enabled: enabled && conditionIds.length > 0,
  })
}
