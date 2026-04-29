import AppDrawer from '@components/common/AppDrawer.tsx'
import { Ref, useImperativeHandle, useState } from 'react'

export interface ConnectWalletDrawerHandle {
  open: () => void
  close: () => void
}

export interface ConnectWalletDrawerProps {
  ref: Ref<ConnectWalletDrawerHandle>
}

export const ConnectWalletDrawer = (props: ConnectWalletDrawerProps) => {
  const { ref } = props
  const [open, setOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }))

  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      drawerContent={
        <div>
          {/*<ButtonTelegram />*/}
          {/*<ButtonWallet />*/}
        </div>
      }
    />
  )
}
