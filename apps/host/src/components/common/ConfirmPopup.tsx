import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogHeader } from '@components/ui/dialog.tsx'
import { DialogTitle } from '@radix-ui/react-dialog'
import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  trigger?: React.ReactNode
  title?: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
}

const ConfirmPopup = ({
  open,
  setOpen,
  trigger,
  title,
  description,
  confirmText = 'button.confirm',
  cancelText = 'button.cancel',
  onConfirm,
  onCancel,
}: Props) => {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-[#232329] border-none max-w-100">
        {title && (
          <DialogHeader className="">
            <DialogTitle>{t(title)}</DialogTitle>
          </DialogHeader>
        )}
        <div className="text-[14px] text-white leading-5">{t(description)}</div>
        <DialogFooter className="flex justify-center items-center flex-row gap-2.5">
          {cancelText && (
            <Button
              type="button"
              className="flex-1"
              onClick={() => {
                setOpen(false)
                onCancel && onCancel()
              }}
            >
              {t(cancelText)}
            </Button>
          )}

          <Button
            variant="gradient"
            className="text-[#261236] flex-1 rounded-[50px]"
            onClick={() => {
              setOpen(false)
              onConfirm()
            }}
          >
            {t(confirmText)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmPopup
