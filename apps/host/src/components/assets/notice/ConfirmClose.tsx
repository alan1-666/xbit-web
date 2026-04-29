import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx'
import { cn } from '@/lib/utils.ts'
import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@hooks/useResponsive.ts'

type ConfirmCloseProps = {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  content: string
  onConfirm: () => void
}

const ConfirmClose = (props: ConfirmCloseProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const { title, content, onConfirm, open, setOpen } = props

  const handleConfirm = () => {
    setOpen(false)
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn('p-6', isDesktop ? 'w-100' : 'w-80')}
        showDialogPrimitiveClose={false}
        onInteractOutside={(event) => event?.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-white leading-none">{title}</DialogTitle>

          <DialogDescription className="mt-2.5 text-[14px] font-semibold text-white leading-[1.6] text-left">
            {content}
          </DialogDescription>

          <DialogFooter className="block">
            <div className="flex items-center gap-3 mt-4.5">
              <Button
                className="text-[16px] leading-none text-white flex-1 rounded-[24.5px] h-11 bg-[#2B2B33] border-0 font-normal"
                onClick={() => setOpen(false)}
              >
                {t('button.cancel')}
              </Button>

              <Button
                variant="gradient"
                className="text-[16px] leading-none text-white flex-1 rounded-[24.5px] h-11 font-semibold"
                onClick={handleConfirm}
              >
                {t('notice.confirmSaved')}
              </Button>
            </div>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmClose
