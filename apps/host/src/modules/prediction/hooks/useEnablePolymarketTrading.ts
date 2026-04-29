import { useMutation } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { EnableTradingInput, EnableTradingResponse } from '@/modules/prediction/types'
import { toast } from 'sonner'
import i18n from 'i18next'

export const useEnablePolymarketTrading = () => {
  return useMutation<EnableTradingResponse | undefined, Error, EnableTradingInput>({
    mutationKey: ['prediction', 'enable-polymarket-trading'],
    mutationFn: async (input: EnableTradingInput) => {
      return userService.enablePolymarketTrading(input)
    },
    onSuccess: (data) => {
      if (data) {
        toast.success(i18n.t('prediction.enableTrading.enableSuccess'))
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to enable trading')
    },
  })
}
