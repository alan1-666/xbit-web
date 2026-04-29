import { WalletStatisticDto } from '@/@generated/gql/graphql-meme2'
import { gqlMeme2 } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils.ts'
import { getWalletInfo2 } from '@/services/tokens.service'
import FormatedValue from '@components/common/FormatedValue.tsx'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../ui/skeleton'
import { LightweightTooltip } from '@components/common/LightweightTooltip.tsx'
import { IconInfo } from '@components/icon/stroke/iconInfo.tsx'

type WalletStatisticTooltipProps = {
  address: string
  chainId: number
  token: string
  currentPrice?: string
  holdingPercentage: number
  open: boolean
}

type TitleProps = {
  title: string
  icon?: string
  tooltip?: React.ReactNode
}

const Title = ({ title, tooltip, icon }: TitleProps) => {
  return (
    <div className="flex items-center gap-1">
      {icon && <img src={icon} alt={title} />}
      <span className="text-[12px] leading-[1] font-light text-[#908E98]">{title}</span>
      {tooltip && tooltip}
    </div>
  )
}

const SkeletonRow = ({ title }: { title: string }) => (
  <div className="flex items-center justify-between py-2">
    <Title title={title} />
    <Skeleton className="w-16 h-3" />
  </div>
)

export const formatHoldingDuration = (seconds: number): string => {
  seconds = Math.floor(seconds / 1000) // Convert milliseconds to seconds
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

export const HoldingDuration = ({ holdingDuration }: { holdingDuration: number | undefined }) => {
  const [age, setAge] = useState<number>(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setAge((t) => t + 1000)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!holdingDuration) {
    return '--'
  }

  return formatHoldingDuration(age + holdingDuration)
}

export const WalletStatisticTooltipPC = (props: WalletStatisticTooltipProps) => {
  const { address, chainId, token, holdingPercentage, open } = props
  const { t } = useTranslation()

  const { data, isLoading: loading } = useQuery({
    queryKey: ['wallet-info', address, token, chainId],
    queryFn: async () => {
      const { data } = await gqlMeme2.query({
        query: getWalletInfo2,
        variables: {
          input: {
            addresses: address,
            token: token,
            chainId: chainId,
          },
        },
      })
      return data
    },
    enabled: open,
  })

  const walletStatistics = useMemo(() => {
    if (!data || !data.getWalletInfo) return undefined
    return data.getWalletInfo[0] as WalletStatisticDto
  }, [data])

  // const profit = useMemo(() => {
  //   const buyAmount = walletStatistics?.totalUsdBuyAmount ?? 0
  //   const sellAmount = walletStatistics?.totalUsdSellAmount ?? 0
  //   const holding = walletStatistics?.currentHolding ?? 0
  //   const currentPriceValue = currentPrice ? parseFloat(currentPrice) : 0
  //   const holdingValue = holding * currentPriceValue
  //   return sellAmount - buyAmount + holdingValue
  // }, [walletStatistics, currentPrice])

  // const formattedProfit = useMemo(() => {
  //   if (profit === null || profit === undefined) return '--'
  //   const isPositive = profit >= 0
  //   const absValue = Math.abs(profit)
  //   return (isPositive ? '+' : '-') + '$' + fShortenNumber(absValue)
  // }, [profit])

  // const positionValue = useMemo(() => {
  //   if (!walletStatistics?.currentHolding || !currentPrice) return '--'
  //   const price = parseFloat(currentPrice)
  //   return `$${fShortenNumber(walletStatistics.currentHolding * price)}`
  // }, [walletStatistics, currentPrice])

  // const totalSellTxs = useMemo(() => {
  //   if (walletStatistics?.totalSellTxs !== undefined && walletStatistics?.totalSellTxs !== null) {
  //     return walletStatistics.totalSellTxs
  //   }
  //   if (!walletStatistics?.totalUsdSellAmount || walletStatistics.totalUsdSellAmount === 0) return 0
  //   return undefined
  // }, [walletStatistics])

  return (
    <div className={cn('bg-[#212127] rounded-[8px] max-w-[200px] p-2')}>
      <p className="text-[12px] leading-[1.2] font-light text-[#FBFBFB] break-words">{address}</p>

      {loading ? (
        <div className="mt-2">
          <SkeletonRow title={t('walletDetail.holderTable.totalBuy')} />
          <SkeletonRow title={t('walletDetail.holderTable.totalSell')} />
          <SkeletonRow title={t('detail.holdings.totalFees')} />
          <SkeletonRow title={t('walletDetail.holdings.balance')} />
          <SkeletonRow title={t('walletDetail.holderTable.holdingLength')} />
          <SkeletonRow title={t('detail.holder.tracked')} />
          <SkeletonRow title={t('detail.holder.noted')} />
          <SkeletonRow title={t('detail.holder.winrate7d')} />
          <SkeletonRow title={t('detail.holder.profit7d')} />
          <SkeletonRow title={t('detail.holder.trades7d')} />
          <SkeletonRow title={t('detail.holder.token7d')} />
          <SkeletonRow title={t('detail.holder.avgHold7d')} />
        </div>
      ) : (
        <>
          {/* Info */}
          <div className={'mt-2 border-b border-b-[#1F1E25]'}>
            {/*Total Buy*/}
            <div className="flex items-center justify-between py-2">
              <Title title={t('walletDetail.holderTable.totalBuy')} />
              <div className="flex items-center gap-0.5">
                <FormatedValue
                  value={walletStatistics?.totalUsdBuyAmount || 0}
                  unit={'$'}
                  position={'front'}
                  className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
                />
                <span className="text-[11px] leading-[1] font-light text-[#908E98]">{'/'}</span>
                <FormatedValue
                  value={Number(walletStatistics?.totalBuyTxs || 0)}
                  unit={'TXs'}
                  className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
                />
              </div>
            </div>
            {/*Total Sell*/}
            <div className="flex items-center justify-between py-2">
              <Title title={t('walletDetail.holderTable.totalSell')} />
              <div className="flex items-center gap-0.5">
                <FormatedValue
                  value={walletStatistics?.totalUsdSellAmount || 0}
                  unit={'$'}
                  position={'front'}
                  className={'text-[12px] leading-[1] font-light !text-[#EA3B4F]'}
                />
                <span className="text-[11px] leading-[1] font-light text-[#908E98]">{'/'}</span>
                <FormatedValue
                  value={Number(walletStatistics?.totalSellTxs || 0)}
                  unit={'TXs'}
                  className={'text-[12px] leading-[1] font-light !text-[#EA3B4F]'}
                />
              </div>
            </div>
            {/*Total Fee*/}
            <div className="flex items-center justify-between py-2">
              <Title title={t('detail.holdings.totalFees')} />
              <div className="flex items-center gap-0.5">
                <FormatedValue
                  value={walletStatistics?.totalFeeUSD}
                  unit={'$'}
                  position={'front'}
                  className={'text-[12px] leading-[1] font-light !text-[#21E09D]'}
                />
              </div>
            </div>
            {/*Balance*/}
            <div className="flex items-center justify-between py-2">
              <Title title={t('walletDetail.holdings.balance')} />
              <div className="flex flex-col gap-1 items-end">
                <FormatedValue
                  value={walletStatistics?.currentHolding ? walletStatistics.currentHolding : 0}
                  unit={'$'}
                  position={'front'}
                  className={'text-[12px] leading-[1] !font-light'}
                />
                <div className={'w-[60px] h-[2px] rounded-r-full bg-[#00FFB433]'}>
                  <div
                    className={'h-[2px] rounded-r-full bg-[#21E09D]'}
                    style={{ width: `${holdingPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {/*Holding length*/}
            <div className="flex items-center justify-between pt-2 pb-[7px]">
              <Title title={t('walletDetail.holderTable.holdingLength')} />
              <div className="flex items-center gap-0.5">
                <div className="text-[12px] leading-[1] font-light">
                  <HoldingDuration holdingDuration={walletStatistics?.holdingDuration} />
                </div>
              </div>
            </div>
          </div>
          {/*PnL*/}
          <div>
            {/*Tracked*/}
            <div className="flex items-center justify-between py-2 relative z-20">
              <div className="flex items-center gap-1">
                <Title title={t('detail.holder.tracked')} />
                <LightweightTooltip
                  contentClassName="max-w-full min-w-[150px]"
                  align="left"
                  position="top"
                  content={t('detail.holder.trackedDescription', { tracked: walletStatistics?.tracked || '--' })}
                >
                  <IconInfo className="cursor-pointer text-[#908E98]" />
                </LightweightTooltip>
              </div>
              <div className="flex items-center gap-0.5 z-[50]">{walletStatistics?.tracked || '--'}</div>
            </div>
            {/*Noted*/}
            <div className="flex items-center justify-between py-2 relative z-10">
              <div className="flex items-center gap-1">
                <Title title={t('detail.holder.noted')} />
                <LightweightTooltip
                  contentClassName="max-w-full min-w-[150px]"
                  align="left"
                  content={t('detail.holder.notedDescription', { noted: walletStatistics?.noted || '--' })}
                >
                  <IconInfo className="cursor-pointer text-[#908E98]" />
                </LightweightTooltip>
              </div>
              <div className="flex items-center gap-0.5">{walletStatistics?.noted || '--'}</div>
            </div>
            {/*7d winrate*/}
            <div className="flex items-center justify-between py-2">
              <Title title={t('detail.holder.winrate7d')} />
              <div className="flex items-center gap-0.5">
                <FormatedValue
                  value={Number(walletStatistics?.winrate7d) || 0}
                  unit={'%'}
                  className={cn(
                    'text-[12px] leading-[1] font-light !text-[#21E09D]',
                    Number(walletStatistics?.winrate7d) < 0 && '!text-[#EA3B4F]',
                  )}
                  isMocked={!Number(walletStatistics?.winrate7d)}
                />
              </div>
            </div>
            {/*7d pnl*/}
            <div className="flex items-center justify-between py-2">
              <Title title={t('detail.holder.profit7d')} />
              <div className="flex items-center gap-0.5">
                <FormatedValue
                  value={walletStatistics?.pnl7d || 0}
                  unit={'$'}
                  position={'front'}
                  className={cn(
                    'text-[12px] leading-[1] font-light !text-[#21E09D]',
                    Number(walletStatistics?.pnl7d) < 0 && '!text-[#EA3B4F]',
                  )}
                  isMocked={!Number(walletStatistics?.pnl7d)}
                />
              </div>
            </div>
            {/*7d trades*/}
            <div className="flex items-center justify-between py-2">
              <Title title={t('detail.holder.trades7d')} />
              <div className="flex items-center gap-0.5">
                <FormatedValue
                  value={walletStatistics?.trades7d || 0}
                  unit={'$'}
                  position={'front'}
                  className={cn(
                    'text-[12px] leading-[1] font-light !text-[#21E09D]',
                    Number(walletStatistics?.trades7d) < 0 && '!text-[#EA3B4F]',
                  )}
                  isMocked={!Number(walletStatistics?.trades7d)}
                />
              </div>
            </div>
            {/*7d token*/}
            <div className="flex items-center justify-between py-2">
              <Title title={t('detail.holder.token7d')} />
              <div className="flex items-center gap-0.5">
                <FormatedValue
                  value={walletStatistics?.tokens7d || 0}
                  unit={'$'}
                  position={'front'}
                  className={cn(
                    'text-[12px] leading-[1] font-light !text-[#21E09D]',
                    Number(walletStatistics?.tokens7d) < 0 && '!text-[#EA3B4F]',
                  )}
                  isMocked={!Number(walletStatistics?.tokens7d)}
                />
              </div>
            </div>
            {/*7d avg holding*/}
            <div className="flex items-center justify-between py-2">
              <Title title={t('detail.holder.avgHold7d')} />
              <div className="flex items-center gap-0.5">
                <FormatedValue
                  value={walletStatistics?.avgHolding7d || 0}
                  unit={'$'}
                  position={'front'}
                  className={cn(
                    'text-[12px] leading-[1] font-light !text-[#21E09D]',
                    Number(walletStatistics?.avgHolding7d) < 0 && '!text-[#EA3B4F]',
                  )}
                  isMocked={!Number(walletStatistics?.avgHolding7d)}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
