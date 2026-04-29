import { useTranslation } from 'react-i18next'
import { useCountdown } from '@/hooks/useCountdown'
import { Wrench, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMaintenance } from '@/hooks/useMaintenance'
import { formatTime } from '@/utils/maintenance'

const MaintenancePage = () => {
  const { t } = useTranslation()
  const { maintenanceStart, maintenanceEnd } = useMaintenance()
  const { remaining: remainingTime } = useCountdown(maintenanceEnd)
  const formatDateTime = formatTime.formatFullDateTime
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient p-4">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 sm:mb-8 flex justify-center">
          <div className="rounded-full bg-impartal/20 p-6">
            <Wrench className="h-16 w-16 text-impartal" />
          </div>
        </div>

        <h1 className="mb-2 sm:mb-4 text-2xl font-bold text-primary  sm:text-5xl">{t('maintenance.title')}</h1>

        <div className="mb-4 sm:mb-8 text-sm sm:text-xl text-primary/70">
          <p className="whitespace-pre-line">{t('maintenance.description')}</p>
        </div>

        {/* Time Information */}
        <div className="mb-4 sm:mb-8 grid gap-4 grid-cols-2">
          <div className="rounded-lg bg-secondary p-4">
            <div className="mb-2 flex items-center justify-center gap-2 text-primary/50">
              <Clock className="h-5 w-5" />
              <span className="text-sm">{t('maintenance.timeInfo.start')}</span>
            </div>
            <div className="text-base sm:text-lg font-semibold text-primary">{formatDateTime(maintenanceStart)}</div>
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <div className="mb-2 flex items-center justify-center gap-2 text-primary/50">
              <Clock className="h-5 w-5" />
              <span className="text-sm">{t('maintenance.timeInfo.end')}</span>
            </div>
            <div className="text-base sm:text-lg font-semibold text-primary">{formatDateTime(maintenanceEnd)}</div>
          </div>
        </div>

        <div className="mb-4 sm:mb-8 rounded-lg bg-secondary p-3 sm:p-6">
          <div className="mb-2 text-sm text-impartal">{t('maintenance.countdown.label')}</div>
          <div className=" text-2xl sm:text-3xl font-bold text-impartal md:text-4xl ">{formatTime.formatCountdown(remainingTime)}</div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            variant="gradient"
            className="rounded-full font-[450] sm:text-[16px] h-fit w-50  "
            onClick={handleRefresh}
            autoFocus={false}
          >
            <RefreshCw className="h-4 w-4" />
            {t('maintenance.actions.refresh')}
          </Button>

          <div className="text-xs sm:text-sm text-primary/60">{t('maintenance.actions.autoRefresh')}</div>
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-12 text-xs sm:text-sm text-primary/60">{t('maintenance.footer')}</div>
      </div>
    </div>
  )
}

export default MaintenancePage
