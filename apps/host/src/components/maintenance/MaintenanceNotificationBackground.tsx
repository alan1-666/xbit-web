import { useMaintenance } from '@/hooks/useMaintenance'
import { useMemo } from 'react'

export const MaintenanceNotificationBackground = () => {
  const { shouldShowNotification, isInCriticalWarningPeriod, isDismissed } = useMaintenance()

  const shouldShow = useMemo(() => {
    if (!shouldShowNotification) {
      return false
    }

    if (!isDismissed && !isInCriticalWarningPeriod) {
      return true
    }

    if (isInCriticalWarningPeriod) {
      return true
    }

    return false
  }, [shouldShowNotification, isDismissed, isInCriticalWarningPeriod])

  if (!shouldShow) return null
  return <div className="w-full h-[32px]"></div>
}
