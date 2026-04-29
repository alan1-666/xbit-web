import { Dispatch, SetStateAction, useState } from 'react'
import TransactionTypeFilter from './TransactionTypeFilter'
import FollowedSmartMoney from './FollowedSmartMoney'
import TransactionAmountFilter from './TransactionAmountFilter'
import { SmartMoneyFilterType } from '@/types/monitoring.ts'

interface SmartMoneyFilterProps {
  setFilter: Dispatch<SetStateAction<SmartMoneyFilterType>>
  listFollowing: string[]
}

const SmartMoneyFilter = ({ setFilter, listFollowing }: SmartMoneyFilterProps) => {
  const [openTransactionFilter, setOpenTransactionFilter] = useState(false)
  const [openFollowedSM, setOpenFollowedSM] = useState(false)
  const [openTransactionAmountFilter, setOpenTransactionAmountFilter] = useState(false)

  return (
    <div className="flex items-center justify-between gap-2 overflow-auto no-scrollbar w-full">
      <div className="flex items-center gap-2 w-full">
        <FollowedSmartMoney open={openFollowedSM} setOpen={setOpenFollowedSM} setFilter={setFilter} listFollowing={listFollowing} />
        <TransactionTypeFilter
          open={openTransactionFilter}
          setOpen={setOpenTransactionFilter}
          onChange={(value) => setFilter((prev) => ({ ...prev, transactionType: value }))}
        />
        <TransactionAmountFilter
          open={openTransactionAmountFilter}
          setOpen={setOpenTransactionAmountFilter}
          onChange={(value: number | undefined) => setFilter((prev) => ({ ...prev, minAmountUsd: value }))}
        />
      </div>
    </div>
  )
}

export default SmartMoneyFilter
