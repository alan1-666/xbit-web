import FinancialChart from './financial-chart'

const TotalLockedValueChart = () => {
  return (
    <div className="size-full bg-[url('/images/vaultDetail/bg_chart.png')] bg-no-repeat bg-cover py-3 rounded-[20px]">
      <div className="flex gap-3 items-center">
        <div className="rounded-r-[2px] bg-[#00FFB4] w-[2px] h-[12px]" />
        <div className="text-[calc(1rem*(16/16))] app-font-medium">总锁仓价值</div>
      </div>
      <div>
        <FinancialChart />
      </div>
    </div>
  )
}

export default TotalLockedValueChart
