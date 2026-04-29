import { LoadingSpinnerGradient } from '@/components/ui/loading-spinner.tsx'
import { TransferStatus } from '@/types/enums.ts'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import { IconCheckCircleSolidWithoutGradient, IconDangerCircleSolidWithoutGradient } from '@components/icon'
import { useTranslation } from 'react-i18next'
import { getDrawerTitleSuccess, getDrawerTitlePending, getDrawerTitleFail } from './drawerTitleHelpers'

type Props = {
  recordUpdated: FundingRecord | null
  record: FundingRecord
}

export const RecordStatus = ({ recordUpdated, record }: Props) => {
  const { t } = useTranslation()

  if (recordUpdated?.depositStatus && recordUpdated?.depositStatus !== TransferStatus.Success) {
    switch (recordUpdated?.depositStatus) {
      case TransferStatus.Failed:
        return (
          <div className="flex items-center text-[16px] gap-1 text-[#F23F58]">
            <IconDangerCircleSolidWithoutGradient />
            <span>{getDrawerTitleFail(t, record)}</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center text-[16px] gap-1 text-white">
            <LoadingSpinnerGradient size={20} />
            <span>{getDrawerTitlePending(t, record)}</span>
          </div>
        )
    }
  } else {
    switch (recordUpdated?.status) {
      case TransferStatus.Success:
        return (
          <div className="flex items-center text-[16px] gap-1 text-[#00D18A]">
            <IconCheckCircleSolidWithoutGradient />
            <span>{getDrawerTitleSuccess(t, record)}</span>
          </div>
        )
      case TransferStatus.Failed:
        return (
          <div className="flex items-center text-[16px] gap-1 text-[#F23F58]">
            <IconDangerCircleSolidWithoutGradient />
            <span>{getDrawerTitleFail(t, record)}</span>
          </div>
        )
      case TransferStatus.Confirmed:
      case TransferStatus.Processed:
        return (
          <div className="flex items-center text-[16px] gap-1 text-white">
            <LoadingSpinnerGradient size={20} />
            <span>{t('assets.transfers.transactionConfirmed')}</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center text-[16px] gap-1 text-white">
            <LoadingSpinnerGradient size={20} />
            <span>{getDrawerTitlePending(t, record)}</span>
          </div>
        )
    }
  }
}
