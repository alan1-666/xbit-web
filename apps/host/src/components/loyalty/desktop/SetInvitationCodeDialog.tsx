import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog.tsx'
import CardSetInvitationCode from '../CardSetInvitationCode'
import { useTranslation } from 'react-i18next'

export interface SetInvitationCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SetInvitationCodeDialog = ({ onOpenChange, open }: SetInvitationCodeDialogProps) => {
  const { t } = useTranslation()
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-[#212129] gap-0">
        <DialogHeader className="border-b px-4 py-3.5">
          <DialogTitle className="font-[380] text-[calc(18rem/16)] flex items-center">
            {t('loyalty.InvitationCode')}
            <span className='flex items-center cursor-pointer'>
              <span className="app-font-light text-[#FFC767] text-xs pl-2">
                {t('loyalty.learnMorePointsRule')}
              </span>
              <img src="/images/loyalty/arrow-right.svg" alt="" />
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="px-4 py-6">
          <CardSetInvitationCode onOpenChange={onOpenChange} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SetInvitationCodeDialog