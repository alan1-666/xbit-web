import ColumnTime from '@components/detaiTokenTable/ColumnTime.tsx'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice.ts'

export interface TimeCellProps {
  transaction: RealtimeTransaction
}

export const TimeCell = (props: TimeCellProps) => {
  const { transaction } = props
  const displayDateTimeMode = useSelector(
    (state: RootState) => (state.tokenDetail as TokenDetailState).displayDateTimeMode,
  )
  return (
    <div className="flex items-center gap-1">
      <ColumnTime
        displayDateTimeMode={displayDateTimeMode}
        timestamp={Number(transaction?.timestamp)}
        isKlineTx={transaction.isKlineTx ?? true}
        filteringReason={transaction.reasonFiltering}
      />
    </div>
  )
}
