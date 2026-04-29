import { TransferStatus } from '@/types/enums.ts'
import { formatAmount } from '@/lib/format.ts'
import { getUnit } from '@components/assets/overview/funding-records/utils.ts'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import { useMemo } from 'react'

export interface TransferRecordAmountProps {
  record: FundingRecord
}

export const TransferRecordAmount = (props: TransferRecordAmountProps) => {
  const { record } = props
  const toAmount = useMemo(() => {
    const amount = record?.depositAmount ? record?.depositAmount : record.toAmount
    if (amount) return amount
    if (record.token === record.toToken) {
      return Number(record.amount) - Number(record.fee)
    }
    return amount
  }, [record])

  return (
    <>
      <div
        className={`text-[12px] leading-2.5 font-[330 ${
          record.status === TransferStatus.Success ? 'text-white/70' : 'text-white/36'
        }`}
      >
        {record.status !== TransferStatus.Failed && '-'}
        {formatAmount(record.amount, {
          unit: getUnit(record?.token, record.chainId),
        })}
      </div>
      <div
        className={`mt-1.5 text-[14px] leading-none font-[450] ${
          record.status === TransferStatus.Success ? 'text-[#00FFB4]' : 'text-white/50'
        }`}
      >
        {record.status !== TransferStatus.Failed && '+'}
        {formatAmount(toAmount, {
          unit: getUnit(record?.toToken, record.toChainId),
        })}
      </div>
    </>
  )
}
