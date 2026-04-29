import { Button } from '@components/ui/button.tsx'
import { useCallback } from 'react'
import { useCreateExternalWalletMutation } from '@/modules/prediction/hooks/useCreateExternalWalletMutation.ts'
import { useTranslation } from 'react-i18next'

export const EnableTradingButton = () => {
  const { t } = useTranslation()
  const { mutate, isPending } = useCreateExternalWalletMutation()
  const handleOnClick = useCallback(() => {
    mutate()
  }, [])
  return (
    <>
      <Button variant="gradient" onClick={handleOnClick} disabled={isPending} isLoading={isPending} className="w-full">
        {t('prediction.enableTrading.btnEnable')}
      </Button>
    </>
  )
}
