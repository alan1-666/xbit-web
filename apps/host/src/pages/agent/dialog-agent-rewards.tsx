import { Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import AgentRewards from './agent-rewards'

const DialogAgentRewards = ({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTitle></DialogTitle>
      <DialogContent
        className="p-0 w-full max-w-[660px] h-full max-h-[70vh] gap-0 flex flex-col overflow-hidden"
        showDialogPrimitiveClose={false}
      >
        <div className="w-full flex-shrink-0">
          <div className="flex items-center justify-between py-3 border-b">
            <div className={cn('text-lg font-normal text-left pl-4')}>{t('nodeAgent.agentRewards')}</div>
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
        <div className="flex-1 min-h-0 overflow-hidden">
          <AgentRewards />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogAgentRewards
