import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice.ts'
import { WalletCell } from '@components/detaiTokenTable/WalletCell.tsx'
import { useAppSelector } from '@/redux/store'
import { selectFromTokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { useContext } from 'react'
import { TradingTransactionsContext } from '@components/detaiTokenTable/TradingTransactionsContext.ts'

export interface WalletInfoCellProps {
  transaction: RealtimeTransaction
}
export const WalletInfoCell = (props: WalletInfoCellProps) => {
  const { transaction } = props
  const address = useAppSelector(selectFromTokenDetailState('address'))
  const { tokenAddress, price, walletsInfo } = useContext(TradingTransactionsContext)
  return (
    <WalletCell
      transaction={transaction}
      address={address}
      tokenAddress={tokenAddress}
      price={price}
      walletInfo={walletsInfo[transaction.maker]}
      isPc={false}
    />
  )
}
