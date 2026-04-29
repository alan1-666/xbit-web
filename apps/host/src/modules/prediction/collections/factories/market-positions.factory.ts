import { createCollection } from '@/modules/prediction/collections/base.ts'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs.ts'

export const marketPositionsFactory = (userAddress: string, marketConditionId: string) => {
  return createCollection({
    queryKey: () => QUERY_KEYS_CONFIGS.userPositions(userAddress, marketConditionId, {}),
    queryFn: async () => {
      return userService.getCurrentPositions({
        userAddress,
        limit: 20,
        filter: {
          conditionID: [marketConditionId],
        },
      })
    },
    enabled: !!userAddress && !!marketConditionId,
    mutations: {},
  })
}
