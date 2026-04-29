import { Button } from '@components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle
} from '@components/ui/dialog.tsx'
import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Props for the AppConfirm component
 * @interface AppConfirmProps
 */
interface ConfirmProps {
  title: string
  isOpenConfirm: boolean
  onAccept?: () => void
  onCancel?: () => void
  setIsOpenConfirm: React.Dispatch<React.SetStateAction<boolean>>
}

const Confirm: React.FC<ConfirmProps> = ({
  title,
  isOpenConfirm,

  onCancel,
  onAccept,
  setIsOpenConfirm  
}) => {
  const { t } = useTranslation()

  const handleAccept = () => {
    if (onAccept) onAccept()
    setIsOpenConfirm(false)
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    setIsOpenConfirm(false)
  }

  const handleOverlayClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsOpenConfirm(false)
  }

  return (
    <Dialog open={isOpenConfirm} onOpenChange={setIsOpenConfirm}>

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
                {t('toast.cancel')}
              </Button>
              <Button variant="gradient" className="text-[#261236] flex-1 rounded-[50px]" onClick={handleAccept}>
                {t('toast.confirm')}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  )
}

export default Confirm
