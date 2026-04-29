import { ApexOptions } from 'apexcharts'
import dayjs from 'dayjs'

const useConfigChart = () => {
  const btcData = generateDayWiseTimeSeries(new Date('2024-07-03').getTime(), 115, {
    min: -30,
    max: 90,
  })
  const xbitData = generateDayWiseTimeSeries(new Date('2024-07-03').getTime(), 115, {
    min: 30,
    max: 90,
  })

  function generateDayWiseTimeSeries(baseval: number, count: number, yrange: { min: number; max: number }) {
    let i = 0
    const series = []
    while (i < count) {
      const x = baseval
      const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min

      series.push([x, y])
      baseval += 86400000
      i++
    }
    return series
  }

  // Series data
  const series = [
    {
      name: 'Price',
      data: btcData,
    },
  ]

  const options: ApexOptions = {
    chart: {
      id: 'chart-secondary',
      type: 'area',
      height: 30,
      toolbar: {
        // autoSelected: 'pan',
        show: false
      },
      zoom: {
        enabled: false,
      },
      // foreColor: '#ccc',
      brush: {
        target: 'chart-primary',
        enabled: true,
      },
      selection: {
        enabled: true,
        fill: {
          color: '#fff',
          // opacity: 0.4,
        },
        xaxis: {
          min: new Date('2024-08-08').getTime(),
          max: new Date('2024-09-09').getTime(),
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
      width: 1,
      colors: ['#00FFF61A'],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.9,
        opacityTo: 0.1,
        stops: [0, 100],
      },
      colors: ['#7ABEFD33'],
    },
    grid: {
      show: false,
    },
    xaxis: {
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
      enabled: false,
    },
  }

  // chart 2

  const series2 = [
    {
      name: 'BTC涨幅',
      data: btcData,
      color: '#00CCFF',
      type: 'area',
    },
    {
      name: 'KairoX量化2号累积收益',
      data: xbitData,
      color: '#FACC14',
      type: 'line',
    },
  ]

  // Chart options
  const options2: ApexOptions = {
    chart: {
      id: 'chart-primary',
      type: 'line',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: [2, 2],
    },
    fill: {
      type: ['gradient', 'solid'],
      gradient: {
        type: 'vertical',
        shadeIntensity: 0.4,
        opacityFrom: 0.5,
        opacityTo: 0.3,
        stops: [0, 100],
      },
      colors: ['#00CCFF0D'],
    },
    grid: {
      show: true,
      borderColor: '#ECECED1F',
      // strokeDashArray: 3,
      position: 'back',
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },

    xaxis: {
      labels: {
        rotate: 0,
        style: {
          colors: '#FFFFFFB2',
        },
        format: 'dd/MM/yyyy',
      },
      type: 'datetime',
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },

    },
    markers: {
      strokeWidth: 2,
      hover: {
        size: 6,
      },
      discrete: btcData.flatMap((_, index) => {
        if (index % 3 === 0) {
          return [
            {
              seriesIndex: 0,
              dataPointIndex: index,
              fillColor: index % 2 === 0 ? '#00FFB4' : '#AB57FF',
              strokeColor: index % 2 === 0 ? '#00FFB4' : '#AB57FF',
              size: 1.5,
            },
          ]
        }
        return []
      }),
    },
    yaxis: {
      labels: {
        style: {
          colors: '#FFFFFFB2',
        },
        formatter: function (value: number) {
          return value.toFixed(2) + '%'
        },
      },
      min: -30,
      max: 90,
      tickAmount: 4,
    },
    tooltip: {
      theme: 'dark',
      x: {
        formatter: function (value: number) {
          return dayjs(value).format('DD/MM/YYYY')
        },
      },
      y: {
        formatter: function (value: number) {
          return value + '%'
        },
      },
    },
    legend: {
      show: false,
    },
  }

  return { options, series, options2, series2 }
}

export default useConfigChart
