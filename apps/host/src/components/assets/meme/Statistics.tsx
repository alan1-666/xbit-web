import { WalletBalanceUnit, WalletDuration } from '@/@generated/gql/graphql-core.ts'
import { ChainType } from '@/@generated/gql/graphql-trading.ts'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import IconCalendar from '@/components/icon/stroke/IconCalendar'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { formatAmount, formatBalance } from '@/lib/format'
import { gqlMeme2 } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/redux/store'
import { getPortfolioStatistic } from '@/services/wallet.service'
import { ChainIds } from '@/types/enums.ts'
import { useQuery } from '@apollo/client'
import { IconArrowDown, IconArrowLeft1, IconArrowRight1, IconClose, IconEmpty } from '@components/icon'
import IconFund from '@components/icon/stroke/IconFund.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { ChartItem, useAssetChart } from '@hooks/useAssetChart.ts'
import { getWalletPnl } from '@services/assets.service.ts'
import dayjs from 'dayjs'
import { toPng } from 'html-to-image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

type Props = {
  walletsByChain: UserEmbeddedWalletDto[]
  wallet: string | undefined
  chainId?: number
}

type CustomCursorProps = {
  x?: number
  y?: number
  height?: number
  width?: number
}

const CustomCursor = (props: CustomCursorProps) => {
  const { x, y, height, width } = props
  if (x === undefined || y === undefined || height === undefined || width === undefined) {
    return null
  }
  return (
    <line
      x1={x + width / 2}
      x2={x + width / 2}
      y1={y}
      y2={y + height}
      stroke="#6C6A74"
      strokeWidth={1}
      strokeDasharray="5 5"
    />
  )
}

const mapChainIdToChainType = (chainId: number): ChainType => {
  switch (chainId) {
    case ChainIds.Solana:
      return ChainType.Solana
    case ChainIds.Ethereum:
      return ChainType.Evm
    case ChainIds.Arbitrum:
      return ChainType.Evm
    case ChainIds.Bsc:
      return ChainType.Bsc
    case ChainIds.Mon:
      return ChainType.Mon
    default:
      return ChainType.Solana
  }
}

const formatTime = (timestamp: number, period: string) => {
  const date = dayjs(timestamp)
  switch (period) {
    case '1day':
      return date.format('HH')
    case '1week':
      return date.format('ddd')
    case '1month':
      return date.format('DD')
    case '1year':
      return date.format('MMM')
    default:
      return date.format('HH')
  }
}

const usePrices = () => {
  const priceList = useAppSelector((state) => state.price.list)
  return useMemo(() => {
    return {
      solPrice: priceList['SOL'],
      ethPrice: priceList['ETH'],
      bnbPrice: priceList['BNB'],
      monPrice: priceList['MON'],
    }
  }, [priceList])
}

const mapPeriodToTimeFrame = (period: string) => {
  switch (period) {
    case '1day':
      return 'h24'
    case '1week':
      return 'd7'
    case '1month':
      return 'm1'
    case '1year':
      return 'y1'
    default:
      return 'd7'
  }
}

const formatTimeBasedOnPeriod = (timestamp: string, period: string) => {
  switch (period) {
    case '1day':
      return dayjs(timestamp).format('HH:mm DD MMM, YYYY')
    case '1week':
    case '1month':
      return dayjs(timestamp).format('ddd DD MMM, YYYY')
    case '1year':
      return dayjs(timestamp).format('MMM, YYYY')
    default:
      return dayjs(timestamp).format('DD MMM, YYYY')
  }
}

const RealizedPnL = ({
  period,
  setOpenDailyPnl,
  walletsSelected,
}: {
  period: string
  setOpenDailyPnl: (open: boolean) => void
  walletsSelected: UserEmbeddedWalletDto[]
}) => {
  const { t } = useTranslation()
  const [walletPnl, setWalletPnl] = useState<any[]>([])
  const getWalletPnlData = async () => {
    const { data } = await gqlMeme2.query({
      query: getWalletPnl,
      variables: {
        input: {
          addresses: walletsSelected.map((wallet) => wallet.walletAddress),
          chain: walletsSelected[0]?.chain,
          toDate: dayjs.utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
          timeFrame: mapPeriodToTimeFrame(period),
        },
      },
      fetchPolicy: 'cache-first',
    })
    setWalletPnl(data?.getWalletPnl?.wallets?.flatMap((wallet: any) => wallet.pnlPerDay) || [])
  }

  useEffect(() => {
    getWalletPnlData()
  }, [period, walletsSelected])

  const refactorWalletPnl = useMemo(() => {
    switch (period) {
      case '1day': {
        let initData = []
        const ago24h = dayjs().subtract(24, 'hour')
        for (let hour = 0; hour < 24; hour++) {
          const date = ago24h.add(hour + 1, 'hour')
          initData.push({ t: dayjs(date).format('YYYY-MM-DD HH'), v: '0' })
        }
        return initData.map((hourItem) => {
          const tOut = hourItem.t
          let v = 0
          walletPnl.forEach((pnlItem: any) => {
            const t = dayjs.utc(pnlItem.t).format('YYYY-MM-DD HH')
            if (t === tOut) {
              v += parseFloat(pnlItem.v)
            }
          })
          return { t: hourItem.t, v, abs: Math.abs(v) }
        })
      }
      case '1week': {
        let initData = []
        for (let day = 0; day < 7; day++) {
          const sevenDayAgo = dayjs().startOf('day').subtract(6, 'day')
          const date = sevenDayAgo.add(day, 'day')
          initData.push({ t: dayjs(date).format('YYYY-MM-DD'), v: '0' })
        }
        return initData.map((dayItem) => {
          const tOut = dayItem.t
          let v = 0
          walletPnl.forEach((pnlItem: any) => {
            const t = dayjs.utc(pnlItem.t).format('YYYY-MM-DD')
            if (t === tOut) {
              v += parseFloat(pnlItem.v)
            }
          })
          return { t: dayItem.t, v, abs: Math.abs(v) }
        })
      }
      case '1month': {
        let initData = []
        for (let day = 0; day < 30; day++) {
          const thirtyDayAgo = dayjs().startOf('day').subtract(29, 'day')
          const date = thirtyDayAgo.add(day, 'day')
          initData.push({ t: dayjs(date).format('YYYY-MM-DD'), v: '0' })
        }
        return initData.map((dayItem) => {
          const tOut = dayItem.t
          let v = 0
          walletPnl.forEach((pnlItem: any) => {
            const t = dayjs.utc(pnlItem.t).format('YYYY-MM-DD')
            if (t === tOut) {
              v += parseFloat(pnlItem.v)
            }
          })
          return { t: dayItem.t, v, abs: Math.abs(v) }
        })
      }
      case '1year': {
        let initData = []
        const ago12Months = dayjs().startOf('month').subtract(11, 'month')
        for (let month = 0; month < 12; month++) {
          const date = ago12Months.add(month, 'month')
          initData.push({ t: dayjs(date).format('YYYY-MM'), v: '0' })
        }
        return initData.map((monthItem) => {
          const tOut = monthItem.t
          let v = 0
          walletPnl.forEach((pnlItem: any) => {
            const t = dayjs.utc(pnlItem.t).format('YYYY-MM')
            if (t === tOut) {
              v += parseFloat(pnlItem.v)
            }
          })
          return { t: monthItem.t, v, abs: Math.abs(v) }
        })
      }
      default:
        return []
    }
  }, [walletPnl, period])

  return (
    <div className="p-4">
      <div className="font-[330] text-[13px] text-[#FBFBFB] leading-none flex items-center justify-between">
        <span>{t('assets.meme.statistics.realizedPnl')}</span>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="cursor-pointer text-[#79778C] hover:text-[#FBFBFB]"
                onClick={() => setOpenDailyPnl(true)}
              >
                <IconCalendar className="size-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-[#212127] p-2 border border-[#79778C29] rounded-md font-[330] text-[12px] leading-1.5 text-[#908E98]">
              {t('assets.meme.statistics.dailyPnl')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="mt-4 h-[200px] flex items-center justify-center">
        {refactorWalletPnl.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <IconEmpty />
            <span className="text-[#FFFFFF80] text-[0.75rem] text-center max-w-[320px]">{t('history.nodata')}</span>
          </div>
        ) : (
          <ResponsiveContainer height="100%" width="100%" className="relative -ml-10">
            <BarChart data={refactorWalletPnl} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="t"
                tick={{
                  fontSize: 9,
                  fill: '#6C6A74',
                }}
                tickFormatter={(value) => formatTime(value, period)}
                axisLine={true}
                tickLine={true}
                interval={period === '1day' || period === '1month' ? 1 : 0}
              />
              <YAxis
                tick={{
                  fontSize: 9,
                  fill: '#6C6A74',
                }}
                tickFormatter={(value: number) =>
                  formatBalance(value, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })
                }
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  const timestamp = payload?.[0]?.payload?.t
                  const pnl = payload?.[0]?.payload?.v
                  return (
                    <div className="bg-[#212127] rounded-md p-2 flex items-center gap-2">
                      <div
                        className={`w-1 h-[30px] rounded-full ${pnl > 0 ? 'bg-rise' : pnl < 0 ? 'bg-fall' : 'bg-[#FBFBFB]'}`}
                      />
                      <div className="space-y-1.5">
                        <div className="font-[400] text-[14px] text-[#FBFBFB] leading-none">
                          {formatTimeBasedOnPeriod(timestamp, period)}
                        </div>
                        <div
                          className={`font-[400] text-[12px] leading-none ${pnl > 0 ? 'text-rise' : pnl < 0 ? 'text-fall' : 'text-[#FBFBFB]'}`}
                        >
                          {formatBalance(pnl, { showCurrency: true, roundMode: 'floor' })}
                        </div>
                      </div>
                    </div>
                  )
                }}
                cursor={<CustomCursor />}
              />
              <Bar dataKey="abs" radius={[2, 2, 0, 0]}>
                {refactorWalletPnl.map((entry, index) => (
                  <Cell
                    cursor="pointer"
                    fill={entry.v >= 0 ? '#21E09DCC' : '#EA3B4FCC'}
                    key={`cell-${index}`}
                    className="bg-transparent"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

const dayInWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const DailyPnl = ({
  walletsSelected,
  open,
  onOpenChange,
}: {
  walletsSelected: UserEmbeddedWalletDto[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const { t } = useTranslation()
  const chain = walletsSelected[0]?.chain || ChainType.Solana
  const { solPrice, bnbPrice, monPrice } = usePrices()
  const nativeTokenPrice = useMemo(() => {
    switch (chain) {
      case ChainType.Solana:
        return solPrice
      case ChainType.Bsc:
        return bnbPrice
      case ChainType.Mon:
        return monPrice
      default:
        return solPrice
    }
  }, [chain])
  const nativeUnit = useMemo(() => {
    switch (chain) {
      case ChainType.Solana:
        return 'SOL'
      case ChainType.Bsc:
        return 'BNB'
      case ChainType.Mon:
        return 'MON'
      default:
        return 'USD'
    }
  }, [chain])
  const [unit, setUnit] = useState<'USD' | 'SOL' | 'BNB' | 'MON'>(nativeUnit)

  const [curerentMonth, setCurrentMonth] = useState(dayjs.utc().format('YYYY-MM'))
  const lastDayOfMonth = useMemo(() => {
    return dayjs.utc(curerentMonth).endOf('month').format('YYYY-MM-DDTHH:mm:ss[Z]')
  }, [curerentMonth])
  const [walletPnl, setWalletPnl] = useState<any[]>([])
  const getWalletPnlData = async () => {
    const { data } = await gqlMeme2.query({
      query: getWalletPnl,
      variables: {
        input: {
          addresses: walletsSelected.map((wallet) => wallet.walletAddress),
          chain: walletsSelected[0]?.chain,
          toDate: lastDayOfMonth,
          timeFrame: 'm1',
        },
      },
      fetchPolicy: 'cache-first',
    })
    setWalletPnl(data?.getWalletPnl?.wallets?.flatMap((wallet: any) => wallet.pnlPerDay) || [])
  }

  useEffect(() => {
    if (open) {
      setCurrentMonth(dayjs.utc().format('YYYY-MM'))
      setUnit('USD')
      getWalletPnlData()
    }
  }, [open])

  useEffect(() => {
    if (!curerentMonth) {
      setCurrentMonth(dayjs.utc().format('YYYY-MM'))
    } else {
      getWalletPnlData()
    }
  }, [curerentMonth])

  const refactorWalletPnl = useMemo(() => {
    if (curerentMonth) {
      const startOfMonth = dayjs.utc(dayjs(curerentMonth).startOf('month')).unix()
      const daysInMonth = dayjs.utc(curerentMonth).daysInMonth()
      const initData = []
      for (let day = 0; day < daysInMonth; day++) {
        const date = dayjs.unix(startOfMonth).add(day, 'day')
        initData.push({ t: dayjs(date).format('YYYY-MM-DD'), v: '0' })
      }
      return initData.map((dayItem) => {
        const t = dayItem.t
        let v = 0
        walletPnl.forEach((pnlItem: any) => {
          if (pnlItem.t === t) {
            v += parseFloat(pnlItem.v)
          }
        })
        return { t, v }
      })
    }
    return []
  }, [walletPnl, curerentMonth])

  const totalPnL = useMemo(() => {
    return refactorWalletPnl.reduce((total, item) => total + Number(item.v), 0)
  }, [refactorWalletPnl])

  const winDays = useMemo(() => {
    return refactorWalletPnl.filter((item) => item.v > 0).length
  }, [refactorWalletPnl])

  const winAmount = useMemo(() => {
    return refactorWalletPnl.reduce((total, item) => (item.v > 0 ? total + Number(item.v) : total), 0)
  }, [refactorWalletPnl])

  const lossDays = useMemo(() => {
    return refactorWalletPnl.filter((item) => item.v < 0).length
  }, [refactorWalletPnl])

  const lossAmount = useMemo(() => {
    return refactorWalletPnl.reduce((total, item) => (item.v < 0 ? total + Number(item.v) : total), 0)
  }, [refactorWalletPnl])

  const startDayOfWeek = useMemo(() => {
    if (refactorWalletPnl.length === 0) return 0
    const firstDay = dayjs.utc(refactorWalletPnl[0].t).day() // 0 (Sun) - 6 (Sat)
    return firstDay === 0 ? 6 : firstDay - 1 // Convert to Mon (0) - Sun (6)
  }, [refactorWalletPnl])

  const calendarRef = useRef<HTMLDivElement>(null)

  const waitForImages = useCallback(async (container: HTMLElement): Promise<void> => {
    const images = container.querySelectorAll('img')
    const promises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = img.onerror = () => resolve(true)
        setTimeout(() => resolve(true), 4000)
      })
    })
    await Promise.all(promises)
  }, [])

  const onSave = async () => {
    const ref = calendarRef.current

    if (!ref) {
      return
    }

    try {
      await waitForImages(ref)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const dataUrl = await toPng(ref, {
        quality: 1,
        pixelRatio: 1.5,
        cacheBust: true,
        includeQueryParams: true,
      })

      const link = document.createElement('a')
      link.download = `daily-pnl.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Error saving image:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[912px] !rounded-xl p-4 bg-[#212127] overflow-hidden"
        showDialogPrimitiveClose={false}
      >
        <div
          className='relative bg-[url("/images/bg-daily-pnl.png")] p-4 bg-cover bg-center border-[0.5px] rounded-xl overflow-hidden'
          ref={calendarRef}
        >
          <div className="w-full flex items-center justify-center gap-2">
            <img className="h-[44px]" src="/images/kairox-logo.svg" alt="logo xbit" />
            <div className="flex flex-col items-start gap-1">
              <img className="h-[25px]" src="/images/kairox-logo-text.svg" alt="logo xbit text" />
              <span className="text-[12px] text-[#FFFFFFB2] leading-none">
                {t('detail.myPositions.decentralizedExchange')}
              </span>
            </div>
          </div>
          <div className="absolute top-4 right-4 cursor-pointer" onClick={() => onOpenChange(false)}>
            <IconClose className="size-6 text-[#79778C] hover:text-[#FBFBFB]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-end gap-3">
              <div className="font-[450] text-[16px] tex-[#FBFBFB] leading-none">
                {t('assets.meme.statistics.dailyPnl')}
              </div>
              <div
                className="flex items-end gap-1 cursor-pointer font-[330] text-[13px] text-[#908E98] leading-none hover:text-[#FBFBFB]"
                onClick={() => {
                  setUnit(unit === 'USD' ? nativeUnit : 'USD')
                }}
              >
                <span>{unit}</span>
                <IconFund className="size-[14px]" />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <span>
                <IconArrowLeft1
                  className="inline size-6 cursor-pointer text-[#79778C] hover:text-[#FBFBFB]"
                  onClick={() => {
                    setCurrentMonth(dayjs(curerentMonth).subtract(1, 'month').format('YYYY-MM'))
                  }}
                />
              </span>
              <div className="relative">
                <input
                  id="monthPicker"
                  type="month"
                  className="absolute w-0 h-6 right-[205px] opacity-0"
                  max={dayjs().format('YYYY-MM')}
                  value={curerentMonth}
                  onChange={(e) => setCurrentMonth(e.target.value)}
                />
                <div
                  className="w-[85px] flex items-center justify-center gap-1.5 font-[450] text-[14px] text-[#FBFBFB] cursor-pointer"
                  onClick={() => {
                    document.getElementById('monthPicker')?.showPicker()
                  }}
                >
                  <IconCalendar className="size-3" />
                  {dayjs(curerentMonth).format('MMM YYYY')}
                </div>
              </div>
              <span>
                <IconArrowRight1
                  className={cn(
                    'inline size-6 cursor-pointer text-[#79778C] hover:text-[#FBFBFB]',
                    dayjs(curerentMonth).isSame(dayjs(), 'month') && 'cursor-not-allowed',
                  )}
                  onClick={() => {
                    if (dayjs(curerentMonth).isSame(dayjs(), 'month')) return
                    setCurrentMonth(dayjs(curerentMonth).add(1, 'month').format('YYYY-MM'))
                  }}
                />
              </span>
            </div>
          </div>
          <div className="mt-4 font-[450] text-[20px] text-[#FBFBFB] leading-none">
            {unit === 'USD'
              ? formatBalance(totalPnL, { showCurrency: true, roundMode: 'floor' })
              : formatAmount(totalPnL / (nativeTokenPrice || 1), {
                  showCurrency: true,
                  unit: unit,
                  roundMode: 'floor',
                })}
          </div>
          <div className="mt-3 flex items-center gap-0.5 w-full">
            {winDays + lossDays === 0 ? (
              <div className="flex-1 h-1 w-full rounded-[200px] bg-[#79778C29]"></div>
            ) : (
              <>
                <div
                  className="h-1 rounded-[200px] bg-rise"
                  style={{ width: `${(winDays / (winDays + lossDays)) * 100}%` }}
                ></div>
                <div className="flex-1 h-1 rounded-[200px] bg-fall"></div>
              </>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between font-[450] text-[13px] leading-none">
            <div className="text-rise">
              {winDays}
              <span className="font-[330] text-[12px] text-[#6C6A74] leading-none">/</span>
              {unit === 'USD'
                ? formatBalance(winAmount, { showCurrency: true, roundMode: 'floor' })
                : formatAmount(winAmount / (nativeTokenPrice || 1), {
                    showCurrency: true,
                    unit: unit,
                    roundMode: 'floor',
                  })}
            </div>
            <div className="text-fall">
              {lossDays}
              <span className="font-[330] text-[12px] text-[#6C6A74] leading-none">/</span>
              {unit === 'USD'
                ? formatBalance(lossAmount, { showCurrency: true, roundMode: 'floor' })
                : formatAmount(lossAmount / (nativeTokenPrice || 1), {
                    showCurrency: true,
                    unit: unit,
                    roundMode: 'floor',
                  })}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2.5 justify-center min-h-[478px]">
            {dayInWeek.map((day) => (
              <div key={day} className="font-[380] text-[12px] text-[#FBFBFB] leading-none text-center mb-4">
                {day}
              </div>
            ))}
            {Array.from({ length: startDayOfWeek }).map((_, index) => (
              <div key={index} className="h-[80px] rounded-md bg-transparent" />
            ))}
            {refactorWalletPnl.map((item, index) => (
              <div
                key={index}
                className={`h-[80px] rounded-md p-3 flex flex-col ${
                  item.v > 0 ? 'bg-rise/10 text-rise' : item.v < 0 ? 'bg-fall/10 text-fall' : 'bg-[#79778C29]'
                }`}
              >
                <div className="font-[330] text-[15px] text-[#908E98] leading-none">
                  {dayjs.utc(item.t).format('D')}
                </div>
                <div
                  className={cn(
                    'flex-1 flex items-center justify-center font-[520] leading-none',
                    unit === 'USD' ? 'text-[16px]' : 'text-[12px]',
                  )}
                >
                  {unit === 'USD'
                    ? formatBalance(item.v, { showCurrency: true, roundMode: 'floor' })
                    : formatAmount(item.v / (nativeTokenPrice || 1), {
                        showCurrency: true,
                        unit: unit,
                        roundMode: 'floor',
                      })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2.5">
          <button className="bg-[#79778C29] px-4 py-2.5 rounded-lg text-[14px] text-[#FBFBFB]" onClick={() => onSave()}>
            <IconArrowDown className="inline size-4 mr-2 text-[#79778C]" />
            {t('button.download')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const ProfitMap = ({ portfolioStatistic }: any) => {
  const { t } = useTranslation()
  const data = useMemo(() => {
    return [
      {
        name: '>500%',
        color: '#21E09D',
        value:
          portfolioStatistic?.reduce((pnlGt5xNum: number, item: any) => pnlGt5xNum + (item?.pnlGt5xNum || 0), 0) || 0,
      },
      {
        name: '200% ~ 500%',
        color: '#14BB81',
        value:
          portfolioStatistic?.reduce(
            (pnl2xTo5xNum: number, item: any) => pnl2xTo5xNum + (item?.pnl2xTo5xNum || 0),
            0,
          ) || 0,
      },
      {
        name: '0% ~ 200%',
        color: '#00CE89',
        value:
          portfolioStatistic?.reduce((pnlLt2xNum: number, item: any) => pnlLt2xNum + (item?.pnlLt2xNum || 0), 0) || 0,
      },
      {
        name: '-50% ~ 0%',
        color: '#FD5E76',
        value:
          portfolioStatistic?.reduce(
            (pnlMinusDot5To0xNum: number, item: any) => pnlMinusDot5To0xNum + (item?.pnlMinusDot5To0xNum || 0),
            0,
          ) || 0,
      },
      {
        name: '< -50%',
        color: '#EA3B4F',
        value:
          portfolioStatistic?.reduce(
            (pnlLtMinusDot5Num: number, item: any) => pnlLtMinusDot5Num + (item?.pnlLtMinusDot5Num || 0),
            0,
          ) || 0,
      },
    ]
  }, [portfolioStatistic])

  const isZeroData = useMemo(() => {
    return data.every((item) => item.value === 0)
  }, [data])

  return (
    <div className="p-4 border-t border-[#79778C29]">
      <div className="font-[330] text-[13px] text-[#FBFBFB] leading-none">{t('assets.meme.statistics.profitMap')}</div>
      <div className="mt-4 h-[180px] flex items-center justify-center gap-3">
        <div className="w-[60%] flex items-center justify-center">
          {isZeroData ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <IconEmpty />
              <span className="text-[#FFFFFF80] text-[0.75rem] text-center max-w-[320px]">{t('history.nodata')}</span>
            </div>
          ) : (
            <ResponsiveContainer height={150} width="100%" className="relative">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={75}
                  stroke="none"
                  strokeWidth={0}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={data[index % data.length].color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    return (
                      <div className="bg-[#212127] rounded-md p-2 flex items-center gap-2">
                        <div
                          className="w-1 h-[30px] rounded-full"
                          style={{ background: payload?.[0]?.payload?.color }}
                        />
                        <div className="space-y-1.5">
                          <div className="font-[400] text-[14px] text-[#FBFBFB] leading-none">
                            {payload?.[0]?.payload?.name}
                          </div>
                          <div className="font-[400] text-[12px] text-[#FBFBFB] leading-none">
                            {payload?.[0]?.payload?.value?.toLocaleString('en-US')}
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex-1 flex items-center">
          <div className="space-y-2.5">
            {data.map((item) => (
              <div className="flex items-center gap-1" key={item.name}>
                <span className="size-2.5 rounded-full" style={{ background: item.color }} />
                <span className="font-[330] text-[12px] text-[#FBFBFB] leading-none">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const EquityCurve = ({ period, data }: { period: string; data: ChartItem[] }) => {
  const { t } = useTranslation()

  return (
    <div className="p-4 border-t border-[#79778C29]">
      <div className="font-[330] text-[13px] text-[#FBFBFB] leading-none">
        {t('assets.meme.statistics.equityCurve')}
      </div>
      <div className="mt-4 h-[280px] flex items-center justify-center">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <IconEmpty />
            <span className="text-[#FFFFFF80] text-[0.75rem] text-center max-w-[320px]">{t('history.nodata')}</span>
          </div>
        ) : (
          <ResponsiveContainer height="100%" width="100%" className="relative -ml-10">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#79778C29" />
              <XAxis
                dataKey="timestamp"
                tick={{
                  fontSize: 9,
                  fill: '#6C6A74',
                }}
                tickFormatter={(value) => formatTime(value, period)}
                axisLine={true}
                tickLine={true}
                interval={period === '1day' || period === '1month' ? 1 : 0}
              />
              <YAxis
                tick={{
                  fontSize: 9,
                  fill: '#6C6A74',
                }}
                tickFormatter={(value: number) =>
                  formatBalance(value, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })
                }
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  const timestamp = payload?.[0]?.payload?.timestamp
                  const balance = payload?.[0]?.payload?.balance
                  return (
                    <div className="bg-[#212127] rounded-md p-2 flex items-center gap-2">
                      <div className="space-y-1.5">
                        <div className="font-[400] text-[12px] text-[#79778C] leading-none">
                          {dayjs(timestamp).format('YYYY-MM-DD HH:mm')}
                        </div>
                        <div className="font-[330] text-[13px] text-[#FBFBFB] leading-none">
                          {formatBalance(balance, { showCurrency: true, roundMode: 'floor' })}
                        </div>
                      </div>
                    </div>
                  )
                }}
                cursor={<CustomCursor />}
              />
              <Area type="monotone" dataKey="balance" stroke="#843BEA" strokeWidth={2} fill="#703FE326" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

const periodMap: Record<string, WalletDuration> = {
  '1day': WalletDuration.D1,
  '1week': WalletDuration.W1,
  '1month': WalletDuration.M1,
  '1year': WalletDuration.Y1,
}

export const Statistics = ({ walletsByChain, wallet, chainId }: Props) => {
  const periods = [
    // { label: '24H', value: '1day' },
    { label: '7D', value: '1week' },
    { label: '30D', value: '1month' },
    { label: '1Y', value: '1year' },
  ]
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0].value)
  const [openDailyPnl, setOpenDailyPnl] = useState(false)
  const { collapsedData } = useAssetChart({
    chainId,
    walletAddress: wallet,
    duration: periodMap[selectedPeriod],
    unit: WalletBalanceUnit.Usd,
  })

  const walletsSelected = useMemo(() => {
    if (!wallet) return walletsByChain
    return walletsByChain.filter((item) => item.walletAddress === wallet)
  }, [wallet, chainId, walletsByChain])

  const duration = useMemo(() => {
    switch (selectedPeriod) {
      case '1day':
        return 1
      case '1week':
        return 7
      case '1month':
        return 30
      case '1year':
        return 365
      default:
        return 1
    }
  }, [selectedPeriod])

  const reqPortfolioStatistic = useMemo(() => {
    if (wallet && chainId) {
      return [
        {
          address: wallet,
          chain: mapChainIdToChainType(chainId),
          dayDuration: duration,
        },
      ]
    }
    return walletsByChain.map((item: UserEmbeddedWalletDto) => ({
      address: item?.walletAddress || '',
      chain: item?.chain,
      dayDuration: duration,
    }))
  }, [wallet, duration, walletsByChain])

  const { data: portfolioStatisticData } = useQuery(getPortfolioStatistic, {
    variables: {
      req: {
        smartMoneyDetailReqs: reqPortfolioStatistic,
      },
    },
    client: gqlMeme2,
    fetchPolicy: 'cache-first',
  })

  const portfolioStatistic = portfolioStatisticData?.getPortfolioStatistic

  return (
    <div className="pt-4 bg-[#141418] border border-[#79778C29] rounded-xl">
      <div className="px-4">
        <div className="inline-flex bg-[#18181B] rounded-md overflow-hidden">
          {periods.map((period) => (
            <span
              key={period.value}
              className={`px-3 py-1 rounded-md font-[330] text-[13px] leading-[20px] cursor-pointer ${selectedPeriod === period.value ? 'bg-[#79778C29] text-[#FBFBFB]' : 'text-[#6C6A74]'}`}
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </span>
          ))}
        </div>
      </div>
      <RealizedPnL period={selectedPeriod} walletsSelected={walletsSelected} setOpenDailyPnl={setOpenDailyPnl} />
      <DailyPnl walletsSelected={walletsSelected} open={openDailyPnl} onOpenChange={setOpenDailyPnl} />
      <ProfitMap portfolioStatistic={portfolioStatistic} />
      <EquityCurve period={selectedPeriod} data={collapsedData} />
    </div>
  )
}
