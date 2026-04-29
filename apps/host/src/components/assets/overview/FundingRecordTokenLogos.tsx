import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import {
  isDepositRecord,
  isTransferRecord,
  isWithdrawRecord,
} from '@components/assets/overview/funding-records/utils.ts'
import { DepositWithdrawRecordTokenLogo } from '@components/assets/overview/funding-records/DepositWithdrawRecordTokenLogo.tsx'
import { TransferRecordTokenLogos } from '@components/assets/overview/funding-records/TransferRecordTokenLogo.tsx'
import { FundingType } from '@/types/enums.ts'

export interface FundingRecordTokenLogosProps {
  record: FundingRecord
}

export const FundingRecordTokenLogos = (props: FundingRecordTokenLogosProps) => {
  const { record } = props
  const type = record.type as FundingType
  if (isDepositRecord(type) || isWithdrawRecord(type)) {
    return <DepositWithdrawRecordTokenLogo record={record} />
  }
  if (isTransferRecord(type)) {
    return <TransferRecordTokenLogos record={record} />
  }
  return null
}
