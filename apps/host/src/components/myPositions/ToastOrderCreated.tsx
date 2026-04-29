import { useEffect } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/utils/helpers.ts'

interface ToastOrderCreatedProps {
  data: any,
  showModal: boolean
  setShowModal: (show: boolean) => void
  text: string
  symbol: string
}

const ToastOrderCreated = ({
  data,
  setShowModal,
  showModal,
  text,
  symbol
}: ToastOrderCreatedProps) => {
  const { t } = useTranslation()

  const handeRenderValue = (value?: string, suffix: string ="", prefix: string = "") => {
    if (!value || value === "--" || value === "0" || value === "0.00" || value === "-0.00" || !isFinite(parseFloat(value))) {
      return '--'
    }
    return `${prefix}${value}${suffix}`
  }

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
          overlayClassName="!bg-transparent"
          className="p-2 rounded-[8px] border-[#ECECED1F] bg-[#27272A] border w-[351px] px-4 top-4 translate-y-[-10%]"
          showDialogPrimitiveClose={false}
        >
          <DialogTitle className="w-full text-sm font-medium gap-2 flex items-center justify-between">
            <div>{text}</div>
            <X className="w-5 h-5 cursor-pointer" onClick={() => setShowModal(false)} />
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center justify-between flex-wrap mt-3">
              <div className="flex items-center app-font-regular text-[calc(1rem*(12/16))] leading-4">
                <span className="text-[#FFFFFF99]">
                  {t("detail.myPositions.type")}:
                </span>
                <span className="text-[#FFFFFF] ml-1">
                  {data?.type ?? ""}
                </span>
              </div>
              <div className="flex items-center app-font-regular text-[calc(1rem*(12/16))] leading-4">
                <span className="text-[#FFFFFF99]">
                  {t("detail.myPositions.commissionAmount")}:
                </span>
                <span className="text-[#FFFFFF] ml-1">
                  {handeRenderValue(data?.baseAmount, symbol)}
                </span>
              </div>
              <div className="flex items-center app-font-regular text-[calc(1rem*(12/16))] leading-4">
                <span className="text-[#FFFFFF99]">
                  {t("detail.myPositions.transactionValue")}:
                </span>
                <span className="text-[#FFFFFF] ml-1">
                  {`${formatMoney(data?.baseAmount * data?.limitPrice)}`}
                </span>
              </div>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ToastOrderCreated
