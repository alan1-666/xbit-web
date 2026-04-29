import { IconGlobalStroke } from '@/components/icon'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import eventBus from '@/lib/eventBus'
import { EVENT_MESSAGE_CHANGE_LAYOUT } from '../detail/layout'
import { LayoutTemplate } from 'lucide-react'

const DialogLayoutSettings = () => {
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation()

  const onResetLayout = () => {
    eventBus.dispatch(EVENT_MESSAGE_CHANGE_LAYOUT, {
      data: 'reset',
    })
    // localStorage.removeItem('new-meme-grid-layout')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center px-2 hover:bg-neutral-800 transition-colors w-full group duration-0 gap-3 h-[36px] rounded-[4px]" aria-label="Change Layout">
          <LayoutTemplate size={16} />
        </button>
      </DialogTrigger>
      <DialogContent className="px-0 py-2" showDialogPrimitiveClose={false}>
        <div className="flex flex-col px-3">
          <div className="flex items-center justify-between py-3 border-b">
            <div className="w-[70px]"></div>
            <div className={cn('text-lg font-normal text-center flex-1')}>{t('appSettings.layoutSettings')}</div>
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
          <img src="/images/tokenDetail/PC/img-default-new-layout.webp" className="w-full mt-4" alt="" />
          <button
            className="h-[40px] my-4 bg-[#2b2b33] text-white text-[calc(1rem*(13/16))] leading-[2.5] font-[450]  mx-6 tracking-[calc(1rem*(0.5/16))] rounded-[50px] whitespace-nowrap"
            onClick={() => {
              onResetLayout()
            }}
          >
            <span className="">{t('appSettings.resetLayout')}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogLayoutSettings
