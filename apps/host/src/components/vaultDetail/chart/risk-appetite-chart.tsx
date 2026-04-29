import { cn } from '@/lib/utils'
import { ApexOptions } from 'apexcharts'

import { useState } from 'react'
import ReactApexChart from 'react-apexcharts'

const CryptoPortfolio = () => {
  const [portfolioData] = useState([
    { name: 'BTC', percentage: 59.96, value: '$4.45M', color: '#3456FF' },
    { name: 'ETH', percentage: 20.85, value: '$99.98K', color: '#00CCFF' },
    { name: 'BNB', percentage: 2.1, value: '$9,383', color: '#00FFB4' },
    { name: 'DOGE', percentage: 2.1, value: '$9,383', color: '#FACC14' },
  ])

  // Prepare data for ApexCharts
  const chartSeries = portfolioData.map((item) => item.percentage)
  const chartLabels = portfolioData.map((item) => item.name)
  const chartColors = portfolioData.map((item) => item.color)

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
    },
    colors: chartColors,
    labels: chartLabels,
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    stroke: {
      width: 0,
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        console.log({ series, seriesIndex, dataPointIndex, w })

        return (
          '<div>' +
          '<span class="text-[calc(1rem*(11/16))] app-font-medium">' +
          portfolioData[seriesIndex].name +
          '</span>' +
          '</div>'
        )
      },
    },
    markers: {
      size: 0,
      hover: {
        size: 6,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          background: '#191919',
          labels: {
            show: false,
          },
        },
      },
    },
  }

  const CircularProgressBar: React.FC<{ size: number; className?: string }> = ({ size = 80, className }) => {
    const viewBoxSize = size
    const center = viewBoxSize / 2
    const radius = (viewBoxSize * 0.8) / 2

    return (
      <div className={cn('flex flex-col items-center justify-center', className)}>
        <div style={{ width: `${size}px`, height: `${size}px` }} className="relative">
          <svg className="w-full h-full" viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
            {/* Vòng tròn nền với các dấu gạch */}
            <circle cx={center} cy={center} r={radius} fill="#14141499" stroke="none" />
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i * 6 * Math.PI) / 180
              const innerRadius = i % 5 === 0 ? radius - 5 : radius - 3
              const x1 = center + innerRadius * Math.cos(angle)
              const y1 = center + innerRadius * Math.sin(angle)
              const x2 = center + radius * Math.cos(angle)
              const y2 = center + radius * Math.sin(angle)

              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={'#878787'} strokeWidth={1} />
            })}
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full text-white p-3">
      <div className="grid grid-cols-5">
        <div className="relative -mx-10 my-auto col-span-2 justify-self-center mt-7">
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ECECED0A] rounded-full size-[120px] z-0" />
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="donut"
            height={120}
            width={120}
            className="flex z-1"
          />
          <CircularProgressBar size={75} className="absolute top-[60px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0" />
        </div>

        <div className="flex flex-col justify-center col-span-3">
          <div className="flex flex-row justify-between text-gray-400 text-lg mb-2 px-2">
            <div className="text-[calc(1rem*(12/16))] app-font-regular text-[#FFFFFFB2] invisible">占比</div>
            <div className="text-[calc(1rem*(12/16))] app-font-regular text-[#FFFFFFB2]">占比</div>
            <div className="text-[calc(1rem*(12/16))] app-font-regular text-[#FFFFFFB2]">价值</div>
          </div>

          {portfolioData.map((crypto, index) => (
            <div
              key={index}
              className={`flex flex-row justify-between items-center p-1 px-2 rounded-lg ${crypto.name === 'BTC' ? 'custom-apex-chart-description bg-[#ECECED14]' : ''}`}
            >
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: crypto.color }}></div>
                <div className="text-[calc(1rem*(12/16))] app-font-regular">{crypto.name}</div>
              </div>
              <div className="text-[calc(1rem*(11/16))] app-font-regular">{crypto.percentage}%</div>
              <div className="text-[calc(1rem*(11/16))] app-font-regular">{crypto.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// export default CryptoPortfolio

const RiskAppetiteChart = () => {
  const ItemCol = ({ title, value }: { title: string; value: string }) => {
    const handleSetColor = () => {
      if (value.includes('+')) {
        return 'text-[#00FFB4]'
      }
    }

    return (
      <div className="">
        <div className="text-[#FFFFFFB2] text-[calc(1rem*(12/16))] app-font-regular">{title}</div>
        <div className={cn('text-[calc(1rem*(14/16))] app-font-medium', handleSetColor())}>{value}</div>
      </div>
    )
  }

  return (
    <div className="size-full bg-[url('/images/vaultDetail/bg_chart.png')] bg-no-repeat bg-cover py-3 rounded-[20px]">
      <div className="flex gap-3 items-center">
        <div className="rounded-r-[2px] bg-[#00FFB4] w-[2px] h-[12px]" />
        <div className="text-[calc(1rem*(16/16))] app-font-medium">风险偏好</div>
      </div>
      <div className="mx-3 mt-3 bg-[#23585F33] rounded-[8px] p-[10px] flex justify-between">
        <div className="flex flex-col gap-2">
          <ItemCol title="仓位价值" value="$10.34M" />
          <ItemCol title="做多" value="$5.16M (75.32%)" />
          <ItemCol title="总盈亏" value="+93.49K" />
        </div>
        <div className="flex flex-col gap-2">
          <ItemCol title="重仓" value="BTC ($4.45M,69.96%)" />
          <ItemCol title="购买人数" value="$4.98M (24.68%)" />
          <ItemCol title="购买人数" value="342" />
        </div>
      </div>
      <div>
        <CryptoPortfolio />
      </div>
    </div>
  )
}

export default RiskAppetiteChart
