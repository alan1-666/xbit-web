import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@components/ui/dialog.tsx'
import { useState } from 'react'
import { Progress } from '@/components/ui/progress.tsx'
import { useApproveUSDC } from '../../hooks/useApproveUSDC'
import { cn } from '@/lib/utils'
import { useEnablePolymarketTrading } from '@/modules/prediction/hooks/useEnablePolymarketTrading'
import { useDispatch } from 'react-redux'
import { predictionActions } from '@/modules/prediction/slices/prediction.slice.ts'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import ls from '@/lib/local-storage'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

const USDC_ALLOWANCE_STORAGE_KEY = 'usdcAllowance'

export interface EnableTradingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EnableTradingDialog = ({ open, onOpenChange }: EnableTradingDialogProps) => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const { mutateAsync: enableTrading } = useEnablePolymarketTrading()
  const { mutateAsync: approveUSDC, isPending: isApproveUSDCPending } = useApproveUSDC()

  const totalSteps = 2
  const progress = (currentStep / totalSteps) * 100

  const updateAllowanceCache = (proxyWallet: string, allowanceUSDC?: number) => {
    const updated = { proxyWallet, allowanceUSDC: allowanceUSDC ?? 0, allowanceWei: '0' }
    ls.set(USDC_ALLOWANCE_STORAGE_KEY, updated)
    queryClient.setQueryData(['prediction', 'usdc-allowance'], updated)
  }

  const handleEnableTrading = async () => {
    setIsLoading(true)
    try {
      const result = await enableTrading({})
      const addr = result?.proxyWalletAddress
      if (addr) {
        // queryClient.invalidateQueries({ queryKey: ['polymarket-user-deposit-addresses'] })
        setWalletAddress(addr)
        setCurrentStep(2)
        dispatch(predictionActions.setCurrentProxyWallet(addr))
        updateAllowanceCache(addr, 0)
      }
    } catch (error) {
      console.log(error)
      // toast.error('Failed to enable trading')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveUSDC = async () => {
    setIsLoading(true)
    try {
      const response = await approveUSDC()
      if (response?.success) {
        if (walletAddress) {
          // Update USDC allowance cache with approved status
          updateAllowanceCache(walletAddress, Number.MAX_SAFE_INTEGER)
        }
        onOpenChange(false)
      }
    } catch (error) {
      toast.error('Failed to approve USDC')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">{t('prediction.enableTrading.title')}</h2>
              <p className="text-sm text-white">{t('prediction.enableTrading.desc')}</p>
            </div>
            <div className="bg-[#18181D] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 flex justify-center">
                  <Loader2 className="size-2.5 text-impartal animate-spin" strokeWidth={3} />
                </div>
                <span className="text-sm text-white">{t('prediction.enableTrading.setPermissions')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 flex justify-center">
                  <div className="w-2 h-2 bg-[#5C5C66] rounded-full flex-shrink-0"></div>
                </div>
                <span className="text-sm text-[#5C5C66]">{t('prediction.enableTrading.approveSpending')}</span>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">{t('prediction.enableTrading.approveTitle')}</h2>
              <p className="text-sm text-white">{t('prediction.enableTrading.approveDesc')}</p>
            </div>
            <div className="bg-[#18181D] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 flex justify-center">
                  <div className="w-2 h-2 bg-impartal rounded-full flex-shrink-0"></div>
                </div>
                <span className="text-sm text-white">{t('prediction.enableTrading.setPermissions')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 flex justify-center">
                  <Loader2 className="size-2.5 text-impartal animate-spin" strokeWidth={3} />
                </div>
                <span className="text-sm text-white">{t('prediction.enableTrading.approveSpending')}</span>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100%-32px)] max-w-lg border border-[#79778C29] p-3 rounded-xl bg-[#212127]">
          <div className="space-y-6">
            {/* Header with back button and progress */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">
                {t('prediction.enableTrading.step', { current: currentStep, total: totalSteps })}
              </span>
              <div className="w-5"></div>
            </div>

            {/* Progress bar */}
            <Progress value={progress} className="h-1 [&>div]:bg-impartal" />

            {/* Step content */}
            {renderStepContent()}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant="borderGradient"
                className="flex-1 rounded-full"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t('button.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button
                className="flex-1 rounded-full"
                variant="gradient"
                isLoading={isLoading || isApproveUSDCPending}
                disabled={isLoading || isApproveUSDCPending}
                onClick={currentStep === 1 ? handleEnableTrading : handleApproveUSDC}
              >
                {currentStep === 1 ? t('prediction.enableTrading.title') : t('prediction.enableTrading.btnApprove')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const EnableTradingButton = ({
  classNameButton,
  onSuccess,
}: {
  classNameButton?: string
  onSuccess?: () => void
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button className={cn('w-full rounded-full', classNameButton)} variant="gradient" onClick={() => setIsOpen(true)}>
        {t('prediction.enableTrading.btnEnable')}
      </Button>
      <EnableTradingDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
