import { useWithdrawStats } from '@/modules/prediction/hooks/useWithdrawStats'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

export const PendingTransactionAlert = () => {
  const { t } = useTranslation()
  const { data: stats } = useWithdrawStats()

  const pendingCount = useMemo(() => {
    if (!stats) return 0
    const pendingStats = stats.find((stat) => stat._id === 'STATE_PENDING')
    return pendingStats?.count || 0
  }, [stats])

  // Don't show anything if no pending transactions
  if (!pendingCount) {
    return null
  }

  return (
    <div className="p-2.5 bg-linear-to-r from-[#FF454833] to-[#FF454814] rounded-[4px] flex items-center justify-between">
      <span className="text-white text-[12px]">{t('assets.withdrawal.processingCount', { count: pendingCount })}</span>
      <img className="-rotate-90 cursor-pointer" alt="" src="/images/assets/arrow-down.svg" />
    </div>
  )
}
