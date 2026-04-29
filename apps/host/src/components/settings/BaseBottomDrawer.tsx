import { ReactNode, RefObject, useImperativeHandle, useState } from 'react'
import AppDrawer, { AppDrawerProps } from '@components/common/AppDrawer.tsx'
import { cn } from '@/lib/utils.ts'

export interface BaseBottomDrawerHandle {
  open: () => void
  close: () => void
}

export interface BaseBottomDrawerProps extends Omit<AppDrawerProps, 'drawerContent' | 'setOpen' | 'open'> {
  ref?: RefObject<BaseBottomDrawerHandle | null>
  children?: ReactNode
  className?: string
}

export const BaseBottomDrawer = (props: BaseBottomDrawerProps) => {
  const { ref, children, drawerClassName, className, ...rest } = props
  const [open, setOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }))

  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      drawerClassName={cn(drawerClassName, className)}
      drawerContent={children}
      {...rest}
    />
  )
}
