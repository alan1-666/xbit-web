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
import { useState, memo, FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Text from '../common/Text'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

type XTooltipProps = {
  /** Title of the tooltip */
  title?: string | ReactNode
  /** Description of the tooltip */
  description: string | string[]
  /** className of the tooltip */
  className?: string
  descriptionClassName?: string
  /** Text of the button close */
  btnClose?: string
  /** icon of the tooltip */
  icon?: ReactNode
}

const XTooltip: FC<XTooltipProps> & { Details: FC<XTooltipDetailsProps> } = ({ title, description, className, btnClose, icon, descriptionClassName }) => {
  const [open, setOpen] = useState(false)
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()

  return (
    <>
      <div
        className={cn("cursor-pointer ml-1 flex items-center", className)}
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        {icon ? icon : <img src="/images/orderSetting/icon-info.svg" className="w-[16px] min-w-[16px]" alt="" />}
      </div>

      {
        isDesktop ?
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                {title && <DialogTitle className="mt-1.5">
                  {title}
                </DialogTitle>}
              </DialogHeader>
              <DialogDescription>
                {Array.isArray(description) ? description.map((item, index) => <Text key={index} text={item} fontWeight="light" color="#FFFFFFCC" fontSize={14} className={descriptionClassName} />) : <Text text={description} fontWeight="light" color="#FFFFFFCC" fontSize={14} className={descriptionClassName} />}
              </DialogDescription>
            </DialogContent>
          </Dialog>
          :
          <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
            <DrawerContent className="w-full bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto">
              <DrawerHeader>
                {title && <DrawerTitle className="mt-1.5">
                  <div className="text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left">
                    {title}
                  </div>
                </DrawerTitle>}

                <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="size-5" />
                </DrawerClose>
              </DrawerHeader>

              <DrawerDescription className="flex flex-col px-4 gap-[12px]">
                {Array.isArray(description) ? description.map((item, index) => <Text key={index} text={item} fontWeight="light" color="#FFFFFFCC" fontSize={14} className={descriptionClassName} />) : <Text text={description} fontWeight="light" color="#FFFFFFCC" fontSize={14} className={descriptionClassName  } />}
              </DrawerDescription>

              <DrawerFooter className="pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
                <div className="flex justify-center items-center flex-row gap-2.5 pt-4 ">
                  <Button
                    size="lg"
                    variant="gradient"
                    className="text-[#261236] flex-1 rounded-[50px] h-11"
                    onClick={() => setOpen(false)}
                  >
                    {btnClose ? btnClose : t('assets.deposite.agree')}
                  </Button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
      }
    </>
  )
};

type XTooltipDetailsProps = {
  /**
   * Title of the tooltip, while hover on title, the tooltip will be displayed
   */
  title: ReactNode,
  /**
   * Children of the tooltip, children will be displayed in the tooltip
   */
  children: ReactNode
}

const XTooltipDetails: FC<XTooltipDetailsProps> = ({ children, title }) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger>{title}</TooltipTrigger>
        <TooltipContent>
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

  )
}

XTooltip.Details = XTooltipDetails;

export default XTooltip
