export interface MaintenanceCalculatedState {
  shouldShowNotification: boolean
  shouldRedirectToMaintenance: boolean
  fromTime: number
  toTime: number
  isInWarningPeriod: boolean
  isInMaintenancePeriod: boolean
  isInCriticalWarningPeriod: boolean
}
