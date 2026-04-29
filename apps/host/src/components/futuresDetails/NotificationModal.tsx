import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'

interface NotificationModalProps {
  title: string
  showModal: boolean
  description: string
  closeTitle?: string
  confirmTitle?: string

  setShowModal: (show: boolean) => void
  onConfirmSubmit?: () => void
}

const NotificationModal = ({
  title,
  showModal,
  description,
  closeTitle = '暂不开启',
  confirmTitle = '暂不开启',
  setShowModal,
  onConfirmSubmit,
}: NotificationModalProps) => {
  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="bg-[#212127] p-5 bg-no-repeat bg-cover border border-[#6A2AE04D] rounded-2xl w-[335px]"
          showDialogPrimitiveClose={false}
        >
          <DialogTitle className="text-[18rem/16]">{title}</DialogTitle>
          <DialogDescription className="break-all">{description}</DialogDescription>
          <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
            <Button
              variant="close"
              className="flex-1 rounded-[50px]"
              onClick={() => {
                setShowModal(false)
              }}
            >
              {closeTitle}
            </Button>
            <Button
              variant="gradient"
              className="text-[#261236] flex-1 rounded-[50px]"
              onClick={() => {
                setShowModal(false)
                if (onConfirmSubmit) {
                  onConfirmSubmit()
                }
              }}
            >
              {confirmTitle}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NotificationModal
