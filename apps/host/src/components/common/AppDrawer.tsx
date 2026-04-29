import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@components/ui/drawer.tsx'
import { SetStateAction } from 'react'
import { cn } from '@/lib/utils.ts'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

export type AppDrawerProps = {
  open?: boolean
  setOpen: React.Dispatch<SetStateAction<boolean>>
  title?: string | React.ReactNode
  leftIcon?: React.ReactNode
  drawerContent?: React.ReactNode
  drawerFooter?: React.ReactNode
  drawerHeaderClassName?: string
  drawerBg?: React.ReactNode
  maxHeight?: string
  drawerClassName?: string
  drawerContentClassName?: string
  rightIcon?: React.ReactNode
  activeElement?: Element
  drawerContentRef?: React.RefObject<HTMLDivElement>
  isShowBgImg?: boolean
  repositionInputs?: boolean
  customTitle?: React.ReactNode
  dismissible?: boolean
  titleClassName?: string
}

const AppDrawer = ({
  open,
  setOpen,
  title,
  drawerContent,
  drawerFooter,
  drawerHeaderClassName,
  maxHeight = '80vh',
  drawerBg,
  drawerClassName,
  drawerContentClassName,
  leftIcon,
  rightIcon,
  customTitle,
  activeElement,
  drawerContentRef,
  isShowBgImg = false,
  repositionInputs = true,
  dismissible = true,
  titleClassName,
}: AppDrawerProps) => {
  const { isDesktop } = useResponsive()

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn('w-full bg-[#232329] max-w-[768px] rounded-2xl px-0 pt-3 max-h-[90vh] overflow-y-auto', drawerClassName)}
          showDialogPrimitiveClose={false}
        >
          <DialogHeader
            className={cn(
              'px-[12px] flex w-full items-center justify-between leading-[1] flex-row',
              drawerHeaderClassName,
            )}
          >
            {leftIcon}
            <DialogTitle className={cn('app-font-medium text-[calc(1rem*(18/16))] text-white', titleClassName)}>{title}</DialogTitle>
            {customTitle}
            {rightIcon ? (
              rightIcon
            ) : (
              <img
                src="/images/icons/icon-x.svg"
                className="w-6 h-6 cursor-pointer"
                onClick={() => setOpen(false)}
                alt=""
              />
            )}
          </DialogHeader>

          <div ref={drawerContentRef} className={cn('px-3 pb-3 overflow-y-auto', drawerContentClassName)}>
            {drawerContent}
          </div>

          {drawerFooter}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      dismissible={dismissible}
      repositionInputs={repositionInputs}
      onOpenChange={(val) => {
        if (!val) {
          if (activeElement) {
            return
          }
          setOpen(val)
        } else {
          setOpen(val)
        }
      }}
    >
      <DrawerContent
        className={cn(
          'w-full bg-[#212127] max-w-[768px] mx-auto focus-visible:outline-nonez-50',
          drawerClassName,
          isShowBgImg && 'bg-[url(/images/popup-bg.png)] bg-cover bg-center bg-no-repeat',
        )}
        style={{
          maxHeight: maxHeight,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {drawerBg}
        <DrawerHeader
          className={cn(
            'py-[14px] px-[12px] flex w-full items-center justify-between leading-[1]',
            drawerHeaderClassName,
          )}
        >
          {leftIcon}
          <DrawerTitle className="app-font-medium text-[calc(1rem*(18/16))] text-white leading-none">{title}</DrawerTitle>
          {customTitle}
          {rightIcon ? (
            rightIcon
          ) : (
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          )}
        </DrawerHeader>

        <div ref={drawerContentRef} className={cn('px-3 pb-3 overflow-y-auto', drawerContentClassName)}>
          {drawerContent}
        </div>

        {drawerFooter}
      </DrawerContent>
    </Drawer>
  )
}

export default AppDrawer
