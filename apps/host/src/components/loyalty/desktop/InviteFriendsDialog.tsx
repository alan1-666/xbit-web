import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog.tsx'
import InviteFriendsCard from '@components/loyalty/InviteFriendsCard.tsx'
import { useTranslation } from 'react-i18next'

export interface InviteFriendsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invitationCode: string
  shareUrl: string
}

export const InviteFriendsDialog = (props: InviteFriendsDialogProps) => {
  const { t } = useTranslation()
  const { open, onOpenChange, invitationCode, shareUrl } = props
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-[#212129] gap-0">
        <DialogHeader className="border-b px-4 py-3.5">
          <DialogTitle className="font-[380] text-[calc(18rem/16)]">
            {t('nodeAgent.inviteFriends')}
          </DialogTitle>
        </DialogHeader>
        <div className="px-4 py-6">
          <InviteFriendsCard invitationCode={invitationCode} shareUrl={shareUrl} />
        </div>
      </DialogContent>
    </Dialog>
  )
}