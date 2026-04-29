import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@components/ui/dialog.tsx'
import { Button } from '@components/ui/button.tsx'

/**
 * Props for the AppConfirm component
 * @interface AppConfirmProps
 */
interface AppConfirmProps {
  /** Dialog title text */
  title: string
  /** Optional description text or ReactNode to display in the dialog */
  description?: string | React.ReactNode
  /** Content that triggers the confirmation dialog when clicked */
  triggerContent: React.ReactNode
  /** Text for the accept/confirm button. Defaults to translation 'toast.confirm' */
  acceptText?: string
  /** Callback function executed when user confirms the action */
  onAccept?: () => void
  /** Text for the cancel button. Defaults to translation 'toast.cancel' */
  cancelText?: string
  /** Callback function executed when user cancels the action */
  onCancel?: () => void
  /** Whether to show the confirm button */
  setIsOpenConfirm?: (value: boolean) => void
}

/**
 * A confirmation dialog component that displays a modal with accept/cancel actions.
 * Used to confirm user actions before execution.
 * @param {string} title - The title text of the confirmation dialog
 * @param {string | React.ReactNode} [description] - Optional description or content
 * @param {React.ReactNode} triggerContent - Content that triggers the dialog when clicked
 * @param {string} [acceptText] - Text for the accept button (defaults to 'toast.confirm' translation)
 * @param {() => void} [onAccept] - Callback when user confirms the action
 * @param {string} [cancelText] - Text for the cancel button (defaults to 'toast.cancel' translation)
 * @param {() => void} [onCancel] - Callback when user cancels the action
 */
const AppConfirm: React.FC<AppConfirmProps> = ({
  title,
  description,
  triggerContent,
  acceptText,
  onAccept,
  cancelText,
  onCancel,
  setIsOpenConfirm,
}) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const handleOpen = () => {
    setOpen(true)
  }

  const handleAccept = () => {
    if (onAccept) onAccept()
    setOpen(false)
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    setOpen(false)
  }

  const handleOverlayClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(false)
  }

  useEffect(() => {
    if (setIsOpenConfirm) setIsOpenConfirm(open)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="static" onClick={handleOpen}>
        {triggerContent}
      </div>
      <DialogOverlay
        className="bg-black/80 opacity-[0.2]"
        onPointerDown={(event) => handleOverlayClick(event)}
        onClick={(event) => handleOverlayClick(event)}
      >
        <DialogContent
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          className="w-[335px] bg-[#232329] rounded-2xl p-5"
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              <p className="text-[18px] py-3">{title}</p>
            </DialogTitle>
            <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
              <Button variant="close" className="flex-1 rounded-[50px]" onClick={handleCancel}>
                {cancelText ?? t('toast.cancel')}
              </Button>
              <Button variant="gradient" className="text-[#261236] flex-1 rounded-[50px]" onClick={handleAccept}>
                {acceptText ?? t('toast.confirm')}
              </Button>
            </div>
          </DialogHeader>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  )
}

export default AppConfirm
