import { TokenDetail, TotalTransactions } from '@/@generated/gql/graphql-core'
import { TokenInsightDto } from '@/@generated/gql/graphql-meme2'
import { EVENT_MESSAGE_OHLC_UPDATED } from '@/datafeeds/dataUpdater.ts'
import eventBus from '@/lib/eventBus.ts'
import { formatPercent, formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils'
import { TradeTabState } from '@/redux/modules/tradeTab.slice'
import { RootState, useAppSelector } from '@/redux/store'
import { TokenMarketStats } from '@/types/token.ts'
import { formatDecimalNumber, trimTrailingZeros } from '@/utils/helpers'
import { useTokenInfoSubscription } from '@hooks/useTokenInfoSubscription.ts'
import { useTokenPriceInfo } from '@hooks/useTokenPrice.ts'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface props {
  tokenData: TokenDetail
  tokenInsight: TokenInsightDto
}

interface DataItem {
  label: string
  value: string | number | React.ReactNode
  unit?: string
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

const getPriceChange = (tokenStat: TokenMarketStats, tokenData: TokenDetail, timeFrame: TimeFrame): number => {
  switch (timeFrame) {
    case '5M':
      return Number(tokenStat.price5mChange ?? 0) || Number(tokenData?.price5mChange ?? 0)
    case '1H':
      return Number(tokenStat.price1hChange ?? 0) || Number(tokenData?.price1hChange ?? 0)
    case '6H':
      return Number(tokenStat.price6hChange ?? 0) || Number(tokenData?.price6hChange ?? 0)
    default:
      return Number(tokenStat.price24hChange ?? 0) || Number(tokenData?.price24hChange ?? 0)
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

const calculateTop10 = (tokenData?: TokenDetail, tokenInsight?: TokenInsightDto) => {
  if (!tokenData || !tokenInsight || tokenInsight?.top10Holder === null) return '--'
  if (tokenInsight && tokenInsight.top10Holder) {
    const top10Holder = tokenInsight.top10Holder
    const circulatingSupply = Number(tokenData.circulatingSupply || tokenData.totalSupply || 0)
    const ratio = (top10Holder / circulatingSupply) * 100
    return formatPercent(ratio)
  } else {
    const top10Holder = tokenData?.top10HolderRate
    return formatPercent(top10Holder ?? 0)
  }
}

const calculateDevHold = (tokenData?: TokenDetail, tokenInsight?: TokenInsightDto) => {
  if (!tokenData || !tokenInsight || tokenInsight?.DevHold === null) return '--'
  const devHold = tokenInsight?.DevHold
  const circulatingSupply = Number(tokenData.circulatingSupply || tokenData.totalSupply || 0)
  if (devHold === 0) return '0%'
  const ratio = (devHold / circulatingSupply) * 100
  return formatPercent(ratio)
}

const calculateSnipers = (tokenData?: TokenDetail, tokenInsight?: TokenInsightDto) => {
  if (!tokenData || !tokenInsight || tokenInsight?.Sniper === null) return '--'
  const snipers = tokenInsight?.Sniper
  const circulatingSupply = Number(tokenData.circulatingSupply || tokenData.totalSupply || 0)
  if (snipers === 0) return '0%'
  const ratio = (snipers / circulatingSupply) * 100
  return formatPercent(ratio)
}

const calculateInsiders = (tokenData?: TokenDetail, tokenInsight?: TokenInsightDto) => {
  if (!tokenData || !tokenInsight || tokenInsight?.Insider === null) return '--'
  const insiders = tokenInsight?.Insider
  const circulatingSupply = Number(tokenData.circulatingSupply || tokenData.totalSupply || 0)
  if (insiders === 0) return '0%'
  const ratio = (insiders / circulatingSupply) * 100
  return formatPercent(ratio)
}

const calculateBundler = (tokenData?: TokenDetail, tokenInsight?: TokenInsightDto) => {
  if (!tokenData || !tokenInsight || tokenInsight?.Bundler === null) return '--'
  const bundlers = tokenInsight?.Bundler
  const circulatingSupply = Number(tokenData.circulatingSupply || tokenData.totalSupply || 0)
  if (bundlers === 0) return '0%'
  const ratio = (bundlers / circulatingSupply) * 100
  return formatPercent(ratio)
}
const calculateLPBurned = (tokenData?: TokenDetail, tokenInsight?: TokenInsightDto) => {
  if (!tokenData || !tokenInsight || tokenInsight?.LPBurned === null) return '--'
  const lpBurned = tokenInsight?.LPBurned
  const lpMint = tokenInsight?.LPMint
  if (lpBurned === 0) return '0%'
  const ratio = (lpMint / lpBurned) * 100
  return formatPercent(ratio)
}

const TopInfo = ({ tokenData, tokenInsight }: props) => {
  // const bannerUrl = tokenData?.info?.bannerUrl
  const { holderCount, top10Holder, insiderPct, bundlePct } = useAppSelector(
    (state: RootState) => state.tradeTab as TradeTabState,
  )
  const { t } = useTranslation()
  const tokenStatistic = useTokenPriceInfo(tokenData?.address || '')
  const [currentPrice, setCurrentPrice] = useState(0)
  // const [showSelectTimeFrame, setShowSelectTimeFrame] = useState(false)
  const [timeFrameSelected] = useState<TimeFrame>('24H')
  const tokenInfo = useTokenInfoSubscription({
    token: tokenData?.address || '',
    useTopic: 'token_info',
    totalSupply: Number(tokenData?.totalSupply || 0),
  })

  useEffect(() => {
    if (tokenData?.price) {
      setCurrentPrice(tokenData.price)
    }
  }, [tokenData])

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_OHLC_UPDATED, (data: any) => {
      if (data?.data) {
        setCurrentPrice(data?.data.close)
      }
    })
    return () => {
      eventBus.remove(EVENT_MESSAGE_OHLC_UPDATED)
    }
  }, [])

  const mergedTokenData = useMemo(() => {
    if (!tokenStatistic) return tokenData
    return {
      ...tokenData,
      ...tokenStatistic,
      marketCap: tokenStatistic.marketcap || tokenData?.marketCap,
      holders: tokenStatistic.numberOfHolder || tokenData?.holders,
      price: currentPrice || tokenData?.price,
      liquidity: Number(tokenStatistic.liquidity ?? 0) || Number(tokenData?.liquidity ?? 0),
      createdTime: tokenStatistic.createdTime || tokenData?.createdTime,
      chainId: tokenData?.chainId,
    } as TokenDetail
  }, [tokenData, tokenStatistic, currentPrice])

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

  // const handleTimeFrameChange = (timeFrame: TimeFrame) => {
  //   setTimeFrameSelected(timeFrame)
  // }

  const amountRatio = (): string => {
    const buy = currentTimeFrame.buyAmount
    const sell = currentTimeFrame.sellAmount
    if (!buy && !sell) return '0%'
    if (!buy) return '0%'
    if (!sell) return '100%'
    const ratio = (buy / (buy + sell)) * 100
    return `${Math.round(ratio)}%`
  }

  // const transactionsRatio = (): string => {
  //   const buy = currentTimeFrame.buyTransaction
  //   const sell = currentTimeFrame.sellTransaction
  //   if (!buy && !sell) return '0%'
  //   if (!buy) return '0%'
  //   if (!sell) return '100%'
  //   const ratio = (buy / (buy + sell)) * 100
  //   return `${Math.round(ratio)}%`
  // }

  // const addressesRatio = (): string => {
  //   const buy = currentTimeFrame.buyAddress
  //   const sell = currentTimeFrame.sellAddress
  //   if (!buy && !sell) return '0%'
  //   if (!buy) return '0%'
  //   if (!sell) return '100%'
  //   const ratio = (buy / (buy + sell)) * 100
  //   return `${Math.round(ratio)}%`
  // }

  // const totalTransactions = useMemo(() => {
  //   const buyTxs = currentTimeFrame.buyTransaction ?? 0
  //   const sellTxs = currentTimeFrame.sellTransaction ?? 0
  //   return buyTxs + sellTxs
  // }, [currentTimeFrame])

  // const totalAddresses = useMemo(() => {
  //   if (!currentTimeFrame.buyAddress && !currentTimeFrame.sellAddress) return undefined
  //   if (!currentTimeFrame.buyAddress) return currentTimeFrame.sellAddress
  //   if (!currentTimeFrame.sellAddress) return currentTimeFrame.buyAddress
  //   return currentTimeFrame.buyAddress + currentTimeFrame.sellAddress
  // }, [currentTimeFrame])

  // const priceChanges = useMemo(() => {
  //   return {
  //     '5M': getPriceChange(tokenStatistic, tokenData, '5M'),
  //     '1H': getPriceChange(tokenStatistic, tokenData, '1H'),
  //     '6H': getPriceChange(tokenStatistic, tokenData, '6H'),
  //     '24H': getPriceChange(tokenStatistic, tokenData, '24H'),
  //   }
  // }, [tokenStatistic, tokenData])

  const holdersLabelSuffix = useMemo(() => {
    const { decimal, integer, suffix } = formatDecimalNumber(holderCount, 2, 4, 'floor')
    if (holderCount <= 0) return ''
    const decimalPart = decimal
      ? `${integer}${decimal ? '.' : ''}${trimTrailingZeros(decimal.toString())}`
      : `${integer}`
    return ` ${decimalPart}${suffix ?? ''}`
  }, [holderCount, trimTrailingZeros])

  const top10Value = useMemo(() => {
    if (top10Holder) {
      const value = Math.min(Math.max(top10Holder ?? 0, 0), 100)
      return formatPercent(value)
    }
    if (tokenInfo?.top10HolderPercentage) {
      return formatPercent(tokenInfo?.top10HolderPercentage)
    }
    return calculateTop10(mergedTokenData, tokenInsight)
  }, [top10Holder, tokenInfo?.top10HolderPercentage, mergedTokenData, tokenInsight])

  const insiderValue = useMemo(() => {
    if (insiderPct) {
      const value = Math.min(100, Math.max(0, +insiderPct * 100))
      return formatPercent(value)
    }
    if (tokenInfo?.insiderTradingPercentage) {
      return formatPercent(tokenInfo?.insiderTradingPercentage)
    }
    return calculateInsiders(mergedTokenData, tokenInsight)
  }, [insiderPct, tokenInfo?.insiderTradingPercentage, mergedTokenData, tokenInsight])

  const bundleValue = useMemo(() => {
    if (bundlePct) {
      const value = Math.min(100, Math.max(0, +bundlePct * 100))
      return formatPercent(value)
    }
    if (tokenInfo?.bundlerHoldingPercentage) {
      return formatPercent(tokenInfo?.bundlerHoldingPercentage)
    }
    return calculateBundler(mergedTokenData, tokenInsight)
  }, [bundlePct, tokenInfo?.bundlerHoldingPercentage, mergedTokenData, tokenInsight])

  const mapData = useMemo<DataItem[]>(() => {
    if (!mergedTokenData) return []

    return [
      {
        label: t('tokenData.top10'),
        value: top10Value,
      },
      {
        label: t('tokenData.devHold'),
        value: tokenInfo?.devHoldingPercentage
          ? formatPercent(tokenInfo.devHoldingPercentage)
          : calculateDevHold(mergedTokenData, tokenInsight),
      },
      {
        label: t('tokenData.holders'),
        value: holdersLabelSuffix,
        // value: tokenInfo?.numberOfHolders
        //   ? tokenInfo.numberOfHolders
        //   : tokenInsight?.Holders
        //     ? formatMoney(tokenInsight.Holders, false)
        //     : mergedTokenData?.holders
        //       ? formatMoney(mergedTokenData.holders, false)
        //       : '--',
      },
      {
        label: t('tokenData.snipers'),
        value: tokenInfo?.sniperHoldingPercentage
          ? formatPercent(tokenInfo.sniperHoldingPercentage)
          : calculateSnipers(mergedTokenData, tokenInsight),
      },
      {
        label: t('tokenData.insiders'),
        value: insiderValue,
      },
      {
        label: t('tokenData.bundler'),
        value: bundleValue,
      },
      {
        label: t('tokenData.lpBurned'),
        value: calculateLPBurned(mergedTokenData, tokenInsight),
      },
      {
        label: t('tokenData.dexPaid'),
        value: tokenInsight?.DexPaid ?? '--',
      },
    ]
  }, [tokenData, mergedTokenData, tokenInsight, t, tokenInfo, holdersLabelSuffix])

  const netVol = useMemo(() => {
    const buy = currentTimeFrame.buyAmount || 0
    const sell = currentTimeFrame.sellAmount || 0
    return buy - sell
  }, [currentTimeFrame])

  return (
    <div>
      {/* {!!bannerUrl && (
        <img
          src={bannerUrl as string}
          className="w-full h-full object-cover rounded-[8px] max-h-[300px] mb-4"
          alt="banner"
        />
      )} */}
      <div>
        <div className="flex items-center justify-between gap-1">
          <div className="flex flex-col items-start gap-1.5">
            <div className="font-[330] text-[13px] text-white/80 leading-none">{t('detail.topInfo.vol24h')}</div>
            <div className="font-[338] text-[14px] text-white/80 leading-none">
              {formatVolume(currentTimeFrame.vol, {
                showCurrency: true,
              })}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="font-[330] text-[13px] text-white/50 leading-none">{t('detail.topInfo.buy')}</div>
            <div className="font-[338] text-[12px] text-rise leading-none">
              {currentTimeFrame.buyTransaction ? formatVolume(currentTimeFrame.buyTransaction) : 0}
              <span className="text-white/50"> / </span>
              {formatVolume(currentTimeFrame.buyAmount, {
                showCurrency: true,
              })}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="font-[330] text-[13px] text-white/50 leading-none">{t('detail.topInfo.sell')}</div>
            <div className="font-[338] text-[12px] text-fall leading-none">
              {currentTimeFrame.sellTransaction ? formatVolume(currentTimeFrame.sellTransaction) : 0}
              <span className="text-white/50"> / </span>
              {formatVolume(currentTimeFrame.sellAmount, {
                showCurrency: true,
              })}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="font-[330] text-[13px] text-white/50 leading-none">{t('detail.topInfo.netVol')}</div>
            <div
              className={cn(
                'font-[330] text-[12px] leading-none',
                netVol > 0 ? 'text-rise' : netVol < 0 ? 'text-fall' : 'text-white/50',
              )}
            >
              {formatVolume(netVol, {
                showCurrency: true,
              })}
            </div>
          </div>
        </div>
        <div className="mt-[9px] col-span-4 w-full h-[6px] bg-fall flex rounded-full overflow-hidden">
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
      <div className="mt-3 grid grid-cols-4 gap-1">
        {mapData.map((item, index) => (
          <div
            key={index}
            className="px-1 py-2 flex flex-col items-center gap-1.5 rounded-[4px] border-[0.5px] border-[#ECECED1F]"
          >
            <div className="font-[330] text-[12px] text-white/50 leading-none">{item.label}</div>
            <div className="font-[450] text-[12px] text-white">
              {item.value}
              {item.unit && <span> {item.unit}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopInfo
