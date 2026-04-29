import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import DataOverview from './data-overview'

const DialogDataOverview = ({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="p-0 w-full max-w-[660px] h-full max-h-[80vh] _hidescrollbar gap-0 overflow-y-auto"
        showDialogPrimitiveClose={false}
      >
        <div className="w-full">
          <div className="flex items-center justify-between py-3 border-b">
            {/* <div className="w-[70px]"></div> */}
            <div className={cn('text-lg font-normal text-left flex-1 pl-3')}>{t('nodeAgent.dataOverview')}</div>
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
        <div className="">
          <DataOverview />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogDataOverview
