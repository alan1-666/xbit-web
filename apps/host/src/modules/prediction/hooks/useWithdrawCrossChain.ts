import { useMutation } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { WithdrawCrossChainInput, WithdrawCrossChainResponse } from '@/modules/prediction/types'

export const useWithdrawCrossChain = () => {
  return useMutation<WithdrawCrossChainResponse | undefined, Error, WithdrawCrossChainInput>({
    mutationFn: async (input: WithdrawCrossChainInput) => {
      return userService.withdrawCrossChain(input)
    },
  })
}
