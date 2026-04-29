import SwapInfor from '../components/SwapInfor'
import WalletCard from '../components/WalletCard'
import { FundingRecord } from '@/components/assets/overview/TabFundingRecords'
interface SwapStatusProps {
  record: FundingRecord
  recordUpdated?: FundingRecord | null
}

const SwapStatus: React.FC<SwapStatusProps> = ({ record, recordUpdated }) => {
  let toAmount = record?.depositAmount ? record?.depositAmount : record.toAmount
  if (record.token === record.toToken && !toAmount) {
    toAmount = Number(record.amount) - Number(record.fee)
  }
  return (
    <div className="mt-3 space-y-2">
      <WalletCard
        isFrom={true}
        amount={record.amount}
        walletAddress={record.from}
        tokenAddress={record.token}
        chainId={record?.chainId}
      />
      <WalletCard
        isFrom={false}
        amount={toAmount ? toAmount.toString() : '--'}
        walletAddress={record?.depositAddress ? record?.depositAddress : record.to}
        tokenAddress={record.toToken}
        chainId={record?.depositChainId ? record?.depositChainId : record?.toChainId}
      />
      <SwapInfor record={record} recordUpdated={recordUpdated} />
    </div>
  )
}

export default SwapStatus
