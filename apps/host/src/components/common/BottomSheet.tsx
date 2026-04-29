import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { cn } from '@/lib/utils'
import { Drawer, DrawerContent, DrawerHeader } from '@components/ui/drawer.tsx'
import { DialogTitle } from '@radix-ui/react-dialog'
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  title?: string
  children?: React.ReactNode
  className?: string
  classNameDrawerHeader?: string
  classNameTitleHeader?: string
  hiddenBgImg?: boolean
  repositionInputs?: boolean
}

const BottomSheet = ({
  open,
  setOpen,
  title,
  children,
  className,
  classNameDrawerHeader,
  classNameTitleHeader,
  repositionInputs = true,
}: Props) => {
  const { isDesktop } = useResponsive()

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn('w-[768px] bg-[#232329] rounded-2xl px-0 pt-3', className)}
          showDialogPrimitiveClose={false}
        >
          <DialogHeader className={cn('relative px-3 flex w-full items-center justify-between', classNameDrawerHeader)}>
            {title && (
              <DialogTitle>
                <div className={cn('text-[18px] font-[500] text-white', classNameTitleHeader)}>{title}</div>
              </DialogTitle>
            )}
            <img
              src="/images/icons/icon-x.svg"
              className="absolute right-2 top-0 w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt="close"
            />
          </DialogHeader>
          {children && <div className="px-3 pb-3 w-full">{children}</div>}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} repositionInputs={repositionInputs}>
      <DrawerContent
        className={cn('w-full max-w-[768px] mx-auto bg-cover bg-center bg-no-repeat bg-[#232329]', className)}
      >
        <DrawerHeader className={cn('relative px-3 flex w-full items-center justify-between', classNameDrawerHeader)}>
          {title && (
            <DialogTitle>
              <div className="text-[18px] font-[500] text-white">{title}</div>
            </DialogTitle>
          )}
          <img
            src="/images/icons/icon-x.svg"
            className="absolute right-2 top-3 w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt="close"
          />
        </DrawerHeader>
        {children && <div className="px-3 pb-3 w-full">{children}</div>}
      </DrawerContent>
    </Drawer>
  )
}

export default BottomSheet
