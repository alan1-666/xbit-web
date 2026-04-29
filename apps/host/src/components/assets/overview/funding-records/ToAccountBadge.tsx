import { FundingType } from '@/types/enums.ts'
import { FundingRecord } from '../TabFundingRecords'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export interface ToAccountBadgeProps {
  record: FundingRecord
}

export const ToAccountBadge = (props: ToAccountBadgeProps) => {
  const { record } = props
  const { t } = useTranslation()
  const accountLabel = useMemo(() => {
    switch (record.type) {
      case FundingType.Deposit:
        return t('assets.fundingAccount')
      case FundingType.DepositPredictExternal:
        return t('assets.transfers.predictionAccount')
      default:
        return t('assets.transfers.contractAccount')
    }
  }, [record.type, t])
  return (
    <div className="inline-block">
      <div className="bg-[#ECECED0F] text-white/70 px-2 py-1 rounded-sm text-[11px] font-[330] flex items-center gap-[4.5px]">
        <img src="/images/icons/active-dot.svg" alt="active-dot" className="size-1" />
        <span>{accountLabel}</span>
      </div>
    </div>
  )
}
