import { Button } from '@components/ui/button.tsx'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@components/ui/drawer.tsx'
import { X } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Text from '../common/Text'

const TPSLExplained = React.memo(() => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <div
        className="ml-2 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
        }}
      >
        <img src="/images/orderSetting/icon-info.svg" className="w-[16px] min-w-[16px]" alt="" />
      </div>

      <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto">
          <DrawerHeader>
            <DrawerTitle className="mt-1.5">
              <div className="text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left">
                {t('orderForm.tabs.trailingStopLoss')}
              </div>
            </DrawerTitle>

            <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="size-5" />
            </DrawerClose>
          </DrawerHeader>

          <DrawerDescription className="flex flex-col px-4 gap-[12px]">
            <Text text={t('orderForm.form.supportHoldText')} fontWeight="light" color="#FFFFFFCC" fontSize={14} />
            <Text text={t('orderForm.form.supportTextListItem1')} fontWeight="light" color="#FFFFFFCC" fontSize={14} />
            <Text text={t('orderForm.form.supportTextListItem2')} fontWeight="light" color="#FFFFFFCC" fontSize={14} />
            <Text text={t('orderForm.form.supportTextListItem3')} fontWeight="light" color="#FFFFFFCC" fontSize={14} />
          </DrawerDescription>

          <DrawerFooter className="pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
            <div className="flex justify-center items-center flex-row gap-2.5 pt-4 ">
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
        </DrawerContent>
      </Drawer>
    </>
  )
})

TPSLExplained.displayName = 'TPSLExplained'

export default TPSLExplained
