import React, { FC } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './dialog'
import { Button } from './button'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface ModalConfirmationCommonProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
  title?: string
  description?: string | string[] | React.ReactNode
  showCloseButton?: boolean
  showDialogPrimitiveClose?: boolean
}

const XModalTitle = (props: { title?: string }) => {
  const { title } = props
  return <DialogTitle className="text-[18rem/16]">{title}</DialogTitle>
}
const XModalDescription = (props: { description?: string | string[] | React.ReactNode, className?: string | undefined }) => {
  const { description, className = '' } = props
  const content = Array.isArray(description) ? description : [description]
  return (
    <DialogDescription className={cn('', className)}>
      {React.isValidElement(description)
        ? description
        : content.map((item, index) => (
            <div key={index} className="mb-2">
              {item}
            </div>
          ))}
    </DialogDescription>
  )
}

/**
 * XModal is a reusable modal component that can be used for various purposes.
 * It can display a title, description, and buttons for user interaction.
 * The modal can also be used for confirmation actions.
 *
 * @param {ModalConfirmationCommonProps} props - The properties for the modal.
 * @returns {JSX.Element} The rendered modal component.
 */

const XModal: FC<ModalConfirmationCommonProps> & {
  Confirmation: FC<ModalConfirmationProps>
  Reject: FC<ModalConfirmationCommonProps>
} = ({ showModal, setShowModal, title, description, showCloseButton = true, showDialogPrimitiveClose = true }) => {
  const { t } = useTranslation()
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent
        showDialogPrimitiveClose={showDialogPrimitiveClose}
        className="p-5 border-none rounded-2xl w-[335px] pt-7 bg-[#232329]"
      >
        {title && <XModalTitle title={title} />}
        {description && <XModalDescription description={description} />}
        {showCloseButton && (
          <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
            <Button variant="greyDefault" className="flex-1 rounded-[50px]" onClick={() => setShowModal(false)}>
              {t('toast.cancel')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface ModalConfirmationProps extends ModalConfirmationCommonProps {
  onConfirm: () => void
}
XModal.Confirmation = (props: ModalConfirmationProps) => {
  const { t } = useTranslation()
  const { showModal, setShowModal, title, description, onConfirm } = props
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="bg-[#212127] p-5 bg-no-repeat bg-cover border border-[#6A2AE04D] rounded-2xl w-[335px]">
        {title ? <DialogTitle className="text-[18rem/16]">{title}</DialogTitle> : null}
        {description ? <DialogDescription className="break-normal">{description}</DialogDescription> : null}
        <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
          <Button variant="close" onClick={() => setShowModal(false)} className="flex-1 rounded-[50px]">
            {t('toast.cancel')}
          </Button>
          <Button variant="gradient" type="button" onClick={onConfirm} className="text-[#261236] flex-1 rounded-[50px]">
            {t('toast.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

XModal.Reject = (props: ModalConfirmationCommonProps) => {
  const { showModal, setShowModal, description } = props
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent
        className="bg-[#212127] p-5 bg-no-repeat bg-cover border-none rounded-2xl w-[335px]"
        showDialogPrimitiveClose={false}
      >
        <div className="flex justify-center flex-wrap">
          <div className="flex justify-center w-full gap-1 mt-1 mb-3">
            <img className="cursor-pointer w-4 h-4" src="/images/icons/ic-close-circle.svg" alt="ic-close-circle" />
          </div>
          {description && <XModalDescription description={description} className='text-center' />}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default XModal