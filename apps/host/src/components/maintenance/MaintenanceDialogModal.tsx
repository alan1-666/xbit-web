import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMaintenance } from '@/hooks/useMaintenance'
import { AlertTriangle } from 'lucide-react'
import { MaintenanceTimer } from './MaintenanceTimer'
import { Button } from '@components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const MaintenanceDialogModal = () => {
  const { t } = useTranslation()
  const { isInCriticalWarningPeriod, maintenanceStart, shouldShowNotification } = useMaintenance()
  const [showModal, setShowModal] = useState(true)

  const shouldShow = useMemo(() => {
    if (!shouldShowNotification) {
      return false
    }

    if (isInCriticalWarningPeriod) {
      return true
    } else {
      return false
    }
  }, [shouldShowNotification, isInCriticalWarningPeriod])

  const handleConfirm = () => {
    setShowModal(false)
  }

  return (
    <Dialog open={showModal && shouldShow} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[425px] rounded-[16px] max-w-[300px] p-4 sm:p-5">
        <DialogHeader>
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-full bg-impartal/20 p-3">
              <AlertTriangle className="h-8 w-8 text-impartal" />
            </div>
          </div>
          <DialogTitle className="text-center text-base sm:text-xl font-bold text-primary">
            {t('maintenance.dialog.title')}
          </DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm">
            <p>{t('maintenance.dialog.message')}</p>
            <p>{t('maintenance.message.fundsafe')}</p>
          </DialogDescription>
        </DialogHeader>

        <div className="text-center py-3 ">
          <MaintenanceTimer timestamp={maintenanceStart} variant="dialog" />
        </div>

        <DialogFooter autoFocus={false}>
          <Button
            variant="gradient"
            className="rounded-full text-sm font-[450] sm:text-[16px] h-fit w-full  "
            onClick={handleConfirm}
            autoFocus={false}
          >
            {t('maintenance.dialog.button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
