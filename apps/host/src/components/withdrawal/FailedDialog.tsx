import { Dialog, DialogContent } from '@/components/ui/dialog'
import { IconErrorX } from '@/components/icon'
import { useTranslation } from 'react-i18next'

interface FailedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FailedDialog = ({ open, onOpenChange }: FailedDialogProps) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-gradient-to-br from-[#23212C] to-[#212D2F] rounded-xl p-0 py-[23px] border-none max-w-xs" 
        showDialogPrimitiveClose={false}
      >
        <div className="px-6 py-3 flex flex-col items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
            <IconErrorX />
          </div>
          <span className="text-white">{t('withdrawal.modal.failed')}</span>
          <span className="text-gray-400 text-xs">{t('withdrawal.modal.failureReason')}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FailedDialog 