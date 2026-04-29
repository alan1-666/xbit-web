import DailyIncomeChart from './daily-income-chart'
import RevenueTrendChart from './revenue-trend-chart'
import RiskAppetiteChart from './risk-appetite-chart'
import TotalLockedValueChart from './total-locked-value-chart'
interface ChartVaultDetailProps {
  activeTab: number
}

const ChartVaultDetail = ({ activeTab }: ChartVaultDetailProps) => {
  return (
    <>
      {activeTab === 0 && <RevenueTrendChart />}
      {activeTab === 1 && <DailyIncomeChart />}
      {activeTab === 2 && <TotalLockedValueChart />}
      {activeTab === 3 && <RiskAppetiteChart />}
    </>
  )
}

export default ChartVaultDetail
