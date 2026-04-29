import { useCountdown } from '@/hooks/useCountdown'
import { cn } from '@/lib/utils'
import { formatTime } from '@/utils/maintenance'

interface MaintenanceTimerProps {
  timestamp: number
  variant?: 'notification' | 'warning' | 'dialog'
  className?: string
}

export const MaintenanceTimer = ({ timestamp, variant = 'notification', className }: MaintenanceTimerProps) => {
  const { remaining } = useCountdown(timestamp)

  const variantStyles = {
    warning: 'font-bold text-[#FFA500]',
    notification: 'font-bold text-[#FFA500]',
    dialog: 'font-bold text-fall',
  }

  return <span className={cn(variantStyles[variant], className)}>⏰ {formatTime.formatCountdown(remaining)}</span>
}
