import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import MonitoringPc from '@pages/monitoring-pc'
import { APP_PATH } from '@/lib/constant'
import { Navigate } from 'react-router-dom'

export const MonitoringPageWrapper = () => {
  const { isDesktop } = useResponsive()
  if (isDesktop) return <MonitoringPc />
  return <Navigate to={APP_PATH.MEME_SMART_MONEY + '?tab=monitoring'} />
}
