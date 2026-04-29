import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import { FundingType } from '@/types/enums.ts'
import {
  isDepositRecord,
  isTransferRecord,
  isWithdrawRecord,
} from '@components/assets/overview/funding-records/utils.ts'
import { DepositWithdrawAmount } from '@components/assets/overview/funding-records/DepositWithdrawAmount.tsx'
import { TransferRecordAmount } from '@components/assets/overview/funding-records/TransferRecordAmount.tsx'

export interface FundingRecordAmountProps {
  record: FundingRecord
}
export const FundingRecordAmount = (props: FundingRecordAmountProps) => {
  const { record } = props
  const type = record.type as FundingType
  if (isDepositRecord(type) || isWithdrawRecord(type)) {
    return <DepositWithdrawAmount record={record} />
  }
  if (isTransferRecord(type)) {
    return <TransferRecordAmount record={record} />
  }
  return null
}
