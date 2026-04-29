import { useMutation } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { useOptimisticUpdateUSDCAllowance } from '@/modules/prediction/hooks/useUSDCAllowance.ts'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export const useApproveUSDC = () => {
  const optimisticUpdate = useOptimisticUpdateUSDCAllowance()
  const { t } = useTranslation()
  return useMutation({
    mutationKey: ['prediction', 'approve-usdc'],
    mutationFn: async () => {
      return userService.approveUSDCAllowance()
    },
    onSuccess: async () => {
      optimisticUpdate(Number.MAX_SAFE_INTEGER)
      toast.success(t('prediction.enableTrading.approveUSDCSuccess'))
    },
    onError: (error) => {
      toast.error(error.message || t('prediction.enableTrading.approveUSDCFailed'))
    },
  })
}
