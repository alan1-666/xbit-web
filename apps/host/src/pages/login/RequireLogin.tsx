import React, { useEffect, useState } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { APP_PATH } from '@/lib/constant'

export default function RequireLogin({ children }: { children: React.ReactNode }) {
  const activeWallet = useSelector(_activeWallet)
  const isConnected = !!activeWallet?.isConnected
  const [inviteCode, setInviteCode] = useState<string>('')
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const hasNrl = searchParams.has('nrl')
  useEffect(() => {
    const fullpath = location.pathname + location.search
    const match = fullpath.match(/\/@(\w+)$/)
    if (match) {
      const inviteCode = match[1]
      setInviteCode(inviteCode)
    }
  }, [location])

  // if (!isConnected && location.pathname !== APP_PATH.LOGIN && !location.pathname.includes('webview')) {
  //   return <Navigate to={`${APP_PATH.LOGIN}?${inviteCode}`} replace state={{ from: location }} />
  // }

  return <>{children}</>
}
