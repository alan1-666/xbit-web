import { useMaintenance } from '@/hooks/useMaintenance'
import { Navigate } from 'react-router-dom'
import MaintenancePage from '@/pages/maintenance'

export const MaintenanceGuard = () => {
  const { shouldRedirectToMaintenance, isLoading } = useMaintenance()

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    )
  }

  if (!shouldRedirectToMaintenance) {
    return <Navigate to="/" replace />
  }

  return <MaintenancePage />
}
