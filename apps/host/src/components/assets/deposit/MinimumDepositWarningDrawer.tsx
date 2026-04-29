import AppDrawer from '@components/common/AppDrawer.tsx'
import { Dispatch, SetStateAction } from 'react'
import { IconWarning } from '@components/icon/stroke/IconWarning.tsx'
import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export interface MinimumDepositWarningDrawerProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  isPC?: boolean
}

export const MinimumDepositWarningDrawer = (props: MinimumDepositWarningDrawerProps) => {
  const { open, setOpen, isPC } = props
  const { t } = useTranslation()

  const RenderContent = () => {
    return (
      <div className="pb-6">
        <h2 className="text-[calc(18rem/16)] font-medium mb-3">{t('assets.deposit.minimumDepositAmountTitle')}</h2>
        <p className="text-[calc(14rem/16)] text-[#FFFFFFB2]">{t('assets.deposit.minimumDepositAmountDescription')}</p>
        <Button
          variant="gradient"
          className="rounded-full w-full text-[calc(14rem/16)] mt-6 text-[#141414]"
          onClick={() => setOpen(false)}
        >
          {t('assets.deposite.agree')}
        </Button>
      </div>
    )
  }

  if (isPC) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="px-3 pt-4" showDialogPrimitiveClose={false}>
          <div className="flex justify-between items-center">
            <div className="bg-[#EC46991A] size-11 p-2.5 rounded-full">
              <IconWarning className="text-[#F23F58]" />
            </div>
            {/* <img
              src={'/images/icons/close.svg'}
              alt="icon close"
              className="size-[16px] cursor-pointer"
              onClick={() => {
                setOpen(false)
              }}
            /> */}
          </div>
          <RenderContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <AppDrawer
      setOpen={setOpen}
      isShowBgImg={false}
      open={open}
      title={
        <div className="bg-[#EC46991A] size-11 p-2.5 rounded-full">
          <IconWarning className="text-[#F23F58]" />
        </div>
      }
      drawerContent={<RenderContent />}
    />
  )
}
