import { TokenDetail, TotalTransactions } from '@/@generated/gql/graphql-core'
import { formatPercent, formatVolume } from '@/lib/format'
import { fShortenNumberv2 } from '@/lib/number.ts'
import { cn } from '@/lib/utils.ts'
import { getLaunchpad } from '@/utils/helpers.ts'
import { getDex } from '@/utils/lauchpad.ts'
import LaunchPlatformIcon from '@components/common/Card/LaunchPlatformIcon.tsx'
import { useRealtimeTokenInfo } from '@hooks/useRealtimeTokenInfo.ts'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTokenStatisticSubscription } from '@hooks/meme/useTokenStatisticSubscription.ts'
import { TokenStatisticMqttPayload } from '@/types/mqtt/TokenStatisticMqttPayload.ts'

type TokenStatisticProps = {
  tokenData: TokenDetail
}

type TimeFrameData = Partial<{
  priceChange: number
  vol: number
  buyAmount: number
  sellAmount: number
  buyTransaction: number
  sellTransaction: number
  buyAddress: number
  sellAddress: number
}>

const TIME_FRAME_OPTIONS = ['5M', '1H', '6H', '24H'] as const
type TimeFrame = (typeof TIME_FRAME_OPTIONS)[number]

const getPriceChange = (options: {
  tokenStatistic?: TokenStatisticMqttPayload
  tokenData: TokenDetail
  timeFrame: TimeFrame
}): number => {
  const { tokenStatistic, tokenData, timeFrame } = options
  switch (timeFrame) {
    case '5M':
      return Number(tokenStatistic?.price5mChange ?? tokenData?.price5mChange ?? 0)
    case '1H':
      return Number(tokenStatistic?.price1hChange ?? tokenData?.price1hChange ?? 0)
    case '6H':
      return Number(tokenStatistic?.price6hChange ?? tokenData?.price6hChange ?? 0)
    default:
      return Number(tokenStatistic?.price24hChange ?? tokenData?.price24hChange ?? 0)
  }
}

const getVolume = (options: {
  tokenStatistic?: TokenStatisticMqttPayload
  tokenData: TokenDetail
  timeFrame: TimeFrame
}): number => {
  const { tokenStatistic, tokenData, timeFrame } = options
  const totalAmount = tokenStatistic?.totalAmount || tokenData?.totalAmount
  switch (timeFrame) {
    case '5M':
      return Number(totalAmount?.totalBuyAmount5m || 0) + Number(totalAmount?.totalSellAmount5m || 0)
    case '1H':
      return Number(totalAmount?.totalBuyAmount1h || 0) + Number(totalAmount?.totalSellAmount1h || 0)
    case '6H':
      return Number(totalAmount?.totalBuyAmount6h || 0) + Number(totalAmount?.totalSellAmount6h || 0)
    default:
      return Number(totalAmount?.totalBuyAmount24h || 0) + Number(totalAmount?.totalSellAmount24h || 0)
  }
}

const getField = <T,>(data: T | undefined | null, field: keyof T): number | undefined => {
  if (!data) return undefined
  const value = data[field]
  if (value === undefined || value === null) return undefined
  return Number(value)
}

const getBuyAmount = (options: {
  tokenStatistic?: TokenStatisticMqttPayload
  tokenData: TokenDetail
  timeFrame: TimeFrame
}): number | undefined => {
  const { tokenStatistic, tokenData, timeFrame } = options
  const totalAmount = tokenStatistic?.totalAmount || tokenData?.totalAmount
  switch (timeFrame) {
    case '5M':
      return totalAmount?.totalBuyAmount5m ? Number(+totalAmount.totalBuyAmount5m) : undefined
    case '1H':
      return totalAmount?.totalBuyAmount1h ? Number(+totalAmount.totalBuyAmount1h) : undefined
    case '6H':
      return totalAmount?.totalBuyAmount6h ? Number(+totalAmount.totalBuyAmount6h) : undefined
    default:
      return totalAmount?.totalBuyAmount24h ? Number(+totalAmount.totalBuyAmount24h) : undefined
  }
}

const sellAmount = (options: {
  tokenStatistic?: TokenStatisticMqttPayload
  tokenData: TokenDetail
  timeFrame: TimeFrame
}): number | undefined => {
  const { tokenStatistic, tokenData, timeFrame } = options
  const totalAmount = tokenStatistic?.totalAmount || tokenData?.totalAmount
  switch (timeFrame) {
    case '5M':
      return totalAmount?.totalSellAmount5m !== undefined ? Number(+totalAmount.totalSellAmount5m) : undefined
    case '1H':
      return totalAmount?.totalSellAmount1h !== undefined ? Number(+totalAmount.totalSellAmount1h) : undefined
    case '6H':
      return totalAmount?.totalSellAmount6h !== undefined ? Number(+totalAmount.totalSellAmount6h) : undefined
    default:
      return totalAmount?.totalSellAmount24h !== undefined ? Number(+totalAmount.totalSellAmount24h) : undefined
  }
}

const getBuyTxs = (options: {
  tokenStatistic?: TokenStatisticMqttPayload
  tokenData: TokenDetail
  timeFrame: TimeFrame
}): number | undefined => {
  const { tokenStatistic: tokenStat, tokenData, timeFrame } = options
  const txs: TotalTransactions | undefined | null = tokenStat?.totalTransactions || tokenData?.totalTransactions
  switch (timeFrame) {
    case '5M':
      return getField(txs, 'numberOfPurchases5m')
    case '1H':
      return getField(txs, 'numberOfPurchases1h')
    case '6H':
      return getField(txs, 'numberOfPurchases6h')
    default:
      return getField(txs, 'numberOfPurchases24h')
  }
}

const getSellTxs = (options: {
  tokenStatistic?: TokenStatisticMqttPayload
  tokenData: TokenDetail
  timeFrame: TimeFrame
}): number | undefined => {
  const { tokenStatistic: tokenStat, tokenData, timeFrame } = options
  const txs = tokenStat?.totalTransactions || tokenData?.totalTransactions
  switch (timeFrame) {
    case '5M':
      return getField(txs, 'numberOfSales5m')
    case '1H':
      return getField(txs, 'numberOfSales1h')
    case '6H':
      return getField(txs, 'numberOfSales6h')
    default:
      return getField(txs, 'numberOfSales24h')
  }
}

const getBuyAddresses = (options: {
  tokenStatistic?: TokenStatisticMqttPayload
  tokenData: TokenDetail
  timeFrame: TimeFrame
}): number | undefined => {
  const { tokenStatistic: tokenStat, tokenData, timeFrame } = options
  const numberUniqueAddresses = tokenStat?.numberUniqueAddresses || tokenData?.numberUniqueAddresses
  switch (timeFrame) {
    case '5M':
      return numberUniqueAddresses?.numberOfBuyAddress5m
        ? Number(+numberUniqueAddresses.numberOfBuyAddress5m)
        : undefined
    case '1H':
      return numberUniqueAddresses?.numberOfBuyAddress1h
        ? Number(+numberUniqueAddresses.numberOfBuyAddress1h)
        : undefined
    case '6H':
      return numberUniqueAddresses?.numberOfBuyAddress6h
        ? Number(+numberUniqueAddresses.numberOfBuyAddress6h)
        : undefined
    default: {
      return numberUniqueAddresses?.numberOfBuyAddress24h
        ? Number(+numberUniqueAddresses.numberOfBuyAddress24h)
        : undefined
    }
  }
}

const getSellAddresses = (options: {
  tokenStatistic?: TokenStatisticMqttPayload
  tokenData: TokenDetail
  timeFrame: TimeFrame
}): number | undefined => {
  const { tokenStatistic, tokenData, timeFrame } = options
  const numberUniqueAddresses = tokenStatistic?.numberUniqueAddresses || tokenData?.numberUniqueAddresses
  switch (timeFrame) {
    case '5M':
      return numberUniqueAddresses?.numberOfSellAddress5m
        ? Number(+numberUniqueAddresses.numberOfSellAddress5m)
        : undefined
    case '1H':
      return numberUniqueAddresses?.numberOfSellAddress1h
        ? Number(+numberUniqueAddresses.numberOfSellAddress1h)
        : undefined
    case '6H':
      return numberUniqueAddresses?.numberOfSellAddress6h
        ? Number(+numberUniqueAddresses.numberOfSellAddress6h)
        : undefined
    default:
      return numberUniqueAddresses?.numberOfSellAddress24h
        ? Number(+numberUniqueAddresses.numberOfSellAddress24h)
        : undefined
  }
}

const ProgressSection = (props: { tokenData?: TokenDetail }) => {
  const { tokenData } = props
  const { t } = useTranslation()
  const launchpad = getLaunchpad(tokenData?.dexes ?? [])
  const launchpadInfo = launchpad ? getDex(launchpad) : null
  const realtimeTokenInfo = useRealtimeTokenInfo(tokenData?.address)

  const progress = useMemo(() => {
    if (!realtimeTokenInfo) return Number(tokenData?.internalMarketProgress ?? 0)
    const progress = Number(realtimeTokenInfo.internalMarketProgress ?? tokenData?.internalMarketProgress ?? 0)
    return Math.max(0, Math.min(progress, 100))
  }, [realtimeTokenInfo, tokenData])

  const shouldShowProgress = useMemo(() => {
    const isMigrated = tokenData?.isMigrated
    if (!launchpad) return false // No launchpad, no progress section
    if (progress >= 100 && isMigrated) return false // If progress is 100% and token is migrated, no need to show
    return true // Show progress section if launchpad exists and progress is less than 100% or token is not migrated
  }, [realtimeTokenInfo, tokenData, launchpad])

  return (
    <>
      {shouldShowProgress && (
        <>
          <div className="flex items-center gap-[1px]">
            <LaunchPlatformIcon value={launchpad ?? ''} />
            <span className="text-[12px] leading-[1]  text-white/70 ml-1">
              {`${launchpadInfo?.label ?? launchpad} ${t('detail.tokenDetail.internalDisk')} ${progress !== 0 ? formatPercent(Number(progress)) : '0%'}`}
            </span>
          </div>
          <div className="bg-[#ECECED1F] rounded-[200px] h-[6px] w-full">
            <div
              className="mt-[10px] bg-[linear-gradient(90deg,#FF425C_0%,#FFFC48_60%,#00F7A5_100%)] rounded-[200px] h-[6px] w-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}
    </>
  )
}

const TokenStatistic = (props: TokenStatisticProps) => {
  const { tokenData } = props
  // const tokenStatistic = useTokenPriceInfo(tokenData?.address || '')
  const tokenStatistic = useTokenStatisticSubscription({
    token: tokenData?.address || '',
    keys: [
      'totalAmount',
      'totalTransactions',
      'numberUniqueAddresses',
      'price1mChange',
      'price5mChange',
      'price1hChange',
      'price6hChange',
      'price24hChange',
    ],
  })
  const { t } = useTranslation()
  const [timeFrameSelected, setTimeFrameSelected] = useState<TimeFrame>('24H')

  const currentTimeFrame = useMemo<TimeFrameData>(() => {
    const params = { tokenStatistic, tokenData, timeFrame: timeFrameSelected }
    return {
      priceChange: getPriceChange(params),
      vol: getVolume(params),
      buyAmount: getBuyAmount(params),
      sellAmount: sellAmount(params),
      buyTransaction: getBuyTxs(params),
      sellTransaction: getSellTxs(params),
      buyAddress: getBuyAddresses(params),
      sellAddress: getSellAddresses(params),
    }
  }, [tokenStatistic, timeFrameSelected, tokenData])

  const handleTimeFrameChange = (timeFrame: TimeFrame) => {
    setTimeFrameSelected(timeFrame)
  }

  const amountRatio = (): string => {
    const buy = currentTimeFrame.buyAmount
    const sell = currentTimeFrame.sellAmount
    if (!buy && !sell) return '0%'
    if (!buy) return '0%'
    if (!sell) return '100%'
    const ratio = (buy / (buy + sell)) * 100
    return `${Math.round(ratio)}%`
  }

  const transactionsRatio = (): string => {
    const buy = currentTimeFrame.buyTransaction
    const sell = currentTimeFrame.sellTransaction
    if (!buy && !sell) return '0%'
    if (!buy) return '0%'
    if (!sell) return '100%'
    const ratio = (buy / (buy + sell)) * 100
    return `${Math.round(ratio)}%`
  }

  const addressesRatio = (): string => {
    const buy = currentTimeFrame.buyAddress
    const sell = currentTimeFrame.sellAddress
    if (!buy && !sell) return '0%'
    if (!buy) return '0%'
    if (!sell) return '100%'
    const ratio = (buy / (buy + sell)) * 100
    return `${Math.round(ratio)}%`
  }

  const totalTransactions = useMemo(() => {
    const buyTxs = currentTimeFrame.buyTransaction ?? 0
    const sellTxs = currentTimeFrame.sellTransaction ?? 0
    return buyTxs + sellTxs
  }, [currentTimeFrame])

  // const totalAmount = useMemo(() => {
  //   if (!currentTimeFrame.buyAmount && !currentTimeFrame.sellAmount) return undefined
  //   if (!currentTimeFrame.buyAmount) return currentTimeFrame.sellAmount
  //   if (!currentTimeFrame.sellAmount) return currentTimeFrame.buyAmount
  //   return currentTimeFrame.buyAmount + currentTimeFrame.sellAmount
  // }, [currentTimeFrame])

  const totalAddresses = useMemo(() => {
    if (!currentTimeFrame.buyAddress && !currentTimeFrame.sellAddress) return undefined
    if (!currentTimeFrame.buyAddress) return currentTimeFrame.sellAddress
    if (!currentTimeFrame.sellAddress) return currentTimeFrame.buyAddress
    return currentTimeFrame.buyAddress + currentTimeFrame.sellAddress
  }, [currentTimeFrame])

  const netVol = useMemo(() => {
    const buy = currentTimeFrame.buyAmount || 0
    const sell = currentTimeFrame.sellAmount || 0
    return buy - sell
  }, [currentTimeFrame])

  const priceChanges = useMemo(() => {
    return {
      '5M': getPriceChange({ tokenStatistic, tokenData, timeFrame: '5M' }),
      '1H': getPriceChange({ tokenStatistic, tokenData, timeFrame: '1H' }),
      '6H': getPriceChange({ tokenStatistic, tokenData, timeFrame: '6H' }),
      '24H': getPriceChange({ tokenStatistic, tokenData, timeFrame: '24H' }),
    }
  }, [tokenStatistic, tokenData])

  // useEffect(() => {
  //   // console.log('tokenStatistic', tokenStatistic)
  //   console.table(tokenStatistic)
  // }, [tokenStatistic])

  return (
    <div className="mt-2.5">
      <ProgressSection tokenData={tokenData} />
      <div className="mt-2.5 border-[0.5px] border-[#ECECED1F] rounded-[4px] pb-2.5 overflow-hidden">
        <div className="grid grid-cols-4">
          {TIME_FRAME_OPTIONS.map((item, index) => (
            <div
              key={item + index}
              className={cn(
                'text-[12px] font-[330] text-center p-[6px] cursor-pointer',
                'border-r border-r-[#ECECED1F] last:!border-r-0',
                timeFrameSelected === item ? 'bg-[#ECECED14] text-white' : 'text-white/50',
              )}
              onClick={() => handleTimeFrameChange(item)}
            >
              <div>{item}</div>
              <div
                className={cn(
                  'mt-1.5',
                  priceChanges[item] > -0.01 ? 'text-rise' : priceChanges[item] < 0.01 ? 'text-fall' : 'text-white',
                )}
              >
                {priceChanges[item] > 0.01 ? '+' : ''}
                {priceChanges[item] !== 0 ? formatPercent(priceChanges[item]) : '0%'}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-t-[#ECECED1F] py-2">
          {/* <div className="border-r border-t-[#ECECED1F] px-2">
            <div className="font-[330] text-[12px] text-white/50 text-center">{t('tokenData.statistic.amount')}</div>
            <div className="mt-1.5 font-[330] text-[12px] text-center text-rise">
              {formatAmount(totalAmount, {
                showCurrency: true,
              })}
            </div>
          </div> */}
          <div className="px-2 mx-auto">
            <div className="font-[330] text-[12px] text-white/50 text-center">{t('tokenData.statistic.netVol')}</div>
            <div
              className={cn(
                'mt-1.5 font-[330] text-[12px] text-center text-white',
                netVol > 0 ? 'text-rise' : netVol < 0 ? 'text-fall' : 'text-white/50',
              )}
            >
              {formatVolume(netVol, {
                showCurrency: true,
              })}
            </div>
          </div>
        </div>
        <div className="gap-2.5 pt-3 flex border-t botder-t-[#ECECED1F] pr-2.5">
          <div className="col-span-2 w-1/4 flex flex-col items-center justify-start border-r border-r-[#ECECED1F]">
            <div className="font-[330] text-[12px] text-white/50 text-center">{t('tokenData.statistic.volume')}</div>
            <div className="mt-1.5 font-[380] text-[12px] text-white">
              {currentTimeFrame.vol
                ? formatVolume(currentTimeFrame.vol, {
                    showCurrency: true,
                  })
                : '$0'}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <div className="font-[330] text-[12px] text-white/50">{t('tokenData.statistic.buyAmount')}</div>
                <div className="mt-2 font-[380] text-[12px] text-white">
                  {currentTimeFrame?.buyAmount
                    ? formatVolume(currentTimeFrame.buyAmount, {
                        showCurrency: true,
                      })
                    : '$0'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-[330] text-[12px] text-white/50">{t('tokenData.statistic.sellAmount')}</div>
                <div className="mt-2 font-[380] text-[12px] text-white">
                  {currentTimeFrame?.sellAmount
                    ? formatVolume(currentTimeFrame.sellAmount, {
                        showCurrency: true,
                      })
                    : '$0'}
                </div>
              </div>
            </div>
            <div className=" mt-[6px] w-full h-[6px] bg-fall flex rounded-full overflow-hidden">
              <div
                className="relative h-full bg-rise"
                style={{
                  width: `${amountRatio()}`,
                }}
              >
                <div className="absolute -right-[1px] top-0 h-full w-[2px] bg-black transform -skew-x-20"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="gap-2.5 flex pr-2.5">
          <div className="col-span-2 w-1/4 pt-4 flex flex-col items-center justify-center border-r border-r-[#ECECED1F]">
            <div className="font-[330] text-[12px] text-white/50 text-center">
              {t('tokenData.statistic.transactions')}
            </div>
            <div className="mt-2 font-[380] text-[12px] text-white">
              {totalTransactions ? fShortenNumberv2(totalTransactions) : 0}
            </div>
          </div>
          <div className="flex-1 pt-4">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <div className="font-[330] text-[12px] text-white/50">{t('tokenData.statistic.buyTransaction')}</div>
                <div className="mt-2 font-[380] text-[12px] text-white">
                  {currentTimeFrame.buyTransaction ? fShortenNumberv2(currentTimeFrame.buyTransaction) : 0}
                </div>
              </div>
              <div className="text-right">
                <div className="font-[330] text-[12px] text-white/50">{t('tokenData.statistic.sellTransaction')}</div>
                <div className="mt-2 font-[380] text-[12px] text-white">
                  {currentTimeFrame.sellTransaction ? fShortenNumberv2(currentTimeFrame.sellTransaction) : 0}
                </div>
              </div>
            </div>
            <div className=" mt-[6px] w-full h-[6px] bg-fall flex rounded-full overflow-hidden">
              <div
                className="relative h-full bg-rise"
                style={{
                  width: transactionsRatio(),
                }}
              >
                <div className="absolute -right-[1px] top-0 h-full w-[2px] bg-black transform -skew-x-20"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="gap-[10px] flex pr-2.5">
          <div className="col-span-2 w-1/4 pt-4 flex flex-col items-center justify-center border-r border-r-[#ECECED1F]">
            <div className="font-[330] text-[12px] text-white/50 text-center">
              {t('tokenData.statistic.uniqueAddresses')}
            </div>
            <div className="mt-2 font-[380] text-[12px] text-white">
              {totalAddresses ? fShortenNumberv2(totalAddresses) : '0'}
            </div>
          </div>
          <div className="flex-1 pt-4 ">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <div className="font-[330] text-[12px] text-white/50">{t('tokenData.statistic.buyAddresses')}</div>
                <div className="mt-2 font-[380] text-[12px] text-white">
                  {currentTimeFrame?.buyAddress ? fShortenNumberv2(currentTimeFrame.buyAddress) : '0'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-[330] text-[12px] text-white/50">{t('tokenData.statistic.sellAddresses')}</div>
                <div className="mt-2 font-[380] text-[12px] text-white">
                  {currentTimeFrame?.sellAddress ? fShortenNumberv2(currentTimeFrame.sellAddress) : '0'}
                </div>
              </div>
            </div>
            <div className=" mt-[6px] w-full bg-fall h-[6px] flex rounded-full overflow-hidden">
              <div
                className="relative h-full bg-rise"
                style={{
                  width: addressesRatio(),
                }}
              >
                <div className="absolute -right-[1px] top-0 h-full w-[2px] bg-black transform -skew-x-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenStatistic
