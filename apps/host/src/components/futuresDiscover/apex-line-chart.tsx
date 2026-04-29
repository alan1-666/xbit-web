import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'

const ApexLineChart = () => {
  const generateTimeSeriesData = () => {
    const series = []
    const today = new Date()

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)

      let value
      if (i > 20) {
        value = Math.random() * 10 + 20
      } else if (i > 15) {
        value = Math.random() * 20 + 60
      } else {
        value = Math.random() * 15 + 70
      }

      series.push([date.getTime(), value])
    }

    return series
  }

  // Series data
  const series = [
    {
      name: 'Price',
      data: generateTimeSeriesData(),
    },
  ]

  // Chart options
  const options: ApexOptions = {
    chart: {
      type: 'area',
      height: 200,
      zoom: {
        enabled: false,
        type: 'x',
        autoScaleYaxis: false,
      },
      toolbar: {
        show: false,
      },
      foreColor: '#A0AEC0',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
      width: 2,
      colors: ['#2ECC71'],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.9,
        opacityTo: 0.1,
        stops: [0, 100],
      },
      colors: ['#00FFB433'],
    },
    grid: {
      show: false,
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy',
      },
    },
    markers: {
      size: 0,
    },
  }

  return (
    <div className="">
      <ReactApexChart options={options} series={series} type="area" height={80} />
    </div>
  )
}

export default ApexLineChart
