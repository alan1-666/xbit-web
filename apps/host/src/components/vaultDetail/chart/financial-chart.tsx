import { cn } from '@/lib/utils'
import { ApexOptions } from 'apexcharts'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts'

const FinancialChart = () => {
  // State for the selected time period tab
  const [selectedTab, setSelectedTab] = useState('7D')
  const [chartData, setChartData] = useState<any[]>([])
  // State for the displayed date and profit value
  const [dateDisplay, setDateDisplay] = useState('2025/03/22')
  const [profitDisplay, setProfitDisplay] = useState('+$22323')

  // Full dataset (original data)
  const fullData = [
    { x: new Date('2024-06-26').getTime(), y: -10000000 },
    { x: new Date('2024-06-29').getTime(), y: 0 },
    { x: new Date('2024-07-01').getTime(), y: 8000000 },
    { x: new Date('2024-07-03').getTime(), y: 0 },
    { x: new Date('2024-07-05').getTime(), y: 9000000 },
    { x: new Date('2024-07-07').getTime(), y: 5000000 },
    { x: new Date('2024-07-09').getTime(), y: 5000000 },
    { x: new Date('2024-07-11').getTime(), y: 10000000 },
    { x: new Date('2024-07-13').getTime(), y: 8000000 },
    { x: new Date('2024-07-15').getTime(), y: 5000000 },
    { x: new Date('2024-07-17').getTime(), y: 7000000 },
    { x: new Date('2024-07-19').getTime(), y: 3000000 },
    { x: new Date('2024-07-21').getTime(), y: 0 },
    { x: new Date('2024-07-23').getTime(), y: -9000000 },
    { x: new Date('2024-07-25').getTime(), y: -3000000 },
    { x: new Date('2024-07-27').getTime(), y: 4000000 },
    { x: new Date('2024-07-29').getTime(), y: 5000000 },
    { x: new Date('2024-07-31').getTime(), y: 3000000 },
    { x: new Date('2024-08-02').getTime(), y: 5000000 },
    { x: new Date('2024-08-04').getTime(), y: 7000000 },
    { x: new Date('2024-08-06').getTime(), y: 5000000 },
    { x: new Date('2024-08-08').getTime(), y: 5000000 },
    { x: new Date('2024-08-10').getTime(), y: 6000000 },
    { x: new Date('2024-08-12').getTime(), y: 5000000 },
    { x: new Date('2024-08-14').getTime(), y: 3000000 },
    { x: new Date('2024-08-16').getTime(), y: 5000000 },
    { x: new Date('2024-08-18').getTime(), y: 5000000 },
    { x: new Date('2024-08-20').getTime(), y: 7000000 },
    { x: new Date('2024-08-22').getTime(), y: 7000000 },
    { x: new Date('2024-08-24').getTime(), y: 3000000 },
    { x: new Date('2024-08-26').getTime(), y: -5000000 },
  ]

  // Function to filter data based on the selected time period
  const filterDataByTimePeriod = (period: string) => {
    let filteredData = []
    let dateText = '2025/03/22'
    let profitText = '+$22323'

    switch (period) {
      case '24H':
        // Last 24 hours - get the last 2 data points for 24H view
        filteredData = fullData.slice(-2)
        dateText = '2025/03/22'
        profitText = '+$3500'
        break

      case '7D':
        // Last 7 days - get the last 7-10 data points
        filteredData = fullData.slice(-10)
        dateText = '2025/03/22'
        profitText = '+$22323'
        break

      case '30D':
        // Last 30 days - get the last 15-20 data points
        filteredData = fullData.slice(-20)
        dateText = '2025/03/22'
        profitText = '+$45670'
        break

      case 'ALL':
        // All data
        filteredData = fullData
        dateText = '2024/06/26 - 2025/03/22'
        profitText = '+$78450'
        break

      default:
        filteredData = fullData.slice(-10)
    }

    setChartData(filteredData)
    setDateDisplay(dateText)
    setProfitDisplay(profitText)
  }

  // Initialize the chart data when component mounts
  useEffect(() => {
    filterDataByTimePeriod(selectedTab)
  }, [selectedTab])

  // Handle tab click
  const handleTabClick = (tab: string) => {
    setSelectedTab(tab)
  }

  // ApexCharts options
  const options: ApexOptions = {
    chart: {
      type: 'area',
      foreColor: '#FFFFFFB2',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: true,
        // easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2.5,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: ['#00CCFF'],
        inverseColors: false,
        opacityFrom: 0.4,
        opacityTo: 0.0,
        stops: [0, 100],
      },
    },
    grid: {
      borderColor: '#ECECED1F',
      strokeDashArray: 0,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    markers: {
      size: 3,
      colors: ['#FFFFFF'],
      strokeColors: '#00CCFF',

      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    xaxis: {
      labels: {
        rotate: 0,
        style: {
          colors: '#FFFFFFB2',
        },
      },
      overwriteCategories:
        selectedTab === 'ALL'
          ? ['2024/07/03', '2024/11/11', '2025/03/20']
          : selectedTab === '30D'
            ? ['2025/02/20', '2025/03/07', '2025/03/20']
            : selectedTab === '7D'
              ? ['2025/03/15', '2025/03/18', '2025/03/22']
              : ['2025/03/21', '2025/03/22', '2025/03/22'],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          if (val >= 10000000) return '$' + (val / 100000000).toFixed(1) + '亿'
          else if (val <= -10000000) return '-$' + Math.abs(val / 100000000).toFixed(1) + '亿'
          else if (val > 0) return '$' + (val / 10000000).toFixed(0) + '000万'
          else if (val < 0) return '-$' + Math.abs(val / 10000000).toFixed(0) + '000万'
          else return '$0'
        },
        style: {
          colors: '#FFFFFFB2',
        },
      },
    },
    tooltip: {
      theme: 'dark',
      x: {
        // format: 'yyyy/MM/dd',
        formatter: function (value: number) {
          return dayjs(value).format('DD/MM/YYYY')
        },
      },
      y: {
        formatter: function (val) {
          if (val >= 0) return '+$' + val.toLocaleString()
          return '-$' + Math.abs(val).toLocaleString()
        },
      },
    },
  }

  const series = [
    {
      name: '收益',
      data: chartData,
      color: '#00CCFF',
    },
  ]

  return (
    <div>
      <div className="px-3 mt-3">
        <div className="grid grid-cols-4 bg-[#ECECED14] rounded-[4px] items-center py-[4px] px-[4px]">
          <div className="justify-center items-center flex">
            <button
              onClick={() => handleTabClick('24H')}
              className={cn(
                'text-[calc(1rem*(11/16))] app-font-regular text-[#FFFFFFB2] text-center px-[8px] py-[4px] flex-1',
                selectedTab === '24H' && 'bg-[#00FFB41A] text-[#00FFB4] rounded-[4px]',
              )}
            >
              24H
            </button>
          </div>

          <div className="justify-center items-center flex">
            <button
              onClick={() => handleTabClick('7D')}
              className={cn(
                'text-[calc(1rem*(11/16))] app-font-regular text-[#FFFFFFB2] text-center px-[8px] py-[4px] flex-1',
                selectedTab === '7D' && 'bg-[#00FFB41A] text-[#00FFB4] rounded-[4px]',
              )}
            >
              7D
            </button>
          </div>

          <div className="justify-center items-center flex">
            <button
              onClick={() => handleTabClick('30D')}
              className={cn(
                'text-[calc(1rem*(11/16))] app-font-regular text-[#FFFFFFB2] text-center px-[8px] py-[4px] flex-1',
                selectedTab === '30D' && 'bg-[#00FFB41A] text-[#00FFB4] rounded-[4px]',
              )}
            >
              30D
            </button>
          </div>

          <div className="justify-center items-center flex">
            <button
              onClick={() => handleTabClick('ALL')}
              className={cn(
                'text-[calc(1rem*(11/16))] app-font-regular text-[#FFFFFFB2] text-center px-[8px] py-[4px] flex-1',
                selectedTab === 'ALL' && 'bg-[#00FFB41A] text-[#00FFB4] rounded-[4px]',
              )}
            >
              全部
            </button>
          </div>
        </div>
      </div>

      <div className="px-3 mt-3">
        <div className="text-[#FFFFFFB2] text-[calc(1rem*(11/16))] app-font-regular">{dateDisplay}</div>
        <div className="text-[#00FFB4] text-[calc(1rem*(16/16))] app-font-semibold">{profitDisplay}</div>
      </div>

      <div id="chart" className="-mx-2 -mr-4">
        <ReactApexChart options={options} series={series} type="area" height={289} />
      </div>
    </div>
  )
}
export default FinancialChart;
