import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
interface ToastCenterScreenProps {
  showModal: boolean
  text: string
  className?: string
  isToastStatus?: boolean
  isSuccess?: boolean
  isError?: boolean
  description?: string
  customIcon?: React.ReactNode
  duartion?: number

  setShowModal: (show: boolean) => void
}

const ToastCenterScreen = ({
  setShowModal,
  showModal,
  text,
  className,
  isToastStatus,
  isSuccess,
  isError,
  description,
  customIcon,
  duartion = 2000,
}: ToastCenterScreenProps) => {
  const { t } = useTranslation()
  useEffect(() => {
    if (!showModal) return
    // Automatically close the modal after 2 seconds
    const timer = setTimeout(() => {
      setShowModal(false)
    }, duartion)
    return () => clearTimeout(timer)
  }, [showModal, setShowModal])

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className={cn(
            'p-2 rounded-[8px] border-[#ECECED1F] bg-[#27272A] border w-fit px-4 flex items-center',
            className,
            isToastStatus && "bg-[url('/images/bg-drawer-gradient.png')] bg-no-repeat bg-cover border-none p-5",
          )}
          showDialogPrimitiveClose={false}
        >
          {!isToastStatus ? (
            <DialogTitle className="text-sm font-medium gap-2 flex items-center">
              {<img src="/images/icons/icon-tick-circle.svg" alt="" />}
              {text}
            </DialogTitle>
          ) : (
            <DialogTitle>
              <div className="flex items-center gap-2 app-font-regular text-[calc(1rem*(12/16))] leading-4 text-white flex-col">
                {isError && <img src={'/images/icons/icon-error.svg'} alt="icon error" className="size-7 mb-2" />}
                {isSuccess && <img src={'/images/icons/icon-success.svg'} alt="icon error" className="size-7 mb-2" />}
                {customIcon && customIcon}
                <span className="text-[calc(1rem*(16/16))] font-medium">{text}</span>
                <span className="text-[calc(1rem*(14/16))] text-[#FFFFFFCC]">{description}</span>
              </div>
            </DialogTitle>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ToastCenterScreen
