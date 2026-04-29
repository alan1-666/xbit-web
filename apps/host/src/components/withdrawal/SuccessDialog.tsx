import { Dialog, DialogContent } from '@/components/ui/dialog'
import { IconSuccessCheck } from '@/components/icon'
import { useTranslation } from 'react-i18next'

interface SuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SuccessDialog = ({ open, onOpenChange }: SuccessDialogProps) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="min-w-[138px] rounded-lg bg-[#232329] border-[#ECECED1F] border-solid border-[1px] box-border inline-flex flex-row 
        items-start justify-start py-3 px-5 text-left text-[16px] text-white w-auto" 
        showDialogPrimitiveClose={false}
      >
        <div className="">
          <div className="self-stretch flex flex-row items-center justify-start gap-2.5">
            <IconSuccessCheck />
            <div className="leading-[16px]">{t('withdrawal.modal.success')}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SuccessDialog 