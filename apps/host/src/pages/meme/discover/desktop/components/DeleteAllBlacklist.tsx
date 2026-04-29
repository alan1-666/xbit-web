import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog.tsx'
import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import { IconInfo } from '@components/icon/stroke/iconInfo.tsx'
import { useState } from 'react'

export interface DeleteAllBlacklistProps {
  onDeleteAll?: () => void
}

export const DeleteAllBlacklist = (props: DeleteAllBlacklistProps) => {
  const { onDeleteAll } = props
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const handleDeleteAll = () => {
    if (onDeleteAll) {
      onDeleteAll()
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant="ghost"
          className="text-[#E14650] rounded-full px-0 h-9 hover:text-[#E14650] hover:bg-transparent"
        >
          {t('listCoin.blacklist.deleteAll')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[360px] p-4 border border-[#6A2AE04D] bg-[#232329]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconInfo className="size-6 text-white" />
            <span className="font-[380] text-[calc(18rem/16)] leading-4.5">{t('listCoin.blacklist.deleteAllTitle')}</span>
          </DialogTitle>
        </DialogHeader>
        <p className="pb-3 text-[calc(15rem/16)] font-[320] text-white/70">
          {t('listCoin.blacklist.deleteAllMessage')}
        </p>
        <DialogFooter className="pt-3.5 flex">
          <Button
            variant="secondary"
            className="rounded-full h-9 bg-[#ECECED1F] hover:bg-[#ECECED14] flex-1"
            onClick={() => setOpen(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="gradient" className="w-fit rounded-full h-9 flex-1" onClick={handleDeleteAll}>
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
