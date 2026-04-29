import { TokenDetail } from '@/@generated/gql/graphql-core'
import { EVENT_MESSAGE_OHLC_UPDATED } from '@/datafeeds/dataUpdater.ts'
import eventBus from '@/lib/eventBus.ts'
import { formatAmount, formatPercent, formatPrice, formatVolume } from '@/lib/format'
import { fShortenNumberv2 } from '@/lib/number.ts'
import { cn } from '@/lib/utils.ts'
import PoolStatistic from '@components/detailToken/PoolStatistic.tsx'
import TokenStatistic from '@components/detailToken/TokenStatistic.tsx'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useGetTokenSniper from '@hooks/useGetTokenSniper.ts'
import { ChainIds } from '@/types/enums.ts'
import { useTokenStatisticSubscription } from '@hooks/meme/useTokenStatisticSubscription.ts'
import { TokenMarketStats } from '@/types/token.ts'

interface DetailTokenProps {
  tokenData: TokenDetail
}

interface DataItem {
  label: string
  value: string | number | React.ReactNode
  unit?: string
}

interface DataHealth {
  title: string
  isCheck: boolean
  value: string | number
}

// const calculateFdv = (tokenData?: TokenDetail) => {
//   if (!tokenData || !tokenData.totalSupply) return '--'
//   const fdv = Number(tokenData.totalSupply) * tokenData.price
//   return formatVolume(fdv, { showCurrency: true })
// }

const calculateFromATH = ({ t, tokenData }: { tokenData?: TokenDetail; t: TFunction }) => {
  const currentPrice = tokenData?.price
  const athPrice = tokenData?.athPrice ? +tokenData.athPrice : undefined
  if (!currentPrice || !athPrice || athPrice <= 0) return '--'
  const profit = (athPrice - currentPrice) / currentPrice
  return profit > 0 ? `+${formatVolume(profit)}${t('detail.tokenInfo.times')}` : `${formatVolume(profit)}x`
}

const calculateFromATL = ({ t, tokenData }: { tokenData?: TokenDetail; t: TFunction }) => {
  const currentPrice = tokenData?.price
  const atlPrice = tokenData?.atlPrice ? +tokenData.atlPrice : undefined

  if (!currentPrice || !atlPrice || atlPrice < 0) return '--'
  if (atlPrice === 0) return '+>9999Tx'

  const gain = (currentPrice - atlPrice) / atlPrice
  return gain > 0 ? `+${formatVolume(gain)}${t('detail.tokenInfo.times')}` : `${formatVolume(gain)}x`
}

const calculateFromOpenPrice = ({ t, tokenData }: { tokenData?: TokenDetail; t: TFunction }) => {
  const currentPrice = tokenData?.price
  const openPrice = tokenData?.openPrice ? +tokenData.openPrice : undefined

  if (!currentPrice || !openPrice) return '--'
  if (currentPrice >= openPrice) {
    const gain = (currentPrice - openPrice) / openPrice
    return gain > 0 ? `+${formatVolume(gain)}${t('detail.tokenInfo.times')}` : `${formatVolume(gain)}x`
  }
  const loss = (currentPrice - openPrice) / currentPrice
  return loss > 0 ? `+${formatVolume(loss)}${t('detail.tokenInfo.times')}` : `${formatVolume(loss)}x`
}

const calculate24hVol = (tokenData?: TokenDetail) => {
  if (!tokenData) return '$0'
  if (tokenData.volume24h && +tokenData.volume24h > 0) return formatVolume(tokenData.volume24h, { showCurrency: true })
  const totalAmount = tokenData.totalAmount
  if (!totalAmount) return '$0'
  const buyAmount = totalAmount.totalBuyAmount24h ? +totalAmount.totalBuyAmount24h : 0
  const sellAmount = totalAmount.totalSellAmount24h ? +totalAmount.totalSellAmount24h : 0
  return formatVolume(buyAmount + sellAmount, { showCurrency: true })
}

const calculateCirculatingMarketcap = (tokenData?: TokenDetail) => {
  if (!tokenData) return '$0'
  const circulatingSupply = Number(tokenData.circulatingSupply || tokenData.totalSupply || 0)
  const price = Number(tokenData.price ?? 0)
  return formatVolume(circulatingSupply * price, {
    showCurrency: true,
  })
}

const calculateMarketcap = (tokenData?: TokenDetail) => {
  if (!tokenData) return '$0'
  const circulatingSupply = Number(tokenData.totalSupply || 0)
  const price = Number(tokenData.price ?? 0)
  return formatVolume(circulatingSupply * price, {
    showCurrency: true,
  })
}

const DetailToken = ({ tokenData }: DetailTokenProps) => {
  const { t } = useTranslation()
  const [currentPrice, setCurrentPrice] = useState(0)

  const { data: sniperData } = useGetTokenSniper({
    address: tokenData?.address as string,
    chainId: tokenData?.chainId as ChainIds,
  })

  useEffect(() => {
    console.log({ ath: tokenData?.athPrice })
  }, [tokenData])

  // const tokenStatistic = useTokenPriceInfo(tokenData?.address || '')
  const tokenStatistic = useTokenStatisticSubscription({
    token: tokenData?.address || '',
    keys: [
      'marketcap',
      'liquidity',
      'athPrice',
      'atlPrice',
      'turnoverRate24h',
      'numberOfHolder',
      'createdTime',
      'price24hChange',
      'top10Holders',
      'price5mChange',
      'price1hChange',
      'price6hChange',
      'price24hChange',
      'volume5m',
      'volume1h',
      'volume6h',
      'volume24h',
      'totalTransactions',
      'totalAmount',
      'numberUniqueAddresses',
    ],
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
      athPrice: tokenStatistic.athPrice || tokenData?.athPrice,
      atlPrice: tokenStatistic.atlPrice || tokenData?.atlPrice,
      turnoverRate24h: tokenStatistic.turnoverRate24h || tokenData?.turnoverRate24h,
      chainId: tokenData?.chainId,
      top10HolderRate:
        tokenStatistic?.top10Holders && tokenData?.totalSupply
          ? Number(tokenStatistic.top10Holders) /
            (Number(tokenData?.totalSupply) * Math.pow(10, Number(tokenData?.decimals)))
          : tokenData?.top10HolderRate,
    } as TokenDetail
  }, [tokenData, tokenStatistic, currentPrice])

  const mapData = useMemo<DataItem[]>(() => {
    if (!mergedTokenData) return []

    return [
      {
        label: t('tokenData.circulatingMC'),
        value: calculateCirculatingMarketcap(mergedTokenData),
      },
      {
        label: t('tokenData.liquidityPool'),
        value: formatVolume(mergedTokenData.liquidity, {
          showCurrency: true,
        }),
      },
      {
        label: t('tokenData.holders'),
        value: mergedTokenData?.holders ? mergedTokenData.holders : '--',
      },
      {
        label: t('tokenData.vol24h'),
        value: calculate24hVol(mergedTokenData),
      },
      {
        label: t('tokenData.turnoverRate24h'),
        value: formatPercent(mergedTokenData.turnoverRate24h),
      },
      {
        label: t('tokenData.top10Holdings'),
        value: formatPercent(
          mergedTokenData?.top10HolderRate !== undefined && mergedTokenData?.top10HolderRate !== null
            ? mergedTokenData.top10HolderRate * 100
            : undefined,
        ),
      },
      {
        label: t('tokenData.top100Holdings'),
        value: formatPercent(
          sniperData?.getTokenSniper?.top100Holders !== undefined && sniperData?.getTokenSniper?.top100Holders !== null
            ? Number(sniperData?.getTokenSniper?.top100Holders) * 100
            : undefined,
        ),
      },
      {
        label: t('tokenData.issueDate'),
        value: mergedTokenData?.createdTime ? dayjs(mergedTokenData.createdTime).format('YYYY/MM/DD') : '--',
      },
      {
        label: t('tokenData.marketCap'),
        value: calculateMarketcap(mergedTokenData),
      },
      {
        label: t('tokenData.circulatingSupply'),
        value: mergedTokenData?.circulatingSupply ? formatVolume(+mergedTokenData.circulatingSupply) : '--',
      },
      {
        label: t('tokenData.totalSupply'),
        value: mergedTokenData?.totalSupply ? formatVolume(+mergedTokenData.totalSupply) : '--',
      },
      {
        label: t('tokenData.openPrice'),
        value: formatPrice(tokenData?.openPrice, {
          showCurrency: true,
        }),
      },
      // {
      //   label: t('detail.tokenInfo.fdv'),
      //   value: calculateFdv(mergedTokenData),
      // },

      {
        label: t('tokenData.athPrice'),
        value: formatAmount(mergedTokenData?.athPrice, {
          showCurrency: true,
        }),
      },
      {
        label: t('tokenData.atlPrice'),
        value: formatPrice(mergedTokenData?.atlPrice, {
          showCurrency: true,
        }),
      },
      {
        label: t('tokenData.ageToken'),
        value: tokenData?.createdTime ? (
          <TokenAge createdTime={tokenData?.createdTime} className="text-white! text-[calc(12rem/16)]" />
        ) : (
          '--'
        ),
      },
      {
        label: t('detail.tokenInfo.fromATH'),
        value: calculateFromATH({ t, tokenData: mergedTokenData }),
      },
      {
        label: t('detail.tokenInfo.fromATL'),
        value: calculateFromATL({ t, tokenData: mergedTokenData }),
      },
      {
        label: t('detail.tokenInfo.fromOpen'),
        value: calculateFromOpenPrice({ t, tokenData: mergedTokenData }),
      },
    ]
  }, [tokenData, mergedTokenData, t])

  const healthCheck: DataHealth[] = [
    {
      title: t('detail.tokenInfo.mintDisabled'),
      isCheck: tokenData?.health?.notMint ?? false,
      value: tokenData?.health?.notMint ? t('detail.tokenInfo.yes') : t('detail.tokenInfo.no'),
    },
    {
      title: t('detail.tokenInfo.blacklist'),
      isCheck: tokenData?.health?.noBlackListWhiteListFunction ?? false,
      value: tokenData?.health?.noBlackListWhiteListFunction ? t('detail.tokenInfo.yes') : t('detail.tokenInfo.no'),
    },
    {
      title: t('detail.tokenInfo.burnt'),
      isCheck: tokenData?.health?.burnt ?? false,
      value: Number(tokenData?.burnRatio) >= 0 ? fShortenNumberv2(tokenData?.burnRatio ?? 0) + '%' : '--',
    },
    {
      title: 'Top 10',
      isCheck: tokenData?.health?.top10 ? +tokenData.health.top10 * 100 < 20 : false,
      value: mergedTokenData?.top10HolderRate ? formatPercent(Number(mergedTokenData?.top10HolderRate) * 100) : '--',
    },
  ]

  const renderDataItem = (item: DataItem, index: number) => {
    return (
      <div
        key={item.label + index}
        className="flex-auto justify-between items-center bg-[#0A0A0A] rounded-[4px] py-[6px] text-center border-[0.5px] border-[#25242B]"
      >
        <div className="text-[11px] text-[#605e68] font-[330] leading-none">{item.label}</div>
        <div className="text-[12px] text-white font-[380] leading-none mt-1">
          {item.value}
          {item.unit && <span> {item.unit}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="px-[10px] py-[8px]">
      <TokenStatistic tokenData={tokenData} tokenStatistic={tokenStatistic as TokenMarketStats} />

      <PoolStatistic tokenData={mergedTokenData} />

      <div className="grid grid-cols-4 gap-1 mt-2.5">
        {healthCheck.map((item, index) => (
          <div
            key={item.title + index}
            className="flex flex-col items-center gap-1.5 py-[5px] border border-[#25242b] rounded bg-[#0A0A0A] text-[11px] leading-[1]"
          >
            <span className="text-[#605e68] text-[11px] font-[330] leading-none">{item.title}</span>
            <div className="flex items-start gap-1 app-font-medium">
              <span className={cn(item.isCheck ? 'text-rise' : 'text-fall')}>{item.value}</span>
              <img
                src={item.isCheck ? '/images/tokenDetail/ic-tick-green.svg' : '/images/tokenDetail/ic-x-purple.svg?v=2'}
                alt="icon"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-[6px] mt-3.5">
        {mapData.map((item, index) => renderDataItem(item, index))}
      </div>
    </div>
  )
}

export default DetailToken
