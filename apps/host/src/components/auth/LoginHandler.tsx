import { useEffect, useState } from 'react'
import NewLoginDrawer from '../auth/NewLoginDrawer'
import eventBus from '@/lib/eventBus'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

export const EVENT_MESSAGE_OPEN_LOGIN = 'EVENT_MESSAGE_OPEN_LOGIN'
const LoginHandler = () => {
  const [open, setOpen] = useState(false)
  const activeWallet = useSelector(_activeWallet)

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_OPEN_LOGIN, (data: any) => {
      const isOpen = data?.data?.isOpen
      setOpen(isOpen)
    })
    return () => {
      eventBus.remove(EVENT_MESSAGE_OPEN_LOGIN)
    }
  }, [])

  if (activeWallet?.isConnected) return null
  return <NewLoginDrawer setOpen={setOpen} open={open} />
}

export default LoginHandler
