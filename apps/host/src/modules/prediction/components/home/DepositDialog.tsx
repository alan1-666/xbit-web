import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useResponsive } from '@/hooks/useResponsive'
import { useState, ReactNode } from 'react'
import { DepositForm } from '@/modules/prediction/components/home/DepositForm.tsx'

export interface DepositDialogProps {
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const DepositDialog = ({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: DepositDialogProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const { isDesktop } = useResponsive()

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const onOpenChange = isControlled ? controlledOnOpenChange : setUncontrolledOpen

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent className="sm:max-w-113.75 border border-[#79778C29] p-4 rounded-xl bg-[#212127]">
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
          </DialogHeader>
          <DepositForm />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent className="bg-[#212127] border-t border-[#79778C29] max-w-3xl mx-auto">
        <DrawerHeader>
          <DrawerTitle className="text-white">Deposit Funds</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          <DepositForm />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
