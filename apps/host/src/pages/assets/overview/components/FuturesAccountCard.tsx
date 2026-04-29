import { useMemo } from 'react'
import { OverviewAccountCard } from '@pages/assets/overview/components/OverviewAccountCard.tsx'
import { useTranslation } from 'react-i18next'
import { useAvailableFuturesBalance, useFuturesPortfolio } from '@pages/assets/overview/hooks/useTotalBalance.ts'

export interface FuturesAccountCardProps {
  balance: number
  changeAmount: number
  hideBalance: boolean
}

export const FuturesAccountCard = (props: FuturesAccountCardProps) => {
  const { balance, hideBalance } = props
  const { t } = useTranslation()
  const { availableBalance: availableFund, assetPositions } = useAvailableFuturesBalance()

  const { dayData } = useFuturesPortfolio()

  const accountStats = useMemo(() => {
    const positions = assetPositions?.map((item) => item.position)
    const totalUnrealizedPnl = positions.reduce((sum: number, pos: any) => sum + Number(pos.unrealizedPnl || 0), 0)
    return {
      unrealizedPnl: totalUnrealizedPnl,
    }
  }, [assetPositions, dayData])

  return (
    <OverviewAccountCard
      accountName="Futures"
      balance={balance}
      totalPnl={availableFund ? +availableFund : 0}
      unrealizedPnl={accountStats.unrealizedPnl}
      hideBalance={hideBalance}
      overrideTotalPnlText={t('futuresAsset.labels.availableBalance')}
      totalPnlClassName="text-[#FBFBFB]"
    />
  )
}
