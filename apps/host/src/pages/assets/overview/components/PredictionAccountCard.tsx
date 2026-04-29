import { OverviewAccountCard } from '@pages/assets/overview/components/OverviewAccountCard.tsx'
import { useTranslation } from 'react-i18next'

export interface PredictionAccountCardProps {
  balance: number
  usdcBalance: number
  hideBalance?: boolean
}

export const PredictionAccountCard = (props: PredictionAccountCardProps) => {
  const { balance, usdcBalance, hideBalance = false } = props
  const { t } = useTranslation()
  return (
    <OverviewAccountCard
      accountName={t('assets.tabs.prediction')}
      balance={balance}
      totalPnl={usdcBalance}
      unrealizedPnl={0}
      hideBalance={hideBalance}
      overrideTotalPnlText={t('futuresAsset.labels.availableBalance')}
      totalPnlClassName="text-[#FBFBFB]"
      isShowUnrealizedPnl={false}
    />
  )
}
