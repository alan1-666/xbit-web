import { OverviewAccountCards } from '@pages/assets/overview/components/OverviewAccountCards.tsx'
import { PortfolioCard } from '@pages/assets/overview/components/PortfolioCard.tsx'
import { ExchangeCard } from '@pages/assets/overview/components/ExchangeCard.tsx'
import { FundingHistoryCard } from '@pages/assets/overview/components/FundingHistoryCard.tsx'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { useContext } from 'react'

export const OverviewAsset = () => {
  const {
    totalBalance,
    changeAmount,
    changePercentage,
    overviewExpandData,
    firstItem,
    fundingBalance,
    fundingChange,
    futuresChange,
    futuresBalance,
    unrealizedPnlFunding,
  } = useContext(AssetOverviewContext)

  // Fallback for firstItem if undefined
  const defaultFirstItem = {
    timestamp: 0,
    balance: 0,
    changeAmount: 0,
    changePercentage: 0,
  }

  return (
    <div className="grid grid-cols-13 2xl:grid-cols-11 gap-3">
      <div className="col-span-9 2xl:col-span-8 space-y-3">
        <OverviewAccountCards
          totalBalance={totalBalance}
          changeAmount={changeAmount}
          changePercentage={changePercentage}
          overviewExpandData={overviewExpandData}
          firstItem={firstItem || defaultFirstItem}
          fundingBalance={fundingBalance}
          fundingChange={fundingChange}
          futuresBalance={futuresBalance}
          futuresChange={futuresChange}
          unrealizedPnlFunding={unrealizedPnlFunding}
        />
        <PortfolioCard totalBalance={totalBalance} />
      </div>
      <div className="col-span-4 2xl:col-span-3 space-y-3">
        <ExchangeCard />
        <FundingHistoryCard />
      </div>
    </div>
  )
}
