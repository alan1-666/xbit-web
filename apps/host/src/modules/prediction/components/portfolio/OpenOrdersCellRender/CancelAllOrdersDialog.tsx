import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'
import { useCancelOrder } from '@/modules/prediction/hooks/useCancelOrder'
import { toast } from 'sonner'

interface CancelAllOrdersDialogProps {
  orderIds: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: ReactNode
}

export const CancelAllOrdersDialog = ({ orderIds, open, onOpenChange, children }: CancelAllOrdersDialogProps) => {
  const { mutateAsync: cancelOrder, isPending: isCancelling } = useCancelOrder()

  const handleCancelAll = async () => {
    try {
      // Cancel all orders sequentially
      for (const orderId of orderIds) {
        await cancelOrder(orderId)
      }
      toast.success(`Successfully cancelled ${orderIds.length} order${orderIds.length > 1 ? 's' : ''}`)
      onOpenChange(false)
    } catch (error: any) {
      console.error('Cancel all orders failed:', error)
      toast.error(error.message || 'Failed to cancel orders')
    }
  }

  return (
    <>
      {children}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#1C1C1E] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Cancel All Orders</DialogTitle>
            <DialogDescription className="text-gray-400 pt-2">
              Are you sure you want to cancel all {orderIds.length} order{orderIds.length > 1 ? 's' : ''}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-center pt-4">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isCancelling}
              className="flex-1 bg-white/5 text-white border-white/10 hover:bg-white/10 rounded-full"
            >
              No, keep them
            </Button>
            <Button
              onClick={handleCancelAll}
              disabled={isCancelling}
              variant={'gradient'}
              // className="bg-red-600 text-white hover:bg-red-700"
              className="flex-1 text-white font-medium transition-all active:scale-[0.98] rounded-full"
              isLoading={isCancelling}
              loadingText="Cancelling..."
            >
              Yes, cancel all
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
