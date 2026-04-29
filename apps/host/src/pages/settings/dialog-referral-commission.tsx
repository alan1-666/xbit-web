import { IconWalletMoney } from '@/components/icon'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import NodeAgent from '../agent'
import { cn } from '@/lib/utils'

const DialogReferralCommission = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center px-1 hover:bg-neutral-800 transition-colors w-full group duration-0 gap-3 h-[36px] rounded-[4px]">
          <IconWalletMoney className="text-white" />
          <span className="text-[14px] font-medium">{t('nodeAgent.referralCommission')}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="px-0 py-2 w-full max-w-[660px]" showDialogPrimitiveClose={false}>
        <div className="w-full flex flex-col">
          <div className="flex items-center justify-between py-3 border-b">
            <div className="w-[70px]"></div>
            <div className={cn('text-lg font-normal text-center flex-1')}>{t('nodeAgent.title')}</div>
            <div className="w-[70px] justify-end flex pr-3">
              <img
                src={'/images/icons/close.svg'}
                alt="icon close"
                className="size-[16px] cursor-pointer"
                onClick={() => {
                  setOpen(false)
                }}
              />
            </div>
          </div>
        </div>
        <NodeAgent />
      </DialogContent>
    </Dialog>
  )
}

export default DialogReferralCommission
