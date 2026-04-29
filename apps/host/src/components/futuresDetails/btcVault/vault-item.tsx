import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import ReactApexChart from 'react-apexcharts'
import { useNavigate } from 'react-router-dom'
import BuyNowDrawer from './buy-now-drawer'
import { ApexOptions } from 'apexcharts'

const VaultItemImgHeader = ({ url }: { url: string }) => {
  return (
    <div className="">
      <img src={url} className="size-[20px] " alt="icon vault"/>
    </div>
  )
}

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
      <ReactApexChart options={options} series={series} type="area" height={100} />
    </div>
  )
}

const VaultItem = ({ isSpecial }: { isSpecial?: boolean }) => {
  const navigate = useNavigate()

  const cryptoCoins = [
    '/images/futuresDetail/CryptoCoins/btc.svg',
    '/images/futuresDetail/CryptoCoins/bnb.svg',
    '/images/futuresDetail/CryptoCoins/dog-coid.svg',
    '/images/futuresDetail/CryptoCoins/eth.svg',
    '/images/futuresDetail/CryptoCoins/tron.svg',
  ]

  return (
    <div className="rounded-[8px] bg-[#ECECED0A] bg-[url(/images/cryptoTransactionHistory/background.png)] bg-cover bg-no-repeat">
      <div
        className={cn(
          'py-[10px] px-[12px] bg-[#ECECED0A] flex justify-between rounded-t-[8px] items-center',
          isSpecial ? 'background-header-vault-item' : '',
        )}
      >
        <div className="flex items-center cursor-pointer" onClick={() => navigate(`/vault-detail/address`)}>
          <span className="text-[calc(1rem*(16/16))] font-[500] text-white">KairoX量化2号</span>
          {isSpecial && (
            <span className="background-vault-item rounded-[3px] h-[18px] ml-2">
              <span className="text-vault-item text-[calc(1rem*(11/16))] align-top px-0.5">官方</span>
            </span>
          )}
          <ChevronRight className="ml-1" size={20} />
        </div>
        <div className="flex items-center">
          <div className="text-[calc(1rem*(12/16))] text-[#FFFFFFCC] pr-2">组合数</div>
          {cryptoCoins.map((e, index) => (
            <div
              key={index}
              className="relative"
              style={{
                marginLeft: index > 0 ? '-8px' : '0',
              }}
            >
              <VaultItemImgHeader url={e} />
            </div>
          ))}
        </div>
      </div>
      <div className="py-[10px] px-[12px]">
        <div className="flex justify-between">
          <div className="">
            <div className="text-[calc(1rem*(12/16))] text-[#FFFFFFCC]">近30天收益率</div>
            <div className="text-[#00FFB4] text-[calc(1rem*(22/16))] font-[600]">
              +78.45<span className="text-[calc(1rem*(14/16))] font-[500]">%</span>
            </div>
          </div>
          <div className="w-[150px] -my-8 -mr-[9px]">
            <ApexLineChart />
          </div>
        </div>
        <div className="mt-2 flex justify-between">
          <div className="">
            <div className="text-[calc(1rem*(12/16))] text-[#FFFFFFB2]">总锁仓价值(TVL)</div>
            <div className="text-[#00FFB4] text-[calc(1rem*(14/16))] font-[600]">$235,615.23</div>
          </div>
          <div className="">
            <div className="text-[calc(1rem*(12/16))] text-[#FFFFFFB2]">7日最大回撤</div>
            <div className="text-[#00FFB4] text-[calc(1rem*(14/16))] font-[600]">+32.69%</div>
          </div>
          <div className="">
            <div className="text-[calc(1rem*(12/16))] text-[#FFFFFFB2]">运行时长</div>
            <div className="text-[calc(1rem*(14/16))]">125天</div>
          </div>
        </div>
      </div>
      <div className="py-[10px] px-[12px] border-t border-[#ECECED14]">
        {isSpecial ? (
          <Button variant={'disabled'} className={cn('w-full rounded-[50px] text-[#FFFFFFB2]')}>
            已购买
          </Button>
        ) : (
          <BuyNowDrawer />
        )}
      </div>
    </div>
  )
}

export default VaultItem
