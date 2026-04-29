import { GeneralCard } from '@pages/assets/overview/components/GeneralCard.tsx'
import { MemeAccountCard } from '@pages/assets/overview/components/MemeAccountCard.tsx'
import { FuturesAccountCard } from '@pages/assets/overview/components/FuturesAccountCard.tsx'
import { useContext } from 'react'
import { ChartItem } from '@hooks/useAssetChart.ts'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { PredictionAccountCard } from './PredictionAccountCard'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

export interface OverviewAccountCardsProps {
  totalBalance?: number
  changeAmount?: number
  changePercentage?: number
  overviewExpandData?: ChartItem[]
  firstItem: ChartItem
  fundingBalance?: number
  fundingChange?: {
    changeAmount: number
    changePercentage: number
  }
  futuresBalance?: number
  futuresChange?: {
    changeAmount: number
    changePercentage: number
  }

  unrealizedPnlFunding?: number
}

export const OverviewAccountCards = (props: OverviewAccountCardsProps) => {
  const {
    totalBalance = 0,
    changeAmount = 0,
    changePercentage = 0,
    overviewExpandData = [],
    firstItem,
    fundingBalance = 0,
    fundingChange = { changeAmount: 0, changePercentage: 0 },
    futuresBalance = 0,
    futuresChange = { changeAmount: 0, changePercentage: 0 },
    unrealizedPnlFunding = 0,
  } = props
  const { hideBalance, toggleHideBalance, predictionBalance, predictionUsdcBalance } = useContext(AssetOverviewContext)
  const isPredictionEnabled = useFeatureIsOn('enable_prediction')

  return (
    <>
      <GeneralCard
        totalBalance={totalBalance}
        changeAmount={changeAmount}
        changePercentage={changePercentage}
        overviewExpandData={overviewExpandData}
        firstItem={firstItem}
        hideBalance={hideBalance}
        setHideBalance={toggleHideBalance}
      />
      <div className="flex items-center gap-3 w-full">
        <MemeAccountCard
          balance={fundingBalance}
          changeAmount={fundingChange.changeAmount}
          hideBalance={hideBalance}
          unrealizedPnl={unrealizedPnlFunding}
        />
        <FuturesAccountCard
          balance={futuresBalance}
          changeAmount={futuresChange.changeAmount}
          hideBalance={hideBalance}
        />
        {isPredictionEnabled && (
          <PredictionAccountCard
            balance={predictionBalance || 0}
            usdcBalance={predictionUsdcBalance || 0}
            hideBalance={hideBalance}
          />
        )}
      </div>
    </>
  )
}
