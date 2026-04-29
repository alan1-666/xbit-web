import React from 'react'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import DynamicMonitoring from './DynamicMonitoring'
import MobilePage from './MobilePage'
import { AddressGroupsProvider } from '@/providers/AddressGroupsProvider'
import { _activeWallet } from '@/redux/modules/newWallet.slice.ts'
import { Splash } from '@/components/assets/Splash'
import { useSelector } from 'react-redux'

const Supervisory: React.FC = () => {
  const { isDesktop } = useResponsive()

  const activeWallet = useSelector(_activeWallet)

  if (!activeWallet.isConnected) return <Splash />

  if (!isDesktop) return <MobilePage />

  return (
    <AddressGroupsProvider>
      <DynamicMonitoring />
    </AddressGroupsProvider>
  )
}

export default Supervisory
