import { Button } from '@components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@components/ui/drawer'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'
import { useResponsive } from '@/hooks/useResponsive'
import { X } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ResponsiveTooltipDrawerProps {
  children: ReactNode // The trigger element
  content: ReactNode // The content to display
  drawerTitle?: ReactNode // Title for the Drawer (Mobile)
  drawerButtonText?: string // Button text for Drawer (Mobile)
  tooltipClassName?: string // ClassName for Tooltip content
}

export const ResponsiveTooltipDrawer = ({
  children,
  content,
  drawerTitle,
  drawerButtonText,
  tooltipClassName,
}: ResponsiveTooltipDrawerProps) => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  if (isDesktop) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger type="button" asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent className={tooltipClassName}>{content}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
      <DrawerTrigger asChild onClick={(e) => {
        e.stopPropagation()
        setOpen(true)
      }}>
        {children}
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto border-none outline-none">
        <DrawerHeader>
          <DrawerTitle className="mt-1.5 text-left">
            {drawerTitle || <div className="h-4" />} 
          </DrawerTitle>

          <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground outline-none border-none">
            <X className="size-5 text-white" />
          </DrawerClose>
        </DrawerHeader>

        <DrawerDescription className="flex flex-col px-4 gap-[12px] pb-5 text-left">
          {content}
        </DrawerDescription>

        <DrawerFooter className="pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
          <div className="flex justify-center items-center flex-row gap-2.5 pt-4 ">
            <Button
              size="lg"
              variant="gradient"
              className="text-[#261236] flex-1 rounded-[50px] h-11"
              onClick={() => setOpen(false)}
            >
              {drawerButtonText || t('assets.deposite.agree')}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
