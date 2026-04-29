import { FundingType } from '@/types/enums.ts'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import { useTranslation } from 'react-i18next'
import { RecordStatus } from './RecordStatus'

type Props = {
  record: FundingRecord
  recordUpdated: FundingRecord | null
  isDesktop: boolean
}

const DrawerTitle = ({ record, recordUpdated, isDesktop }: Props) => {
  const { t } = useTranslation()

  if (isDesktop) {
    return (
      <div>
        {record.type === FundingType.Deposit ? t('assets.overview.deposit') : null}
        {record.type === FundingType.Withdraw ? t('assets.overview.withdrawal') : null}
        {record.type === FundingType.WithdrawFutureExternal ? t('assets.overview.withdrawal') : null}
        {record.type !== FundingType.Withdraw &&
        record.type !== FundingType.Deposit &&
        record.type !== FundingType.WithdrawFutureExternal
          ? t('assets.transfer')
          : null}
      </div>
    )
  }

  return <RecordStatus recordUpdated={recordUpdated} record={record} />
}

export default DrawerTitle
