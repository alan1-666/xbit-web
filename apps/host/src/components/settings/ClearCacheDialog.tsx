import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog.tsx'
import { useTranslation } from 'react-i18next'
import { Button } from '@components/ui/button.tsx'

export interface ClearCacheDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCacheCleared?: () => void
}

export const ClearCacheDialog = (props: ClearCacheDialogProps) => {
  const { open, onOpenChange, onCacheCleared } = props
  const { t } = useTranslation()

  const handleClearCache = () => {
    onCacheCleared?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[335px] bg-[#232329] rounded-2xl p-5 text-center" showDialogPrimitiveClose={false}>
        <DialogTitle>{t('appSettings.aboutUs.clearCache')}</DialogTitle>
        <p className="text-[#FFFFFFB2] text-[calc(15rem/16)]">{t('appSettings.aboutUs.clearCacheMessage')}</p>
        <div className="grid grid-cols-2 gap-2 mt-5">
          <Button variant="borderGradient" className="rounded-full" onClick={() => onOpenChange(false)}>
            {t('appSettings.aboutUs.cancel')}
          </Button>
          <Button variant="gradient" className="rounded-full text-[#141414]" onClick={handleClearCache}>
            {t('appSettings.aboutUs.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
