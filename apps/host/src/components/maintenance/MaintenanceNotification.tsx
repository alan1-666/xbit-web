import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMaintenance } from '@/hooks/useMaintenance'
import { formatTime } from '@/utils/maintenance'
import { MaintenanceTimer } from './MaintenanceTimer'
import { useResponsive } from '@/hooks/useResponsive'
import { useMemo } from 'react'

export const MaintenanceNotification = () => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const {
    shouldShowNotification,
    maintenanceStart,
    maintenanceEnd,
    isInCriticalWarningPeriod,
    handleDismiss,
    isDismissed,
  } = useMaintenance()
  const formatDateTime = formatTime.formatDateTime

  const shouldShow = useMemo(() => {
    if (!shouldShowNotification) {
      return false
    }

    if (isDismissed) {
      return false
    }

    if (isInCriticalWarningPeriod) {
      return false
    }

    return true
  }, [shouldShowNotification, isDismissed, isInCriticalWarningPeriod])

  if (!shouldShow) return null

  return (
    <div className="relative w-full flex items-center justify-center bg-impartal px-3 py-2 text-xs text-primary">
      <div className={`flex items-center justify-center gap-1 ${isDesktop ? '' : 'flex-col'}`}>
        <span className="font-medium">
          🔔
          {isDesktop
            ? t('maintenance.notification.message', {
                startTime: formatDateTime(maintenanceStart),
                endTime: formatDateTime(maintenanceEnd),
              })
            : t('maintenance.notification.mobileshort', {
                time: formatDateTime(maintenanceStart),
              })}
        </span>
        {!isDesktop && <span>{t('maintenance.message.fundsafe')}</span>}
        <MaintenanceTimer timestamp={maintenanceStart} variant="notification" />
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-2 rounded-full p-1 transition-colors hover:bg-white/20"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  )
}
