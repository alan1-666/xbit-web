import { Button } from '@components/ui/button.tsx'
import { DrawerDescription, DrawerFooter } from '@components/ui/drawer.tsx'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Text from '../common/Text'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const LimitPriceExplainedFormPC = React.memo(() => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div
            className="cursor-pointer"
            role="button"
            aria-label="Limit Price Explained"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(true)
            }}
          >
            <img src="/images/orderSetting/icon-info.svg" className="w-[16px] min-w-[16px]" alt="" />
          </div>
        </DialogTrigger>
        <DialogContent className="w-full bg-[#232329] max-w-[440px] mx-auto p-0" showDialogPrimitiveClose={false}>
          <DialogHeader className="py-4 px-4 flex w-full items-center justify-between flex-row pb-0">
            <DialogTitle className="flex items-center">
              <Text text={t('orderForm.tabs.limitOrder')} fontSize={18} fontWeight="medium" />
            </DialogTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DialogHeader>
          <DrawerDescription className="flex flex-col px-4 gap-[12px]">
            <Text
              text={t('orderForm.form.limitCommissionTelegram')}
              fontWeight="light"
              color="#FFFFFFCC"
              fontSize={14}
            />
          </DrawerDescription>
          <DrawerFooter className="pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
            <div className="pt-4 ml-auto">
              <Button
                size="lg"
                variant="gradient"
                className="text-[#261236] flex-1 rounded-[50px] h-11"
                onClick={() => setOpen(false)}
              >
                {t('assets.deposite.agree')}
              </Button>
            </div>
          </DrawerFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})

LimitPriceExplainedFormPC.displayName = 'LimitPriceExplainedFormPC'

export default LimitPriceExplainedFormPC
