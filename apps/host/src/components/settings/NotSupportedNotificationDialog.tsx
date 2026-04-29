import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog.tsx'
import { Button } from '@components/ui/button.tsx'

export interface NotSupportedNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NotSupportedNotificationDialog = (props: NotSupportedNotificationDialogProps) => {
  const { open, onOpenChange } = props
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[335px] bg-[#232329] rounded-2xl p-5 mx-auto">
        <DialogTitle className="flex items-center gap-2">
          <img src="/images/icons/settings/ic-info.svg" alt="" className="size-5" />
          {t('appSettings.notifications.browserNotSupported')}
        </DialogTitle>
        <div className="">
          <div className="flex-1 text-[calc(14rem/16)] leading-4.5">
            {t('appSettings.notifications.browserNotSupportedMessage')}
          </div>
        </div>
        <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
          <Button
            variant="gradient"
            className="text-[#261236] flex-1 rounded-[50px]"
            onClick={() => onOpenChange(false)}
          >
            {t('toast.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
