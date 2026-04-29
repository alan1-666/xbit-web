import { OverviewAccountCard } from '@pages/assets/overview/components/OverviewAccountCard.tsx'

export interface MemeAccountCardProps {
  balance: number
  changeAmount?: number
  hideBalance?: boolean
  unrealizedPnl?: number
}

export const MemeAccountCard = (props: MemeAccountCardProps) => {
  const { balance, changeAmount, hideBalance, unrealizedPnl } = props
  return (
    <OverviewAccountCard
      accountName="Meme"
      balance={balance}
      totalPnl={changeAmount ?? 0}
      unrealizedPnl={unrealizedPnl ?? 0}
      hideBalance={hideBalance}
    />
  )
}
