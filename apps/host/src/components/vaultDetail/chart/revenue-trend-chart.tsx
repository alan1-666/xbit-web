import React from 'react'
import ReactApexChart from 'react-apexcharts'
import useConfigChart from './hooks/use-config-chart'

const ApexLineChart: React.FC = () => {
  const { options, series } = useConfigChart()

  return (
    <div className="w-full">
      <ReactApexChart options={options} series={series} type="area" height={90} />
    </div>
  )
}

const ComparisonChart: React.FC = () => {
  const { options2, series2 } = useConfigChart()

  return (
    <div className="pt-4">
      <div>
        <ReactApexChart options={options2} series={series2} type="area" height="140%" className="-mt-6" />
      </div>
    </div>
  )
}

const DraggableSlider: React.FC = () => {
  return (
    <div className="h-7 bg-[#ECECED0A] overflow-hidden custom relative rounded-lg mt-3 px-1">
      <ApexLineChart />
    </div>
  )
}

const RevenueTrendChart: React.FC = () => {
  return (
    <div className="size-full bg-[url('/images/vaultDetail/bg_chart.png')] bg-no-repeat bg-cover py-3 rounded-[20px]">
      <div className="flex gap-3 items-center">
        <div className="rounded-r-[2px] bg-[#00FFB4] w-[2px] h-[12px]" />
        <div className="text-[calc(1rem*(16/16))] app-font-medium">收益走势图</div>
        <div className="text-[#FFFFFFB2] text-[calc(1rem*(14/16))] app-font-regular align-baseline">(策略运行以来)</div>
      </div>
      <div>
        <div className="flex mt-2">
          <div className="flex-1 flex justify-center items-center flex-col">
            <div className="flex gap-2 items-center">
              <div className="bg-[#00CCFF] w-[12px] h-[4px] rounded-[2px]" />
              <div className="text-[calc(1rem*(14/16))] app-font-regular">BTC涨幅</div>
            </div>
            <div className="flex items-center">
              <div className="text-[calc(1rem*(14/16))] app-font-medium text-[#AB57FF] -ml-[6px]">-7.89%</div>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center flex-col">
            <div className="flex gap-2 items-center">
              <div className="bg-[#FACC14] w-[12px] h-[4px] rounded-[2px]" />
              <div className="text-[calc(1rem*(14/16))] app-font-regular">KairoX量化2号累积收益</div>
            </div>
            <div className="flex items-center">
              <div className="text-[calc(1rem*(14/16))] app-font-medium text-[#00FFB4] -ml-[6px]">+12.36%</div>
            </div>
          </div>
        </div>
        <ComparisonChart />
        <DraggableSlider />
      </div>
    </div>
  )
}

export default RevenueTrendChart
