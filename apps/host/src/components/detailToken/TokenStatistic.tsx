import { TokenDetail, TotalTransactions } from '@/@generated/gql/graphql-core'
import { fShortenNumberv2 } from '@/lib/number.ts'
import { cn } from '@/lib/utils.ts'
import { TokenMarketStats } from '@/types/token.ts'
import { formatMoney, formatPercentage, getLaunchpad } from '@/utils/helpers.ts'
import LaunchPlatformIcon from '@components/common/Card/LaunchPlatformIcon.tsx'
import { useRealtimeTokenInfo } from '@hooks/useRealtimeTokenInfo.ts'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getDex } from '@/utils/lauchpad.ts'
import { formatPrice } from '@/lib/format.ts'

type TokenStatisticProps = {
  tokenData: TokenDetail
  tokenStatistic: TokenMarketStats
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

const numberFormat = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 2,
})

const formatPriceChange = (value: number): string => {
  const absValue = Math.abs(value)
  if (absValue >= 10_000_000_000_000_000n) if (absValue >= 10_000) return '9999T%'
  if (absValue >= 10_000) return formatPrice(absValue) + '%'
  return numberFormat.format(absValue) + '%'
}

const getPriceChange = (tokenStat: TokenMarketStats, tokenData: TokenDetail, timeFrame: TimeFrame): number => {
  switch (timeFrame) {
    case '5M':
      return Number(tokenStat?.price5mChange ?? 0) || Number(tokenData?.price5mChange ?? 0)
    case '1H':
      return Number(tokenStat?.price1hChange ?? 0) || Number(tokenData?.price1hChange ?? 0)
    case '6H':
      return Number(tokenStat?.price6hChange ?? 0) || Number(tokenData?.price6hChange ?? 0)
    default:
      return Number(tokenStat?.price24hChange ?? 0) || Number(tokenData?.price24hChange ?? 0)
  }
}

const getVolume = (tokenStat: TokenMarketStats, tokenData: TokenDetail, timeFrame: TimeFrame): number => {
  const totalAmount = tokenStat?.totalAmount || tokenData?.totalAmount
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

const getBuyAmount = (
  tokenStat: TokenMarketStats,
  tokenData: TokenDetail,
  timeFrame: TimeFrame,
): number | undefined => {
  const totalAmount = tokenStat?.totalAmount || tokenData?.totalAmount
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

const sellAmount = (tokenStat: TokenMarketStats, tokenData: TokenDetail, timeFrame: TimeFrame): number | undefined => {
  const totalAmount = tokenStat?.totalAmount || tokenData?.totalAmount
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

const getBuyTxs = (tokenStat: TokenMarketStats, tokenData: TokenDetail, timeFrame: TimeFrame): number | undefined => {
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

const getSellTxs = (tokenStat: TokenMarketStats, tokenData: TokenDetail, timeFrame: TimeFrame): number | undefined => {
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

const getBuyAddresses = (
  tokenStat: TokenMarketStats,
  tokenData: TokenDetail,
  timeFrame: TimeFrame,
): number | undefined => {
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

const getSellAddresses = (
  tokenStat: TokenMarketStats,
  tokenData: TokenDetail,
  timeFrame: TimeFrame,
): number | undefined => {
  const numberUniqueAddresses = tokenStat?.numberUniqueAddresses || tokenData?.numberUniqueAddresses
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
              {`${launchpadInfo?.label ?? launchpad} ${t('detail.tokenDetail.internalDisk')} ${progress !== 0 ? formatPercentage(Number(progress)) : '0%'}`}
            </span>
          </div>
          <div className="bg-[#ECECED1F] rounded-[200px] h-[6px] w-full mb-3">
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
  const { tokenData, tokenStatistic } = props
  const { t } = useTranslation()
  const [timeFrameSelected, setTimeFrameSelected] = useState<TimeFrame>('24H')

  const currentTimeFrame = useMemo<TimeFrameData>(() => {
    return {
      priceChange: getPriceChange(tokenStatistic, tokenData, timeFrameSelected),
      vol: getVolume(tokenStatistic, tokenData, timeFrameSelected),
      buyAmount: getBuyAmount(tokenStatistic, tokenData, timeFrameSelected),
      sellAmount: sellAmount(tokenStatistic, tokenData, timeFrameSelected),
      buyTransaction: getBuyTxs(tokenStatistic, tokenData, timeFrameSelected),
      sellTransaction: getSellTxs(tokenStatistic, tokenData, timeFrameSelected),
      buyAddress: getBuyAddresses(tokenStatistic, tokenData, timeFrameSelected),
      sellAddress: getSellAddresses(tokenStatistic, tokenData, timeFrameSelected),
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

  const priceChanges = useMemo(() => {
    return {
      '5M': getPriceChange(tokenStatistic, tokenData, '5M'),
      '1H': getPriceChange(tokenStatistic, tokenData, '1H'),
      '6H': getPriceChange(tokenStatistic, tokenData, '6H'),
      '24H': getPriceChange(tokenStatistic, tokenData, '24H'),
    }
  }, [tokenStatistic, tokenData])

  return (
    <div className="my-3">
      <ProgressSection tokenData={tokenData} />

      <div className="border border-[#25242b] rounded pb-2.5">
        <div className="grid grid-cols-4">
          {TIME_FRAME_OPTIONS.map((item, index) => (
            <div
              key={item + index}
              className={cn(
                'text-[12px] font-[400] text-center p-[6px] cursor-pointer',
                'border-r border-r-[#1b1b1e]',
                timeFrameSelected === item ? 'bg-[#18181d] text-white' : 'text-white/70',
              )}
              onClick={() => handleTimeFrameChange(item)}
            >
              <div>{item}</div>
              <div
                className={cn(
                  'mt-[6px]',
                  priceChanges[item] > -0.01 ? 'text-rise' : priceChanges[item] < 0.01 ? 'text-fall' : 'text-white',
                )}
              >
                {priceChanges[item] > 0.01 ? '+' : priceChanges[item] < -0.01 ? '-' : ''}
                {priceChanges[item] !== 0 ? formatPriceChange(priceChanges[item]) : '0%'}
              </div>
            </div>
          ))}
        </div>
        <div className="flex border-t botder-t-[#1b1b1e] pt-2">
          <div className="col-span-2 w-1/4 flex flex-col items-center justify-start border-r border-r-[#1b1b1e]">
            <div className="text-[11px] text-[#605e68] font-[330] leading-none text-center pt-2.5">
              {t('tokenData.statistic.volume')}
            </div>
            <div className="mt-1.5 text-[14px] text-white font-[330] leading-none">
              {currentTimeFrame.vol ? formatMoney(currentTimeFrame.vol) : '$0'}
            </div>
          </div>
          <div className="flex-1 px-2.5 pt-2.5">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <div className="text-[11px] text-[#605e68] font-[330] leading-none">
                  {t('tokenData.statistic.buyAmount')}
                </div>
                <div className="mt-2 text-[12px] text-white font-[330] leading-none">
                  {currentTimeFrame?.buyAmount ? formatMoney(currentTimeFrame.buyAmount) : '$0'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-[#605e68] font-[330] leading-none">
                  {t('tokenData.statistic.sellAmount')}
                </div>
                <div className="mt-2 text-[12px] text-white font-[330] leading-none">
                  {currentTimeFrame?.sellAmount ? formatMoney(currentTimeFrame.sellAmount) : '$0'}
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

        <div className="flex">
          <div className="col-span-2 w-1/4 pt-0.5 flex flex-col items-center justify-center border-r border-r-[#1b1b1e]">
            <div className="text-[11px] text-[#605e68] font-[330] leading-none text-center pt-2.5">
              {t('tokenData.statistic.transactions')}
            </div>
            <div className="mt-2 text-[12px] text-white font-[330] leading-none font-[330] leading-none">
              {totalTransactions ? fShortenNumberv2(totalTransactions) : 0}
            </div>
          </div>
          <div className="flex-1 pt-4 px-2.5">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <div className="text-[11px] text-[#605e68] font-[330] leading-none">
                  {t('tokenData.statistic.buyTransaction')}
                </div>
                <div className="mt-2 text-[12px] text-white font-[330] leading-none">
                  {currentTimeFrame.buyTransaction ? fShortenNumberv2(currentTimeFrame.buyTransaction) : 0}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-[#605e68] font-[330] leading-none">
                  {t('tokenData.statistic.sellTransaction')}
                </div>
                <div className="mt-2 text-[12px] text-white font-[330] leading-none">
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

        <div className=" flex">
          <div className="col-span-2 w-1/4 pt-0.5 flex flex-col items-center justify-center border-r border-r-[#1b1b1e]">
            <div className="text-[11px] text-[#605e68] font-[330] leading-none text-center pt-2.5">
              {t('tokenData.statistic.uniqueAddresses')}
            </div>
            <div className="mt-2 text-[12px] text-white font-[330] leading-none">
              {totalAddresses ? fShortenNumberv2(totalAddresses) : '0'}
            </div>
          </div>
          <div className="flex-1 pt-4 px-2.5">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <div className="text-[11px] text-[#605e68] font-[330] leading-none">
                  {t('tokenData.statistic.buyAddresses')}
                </div>
                <div className="mt-2 text-[12px] text-white font-[330] leading-none">
                  {currentTimeFrame?.buyAddress ? fShortenNumberv2(currentTimeFrame.buyAddress) : '0'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-[#605e68] font-[330] leading-none">
                  {t('tokenData.statistic.sellAddresses')}
                </div>
                <div className="mt-2 text-[12px] text-white font-[330] leading-none">
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
