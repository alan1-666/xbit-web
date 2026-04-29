import { Dialog, DialogContent,DialogTitle } from '@/components/ui/dialog'
import { APP_PATH } from '@/lib/constant'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import InviteFriends from '.'

interface DialogInviteFriendsProps {
  open: boolean
  setOpen: (value: boolean) => void
}

const DialogInviteFriends = ({ open, setOpen }: DialogInviteFriendsProps) => {
  const { t } = useTranslation()
  const origin = window.location.origin; 

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTitle></DialogTitle>
      <DialogContent
        className="p-0  w-full max-w-[440px] h-full h-[582px] flex flex-col _hidescrollbar gap-0"
        showDialogPrimitiveClose={false}
      >
        <div className="w-full flex flex-col">
          <div className="flex items-center justify-between py-3 border-b">
            <div className={cn('text-lg font-normal text-left flex-1 pl-4')}>{t('inviteFriends.title')}</div>
            <div className="w-[70px] justify-end flex pr-3">
              <img
                src={'/images/icons/close.svg'}
                alt="icon close"
                className="size-[16px] cursor-pointer"
                onClick={() => {
                  setOpen(false)
                }}
              />
            </div>
          </div>
        </div>
        <InviteFriends hiddenHeader setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}

export default DialogInviteFriends
