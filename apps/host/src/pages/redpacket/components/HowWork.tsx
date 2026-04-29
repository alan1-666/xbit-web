import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { X } from 'lucide-react'



interface HowWorkProps {

}

const HowWork = ({ }: HowWorkProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  const [open, setOpen] = useState(false)




  const renderContent = (
    <>
      <div className="">
        <div className="w-full px-5  pb-0 b inline-flex flex-col justify-center items-center gap-4">
          <div className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="self-stretch inline-flex justify-start items-center gap-1">
              <div className="p-0.5 bg-yellow-300/10 rounded-xl inline-flex flex-col justify-center items-center gap-1">
                <div className="w-4 h-4 text-center justify-center text-yellow-400 text-xs font-semibold">1</div>
              </div>
              <div className="flex-1 opacity-60 justify-start text-white text-sm font-normal leading-4">{t('red.packet.how.it.works1')}</div>
            </div>
            <div className="self-stretch inline-flex justify-start items-center gap-2">
              <div className="p-0.5 bg-yellow-300/10 rounded-xl inline-flex flex-col justify-center items-center gap-1">
                <div className="w-4 h-4 text-center justify-center text-yellow-400 text-xs font-semibold ">2</div>
              </div>
              <div className="flex-1 opacity-60 justify-start text-white text-sm font-normal leading-4">{t('red.packet.how.it.works2')}</div>
            </div>
            <div className="self-stretch inline-flex justify-start items-center gap-2">
              <div className="p-0.5 bg-yellow-300/10 rounded-xl inline-flex flex-col justify-center items-center gap-1">
                <div className="w-4 h-4 text-center justify-center text-yellow-400 text-xs font-semibold ">3</div>
              </div>  
              <div className="flex-1 opacity-60 justify-start text-white text-sm font-normal leading-4">{t('red.packet.how.it.works3')}</div>
            </div>
            <div className="self-stretch px-3 py-2.5 bg-neutral-950 rounded-2xl flex flex-col justify-start items-start gap-2 overflow-hidden">
              <div className="self-stretch flex flex-col justify-center items-start gap-1">
                <div className="self-stretch justify-start"><span className="text-white text-sm font-normal  leading-4">{t('red.packet.how.it.works4', { hash: '...a5b36', num: '36', rank: '#37' })}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>



    </>
  )

  return (

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="opacity-60 cursor-pointer text-right justify-start text-white text-xs font-normal underline leading-4">{t('red.packet.how.it.works')}</div>
      </DialogTrigger>

      <DialogContent className="bg-[#121214] w-[85%] max-w-[400px] pt-6 px-0 rounded-2xl" showDialogPrimitiveClose={false}>
        <DialogHeader className='px-4 '>
          <div className='flex  items-center justify-between px-5'>
            <div className="self-stretch justify-start text-white text-xl font-normal leading-6">{t('red.packet.how.it.works')}</div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full text-white/60 hover:text-white/80 transition-colors z-10"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </DialogHeader>
        <div className=''>
          {renderContent}
        </div>
      </DialogContent>
    </Dialog>

  )
}

export default HowWork
