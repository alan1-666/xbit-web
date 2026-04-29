import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface CloseAllProps {
  onClickCloseAll: () => void
  disabled: boolean
  title: string
  cancelAllConfirm: string
}

const CloseAllBtn = ({ onClickCloseAll, disabled, title, cancelAllConfirm }: CloseAllProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    onClickCloseAll()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={'ghost'}
          className="p-0 text-[#FFFFFF] text-[calc(12rem/16)] h-[calc(12rem/16)] "
          disabled={disabled}
        >
          {/* {t('futuresDetails.common.closeAll')} */}
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        className="w-[335px] bg-[#232329] rounded-2xl p-5"
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            <p className="text-[calc(18rem/16)] py-3">{cancelAllConfirm}</p>
          </DialogTitle>
          <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
            <Button variant="greyDefault" className="flex-1 rounded-[50px]" onClick={() => setOpen(false)}>
              {t('futuresDetails.common.cancel')}
            </Button>
            <Button variant="purpleDefault" className="text-white flex-1 rounded-[50px]" onClick={handleConfirm}>
              {t('futuresDetails.common.confirm')}
            </Button>
          </div>
        </DialogHeader>
        {/* <DialogDescription /> */}
      </DialogContent>
    </Dialog>
  )
}

export default CloseAllBtn
