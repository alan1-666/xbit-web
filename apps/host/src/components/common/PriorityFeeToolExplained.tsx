import { useResponsive } from '@/hooks/useResponsive'
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import Text from './Text'

const PriorityFeeToolExplained = React.memo(() => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  // if (isDesktop) {
  //   return
  // }

  return (
    <>
      <div
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <img src="/images/orderSetting/icon-info.svg" className="w-[16px] min-w-[16px]" alt="" />
      </div>

      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-full bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto p-3">
            <DialogHeader>
              <DialogTitle className="mt-1.5">
                <div className="text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left">
                  {t('tradeSettings.priorityFee')}
                </div>
              </DialogTitle>
            </DialogHeader>

            <DialogDescription className="flex flex-col gap-[12px] mt-3">
              <Text text={t('tradeSettings.priorityFeeTooltip')} fontWeight="light" color="#FFFFFFCC" fontSize={14} />
            </DialogDescription>

            <DialogFooter className="p-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
          <DrawerContent className="w-full bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto">
            <DrawerHeader>
              <DrawerTitle className="mt-1.5">
                <div className="text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left">
                  {t('tradeSettings.priorityFee')}
                </div>
              </DrawerTitle>

              <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="size-5" />
              </DrawerClose>
            </DrawerHeader>

            <DrawerDescription className="flex flex-col px-4 gap-[12px]">
              <Text text={t('tradeSettings.priorityFeeTooltip')} fontWeight="light" color="#FFFFFFCC" fontSize={14} />
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
      )}
    </>
  )
})

PriorityFeeToolExplained.displayName = 'TPSLExplained'

export default PriorityFeeToolExplained
