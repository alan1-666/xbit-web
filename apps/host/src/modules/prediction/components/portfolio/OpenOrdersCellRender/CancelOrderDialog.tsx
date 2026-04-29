import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'
import { useCancelOrder } from '@/modules/prediction/hooks/useCancelOrder'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface CancelOrderDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: ReactNode
}

export const CancelOrderDialog = ({ orderId, open, onOpenChange, children }: CancelOrderDialogProps) => {
  const { mutateAsync: cancelOrder, isPending: isCancelling } = useCancelOrder()
  const { t } = useTranslation()

  const handleCancel = async () => {
    try {
      await cancelOrder(orderId)
      toast.success(t('prediction.cancelOrder.success'))
      onOpenChange(false)
    } catch (error: any) {
      console.error('Cancel order failed:', error)
      toast.error(error.message || t('prediction.cancelOrder.failed'))
    }
  }

  return (
    <>
      {children}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#232329] max-w-[90vw] md:max-w-md rounded-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{t('prediction.cancelOrder.title')}</DialogTitle>
            <DialogDescription className="text-gray-400 pt-2">
              {t('prediction.cancelOrder.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-center pt-4">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isCancelling}
              className="bg-white/5 text-white border-white/10 hover:bg-white/10 rounded-full"
            >
              {t('toast.cancel')}
            </Button>
            <div className="">
              <Button
                variant={'gradient'}
                onClick={handleCancel}
                disabled={isCancelling}
                className=" text-white rounded-full"
                isLoading={isCancelling}
                loadingText={t('prediction.cancelOrder.cancelling')}
              >
                {t('toast.confirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
