import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'

interface ToastOrderCreatedProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
  text: string
}

const ToastError = ({ setShowModal, showModal, text }: ToastOrderCreatedProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    if (!showModal) return
    // Automatically close the modal after 2 seconds
    const timer = setTimeout(() => {
      setShowModal(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [showModal, setShowModal])

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          overlayClassName="bg-transparent"
          className="px-3 py-4  rounded-[8px] border-[#ECECED1F] bg-[#27272A] border w-[351px] top-4 translate-y-[-10%]"
          showDialogPrimitiveClose={false}
        >
          <DialogTitle>
            <div className="flex items-center gap-2 app-font-regular text-[calc(1rem*(12/16))] leading-4 text-white">
              <img src="/images/icons/icon-error.svg" alt="icon error" />
              <span>{t("orderForm.errors.toastCreatOrderErrorTitle")}:</span>
              <span>{text}</span>
            </div>
          </DialogTitle>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ToastError
