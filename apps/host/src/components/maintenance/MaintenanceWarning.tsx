import { useTranslation } from 'react-i18next'
import { useMaintenance } from '@/hooks/useMaintenance'
import { MaintenanceTimer } from './MaintenanceTimer'
import { useResponsive } from '@/hooks/useResponsive'
import { useMemo } from 'react'

export const MaintenanceWarning = () => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const { isInCriticalWarningPeriod, maintenanceStart, shouldShowNotification } = useMaintenance()

  const shouldShow = useMemo(() => {
    if (!shouldShowNotification) {
      return false
    }

    if (!isInCriticalWarningPeriod) {
      return false
    }

    return true
  }, [shouldShowNotification, isInCriticalWarningPeriod])

  if (!shouldShow) return null

  return (
    <div className="relative w-full flex items-center justify-center bg-fall px-3 py-2 text-xs text-primary">
      <div className={`flex items-center justify-center text-center gap-1 ${isDesktop ? 'flex-row' : 'flex-col'}`}>
        <span className="font-medium">
          ⚠️ {isDesktop ? t('maintenance.warning.message') : t('maintenance.warning.mobileshort')}
        </span>
        {!isDesktop && <span>{t('maintenance.message.fundsafe')}</span>}
        <MaintenanceTimer timestamp={maintenanceStart} variant="warning" />
      </div>
    </div>
  )
}
