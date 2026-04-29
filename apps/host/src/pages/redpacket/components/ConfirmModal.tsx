import { Button } from '@/components/ui/button'
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'


import { useTranslation } from 'react-i18next'
interface WithdrawConfirmModal {
  isOpen: boolean
  onOpenChange?: (status: boolean, action: 'cancel' | 'confirm') => void
}

const WithdrawConfirmModal = ({ isOpen, onOpenChange }: WithdrawConfirmModal) => {
  const { t } = useTranslation()
  const handleOpenChange = (status: boolean, action: 'cancel' | 'confirm' = 'cancel' ) => {
    if (onOpenChange) {
      onOpenChange(status, action)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#232329] w-[80%] rounded-[8px] max-w-[400px] py-4 px-0" showDialogPrimitiveClose={false}>
       <DialogHeader className='border-b border-[#302E38] px-4 pb-4'>
        <div className='flex items-center justify-between'>
          <DialogTitle><div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">Confirmation</div></DialogTitle>

          <button
            onClick={() => handleOpenChange(false)}
            className="rounded-full text-white/60 hover:text-white/80 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </DialogHeader>
      <div className='px-4'>
        {t('red.packet.withdraw.confirm.tips')}
        <div className="grid grid-cols-2 gap-2 mt-5">
        <Button
          className="text-[#fff] bg-[#2B2B33] w-full rounded-[50px] font-bold h-[calc(1rem*(44/16))]"
          onClick={() => handleOpenChange(false)}
        >
          {t('futuresDetails.common.cancel')}
        </Button>
        <Button
          variant="purpleDefault"
          className={cn("text-white w-full rounded-[50px] font-bold h-[calc(1rem*(44/16))]")}
          onClick={() => handleOpenChange(false, 'confirm')}
          
        >
          {t('futuresDetails.common.confirm')}
        </Button>
      </div>
      </div>
      </DialogContent>
    </Dialog>
  )
}
export {
  WithdrawConfirmModal
}
