import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import { FundingType } from '@/types/enums.ts'
import { formatAmount } from '@/lib/format.ts'
import { getUnit, isDepositRecord, isWithdrawRecord } from '@components/assets/overview/funding-records/utils.ts'
import { useMemo } from 'react'
import { useTokenInfo } from '@hooks/useTokenInfo.ts'

export interface DepositWithdrawAmountProps {
  record: FundingRecord
}

export const DepositWithdrawAmount = (props: DepositWithdrawAmountProps) => {
  const { record } = props

  const { symbol: tokenSymbol } = useTokenInfo(record.token, Number(record.chainId))

  const sign = useMemo(() => {
    const type = record.type as FundingType
    if (isDepositRecord(type)) return '+'
    if (isWithdrawRecord(type)) return '-'
    return ''
  }, [record.type])

  const amount = useMemo(() => {
    const type = record.type as FundingType
    if (type === FundingType.DepositFutureExternal || type === FundingType.DepositPredictExternal) {
      return record.toAmount ?? record.amount
    }
    return record.amount
  }, [record])

  const unit = useMemo(() => {
    if (record.type === FundingType.DepositFutureExternal) {
      return 'USDC'
    }
    return getUnit(record.token, record.chainId, tokenSymbol)
  }, [record, tokenSymbol])

  return (
    <div className="text-[14px] leading-none font-[450] text-white">
      {sign}
      {formatAmount(amount, { unit })}
    </div>
  )
}
