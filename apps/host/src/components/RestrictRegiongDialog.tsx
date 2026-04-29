import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Dialog, DialogContent } from './ui/dialog'

interface RestrictRegiongDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const RestrictRegiongDialog = ({ open, setOpen }: RestrictRegiongDialogProps) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open}>
      <DialogContent
        showDialogPrimitiveClose={false}
        className="max-w-[768px] mx-auto px-3 !pointer-events-none w-[90%] rounded-xl"
        overlayClassName="!pointer-events-none"
      >
        <div className="tex-center flex flex-col items-center justify-center text-[16px] text-white/80">
          <img src="/images/img_regional_restrictions.svg" className="mb-4" alt="" />
          <div className="app-font-light text-[#FFFFFFB2]">
            {t('detail.tokenDetail.featureUnavailableRegion1')}
          </div>
        </div>

        <div className="flex justify-center items-center flex-col gap-2.5 mt-4">
          <Button
            variant="close"
            className="flex-1 rounded-[50px] !pointer-events-auto bg-[#843bea] shadow-inset-purple w-[268px]"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
          >
            {t('futuresDetails.common.iKnow')}
          </Button>
          <Button
            variant="ghost"
            className="flex-1 rounded-[50px] !pointer-events-auto text-[#FFFFFF]"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
          >
            {t('listCoin.copyTrade.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RestrictRegiongDialog
