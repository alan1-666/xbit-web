import { MaintenanceStatus } from '@/@generated/gql/graphql-meme2'
import { MaintenanceCalculatedState } from '@/types/maintenance'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
export const calculateMaintenanceStatus = (
  maintenanceData: MaintenanceStatus | undefined,
): MaintenanceCalculatedState => {
  if (!maintenanceData) {
    return {
      shouldShowNotification: false,
      shouldRedirectToMaintenance: false,
      fromTime: new Date(0).getTime(),
      toTime: new Date(0).getTime(),
      isInWarningPeriod: false,
      isInMaintenancePeriod: false,
      isInCriticalWarningPeriod: false,
    }
  }

  const now = new Date().getTime()
  const fromTime = new Date(maintenanceData.from).getTime()
  const toTime = new Date(maintenanceData.to).getTime()
  const warningTime = maintenanceData.warningAt ? new Date(maintenanceData.warningAt).getTime() : null
  const isInWarningPeriod = warningTime ? now >= warningTime && now < fromTime : false
  const criticalWarningTime = fromTime - 5 * 60 * 1000
  const isInMaintenancePeriod = fromTime && toTime ? now >= fromTime && now < toTime : false
  const isInCriticalWarningPeriod = now >= criticalWarningTime && now < fromTime
  const shouldShowNotification = maintenanceData.isMaintainSchedule && isInWarningPeriod
  const shouldRedirectToMaintenance = maintenanceData.isMaintainSchedule && isInMaintenancePeriod

  return {
    shouldShowNotification,
    shouldRedirectToMaintenance,
    fromTime,
    toTime,
    isInWarningPeriod,
    isInMaintenancePeriod,
    isInCriticalWarningPeriod,
  }
}

export const formatTime = {
  formatDateTime: (timestamp: number) => dayjs(timestamp).format('MM/DD HH:mm'),
  formatFullDateTime: (timestamp: number) => dayjs(timestamp).format('YYYY/MM/DD HH:mm:ss'),
  formatCountdown: (milliseconds: number): string => {
    const { t } = useTranslation()
    const totalSeconds = Math.floor(milliseconds / 1000)
    const days = Math.floor(totalSeconds / (24 * 3600))
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const dayLabel = t('const.time.d')
    const hourLabel = t('const.time.h')
    const minuteLabel = t('const.time.m')
    const secondLabel = t('const.time.s')

    if (days > 0) {
      return `${days}${dayLabel} ${hours}${hourLabel} ${minutes}${minuteLabel} ${seconds}${secondLabel}`
    } else if (hours > 0) {
      return `${hours}${hourLabel} ${minutes}${minuteLabel} ${seconds}${secondLabel}`
    } else {
      return `${minutes}${minuteLabel} ${seconds}${secondLabel}`
    }
  },
}
