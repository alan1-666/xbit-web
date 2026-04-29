import { ReactNode, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog.tsx'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useResponsive } from '@/hooks/useResponsive'
import { WithdrawForm } from '@/modules/prediction/components/portfolio/WithdrawForm.tsx'

export interface USDCWithdrawDialogProps {
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const USDCWithdrawDialog = (props: USDCWithdrawDialogProps) => {
  const { children, open: controlledOpen, onOpenChange: controlledOnOpenChange } = props
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const { isDesktop } = useResponsive()

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const onOpenChange = isControlled ? controlledOnOpenChange : setUncontrolledOpen

  const ResponsiveDialog = isDesktop ? Dialog : Drawer
  const ResponsiveDialogContent = isDesktop ? DialogContent : DrawerContent
  const ResponsiveDialogHeader = isDesktop ? DialogHeader : DrawerHeader
  const ResponsiveDialogTitle = isDesktop ? DialogTitle : DrawerTitle
  const ResponsiveDialogTrigger = isDesktop ? DialogTrigger : DrawerTrigger

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent
        className={
          isDesktop
            ? 'sm:max-w-[455px] border border-[#79778C29] p-4 rounded-xl bg-[#212127]'
            : 'bg-[#212127] border-t border-[#79778C29] max-w-[768px] mx-auto p-4'
        }
      >
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="text-white">Withdraw</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="p-0">
          <WithdrawForm onSuccess={() => onOpenChange?.(false)} />
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
