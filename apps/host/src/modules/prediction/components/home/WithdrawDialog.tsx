import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState, ReactNode } from 'react'
import { WithdrawForm } from '@/modules/prediction/components/portfolio/WithdrawForm.tsx'

interface WithdrawDialogProps {
  children?: ReactNode
}

export const WithdrawDialog = ({ children }: WithdrawDialogProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>
        <WithdrawForm />
      </DialogContent>
    </Dialog>
  )
}
