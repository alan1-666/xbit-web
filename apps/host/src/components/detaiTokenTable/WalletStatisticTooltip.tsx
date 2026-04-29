import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { cn } from '@/lib/utils.ts'
import { CHAIN_EXPLORER_ADDRESS_URLS } from '@/lib/constant.ts'
import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useQuery } from '@apollo/client'
import { getWalletStatistics } from '@services/tokens.service.ts'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { formatAddressWallet } from '@/lib/string.ts'

export type WalletStatistics = {
  totalBuyTxs: number // number of buy transactions
  totalSellTxs: number // number of sell transactions
  totalUsdBuyAmount: number // total USD amount of buy transactions
  totalUsdSellAmount: number // total USD amount of sell transactions
  maxHolding: number // maximum token holding
  currentHolding: number // current token holding
  holdingDuration: string // duration of holding the token
  avgBuyMarketCap: number
  avgSellMarketCap: number
  label: string
  labels: string[]
  pnl: number
  walletAddress: string
}

export interface WalletStatisticTooltipProps {
  tx24h?: number
  address: string
  holdingPercentage: number
  chainId: number
  token: string
  currentPrice?: string
  isPC?: boolean
  renderIconFooter?: React.ReactNode
  renderIconHeader?: React.ReactNode
}

export const formatHoldingDuration = (seconds: number): string => {
    seconds = Math.floor(seconds / 1000) // Convert milliseconds to seconds
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }

export const WalletStatisticTooltip = (props: WalletStatisticTooltipProps) => {
  const { tx24h, address, holdingPercentage, chainId, token, currentPrice, isPC, renderIconFooter, renderIconHeader } =
    props
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [open])

  const { data, loading } = useQuery(getWalletStatistics, {
    variables: {
      input: {
        address: address,
        token: token,
        chainId: chainId,
      },
    },
    skip: !open, // Only fetch data when the tooltip is open
  })

  const walletStatistics = useMemo(() => {
    if (!data || !data.getWalletStatistic) return undefined
    return data.getWalletStatistic as WalletStatistics
  }, [data])

  const profit = useMemo(() => {
    const buyAmount = walletStatistics?.totalUsdBuyAmount ?? 0
    const sellAmount = walletStatistics?.totalUsdSellAmount ?? 0
    const holding = walletStatistics?.currentHolding ?? 0
    const currentPriceValue = currentPrice ? parseFloat(currentPrice) : 0
    const holdingValue = holding * currentPriceValue
    return sellAmount - buyAmount + holdingValue
  }, [walletStatistics, currentPrice])

  const formattedProfit = useMemo(() => {
    if (profit === null || profit === undefined) return '--'
    const isPositive = profit >= 0
    const absValue = Math.abs(profit)
    return (isPositive ? '+' : '-') + '$' + fShortenNumber(absValue)
  }, [profit])

  const positionValue = useMemo(() => {
    if (!walletStatistics?.currentHolding || !currentPrice) return '--'
    const price = parseFloat(currentPrice)
    return `$${fShortenNumber(walletStatistics.currentHolding * price)}`
  }, [walletStatistics, currentPrice])

  const handleClick = () => {
    setOpen(!open)
  }

  const totalSellTxs = useMemo(() => {
    if (walletStatistics?.totalSellTxs !== undefined && walletStatistics?.totalSellTxs !== null) {
      return walletStatistics.totalSellTxs
    }
    // If not sell yet, return undefined
    if (!walletStatistics?.totalUsdSellAmount || walletStatistics.totalUsdSellAmount === 0) return 0
    return undefined
  }, [walletStatistics])
  return (
    <div ref={tooltipRef} className="wallet-statistic-tooltip">
      <TooltipProvider>
        <Tooltip open={open} onOpenChange={() => {}}>
          <TooltipTrigger asChild className="flex-1">
            {isPC ? (
              <div className="flex-1">
                <div className="flex gap-1">
                  <div className="flex items-center gap-1 app-font-regular leading-[1] justify-between">
                    <span className="text-[14px] text-[#FFFFFFCC] font-[330]">{formatAddressWallet(address)}</span>
                    {tx24h ? (
                      <span className="text-[12px] font-[330] text-[#FFFFFFB2] p-[2px] rounded-xs bg-[#ECECED14] flex items-center justify-center w-[27px] text-center">
                        {tx24h < 100 ? fShortenNumber(tx24h) : '99+'}
                      </span>
                    ) : null}
                  </div>
                  {renderIconHeader}
                </div>

                <div className="flex gap-1 mt-1">
                  <div className="mt-1 bg-[#00FFB433] h-1 w-[110px] relative rounded-r-full">
                    <div
                      className="absolute w-1/5 h-full bg-[#009C46] rounded-r-full transition"
                      style={{ width: `${Math.min(holdingPercentage, 100)}%` }}
                    ></div>
                  </div>

                  {renderIconFooter}
                </div>
              </div>
            ) : (
              <div onClick={handleClick} className="cursor-pointer flex-1">
                <div className="flex items-center gap-1 app-font-regular leading-[1]">
                  <span className="text-[calc(1rem*(9/16))] text-[#00FFB4]">{formatAddressWallet(address)}</span>
                  {tx24h ? (
                    <span className="text-[calc(1rem*(8/16))] text-[#00FFF6] p-0.5 rounded-xs bg-[#00FFF61A] flex items-center justify-center">
                      {tx24h < 100 ? fShortenNumber(tx24h) : '99+'}
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 bg-[#00FFB433] h-1 w-[72px] relative rounded-r-full">
                  <div
                    className="absolute w-1/5 h-full bg-[#00FFB4] rounded-r-full transition"
                    style={{ width: `${Math.min(holdingPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </TooltipTrigger>
          <TooltipContent className="p-[1px] rounded-[8px]">
            {loading && (
              <div className="space-y-2 bg-[#363642] w-48">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="w-full h-4" />
                ))}
              </div>
            )}
            {!loading && (
              <div className="text-[calc(1rem*(11/16))]  bg-[#212127] w-48 rounded-[8px] p-2.5 space-y-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[#FFFFFF] text-[11px] leading-none font-[330]">
                    {t('detail.tokenDetail.bought', { times: walletStatistics?.totalBuyTxs ?? '--' })}
                  </span>
                  <span className="text-rise text-[calc(1rem*(12/16))]">
                    {walletStatistics?.totalUsdBuyAmount
                      ? `$${fShortenNumber(walletStatistics.totalUsdBuyAmount)}`
                      : '$0'}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[#FFFFFF] text-[11px] leading-none font-[330]">
                    {t('detail.tokenDetail.sold', { times: totalSellTxs ?? '--' })}
                  </span>
                  <span className="text-fall text-[calc(1rem*(12/16))]">
                    {walletStatistics?.totalUsdSellAmount
                      ? `$${fShortenNumber(walletStatistics.totalUsdSellAmount)}`
                      : '$0'}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[#FFFFFF] text-[11px] leading-none font-[330]">{t('detail.tokenDetail.pnl')}</span>
                  <span className={cn('text-[calc(1rem*(12/16))]', profit && profit < 0 ? 'text-fall' : 'text-rise')}>
                    {formattedProfit}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[#FFFFFF] text-[11px] leading-none font-[330]">{t('detail.tokenDetail.positionValue')}</span>
                  <span className="text-white text-[calc(1rem*(12/16))]">{positionValue}</span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[#FFFFFF] text-[11px] leading-none font-[330]">{t('detail.tokenDetail.balance')}</span>
                  <div className="w-16">
                    <div className="flex justify-between items-center w-full text-[calc(1rem*(9/16))] mb-0.5">
                      <span className="text-white">
                        {walletStatistics?.currentHolding ? `${fShortenNumber(walletStatistics.currentHolding)}` : '--'}
                      </span>
                      <span className="text-white">
                        {walletStatistics?.maxHolding ? `${fShortenNumber(walletStatistics.maxHolding)}` : '--'}
                      </span>
                    </div>
                    <div className="rounded-r-full bg-[#ECECED2E] w-full">
                      <div
                        className="bg-[#843bea] h-1 rounded-r-full"
                        style={{
                          width:
                            walletStatistics?.currentHolding && walletStatistics.maxHolding
                              ? `${(walletStatistics.currentHolding * 100) / walletStatistics.maxHolding}%`
                              : '0%',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[#FFFFFF] text-[11px] leading-none font-[330]">{t('detail.tokenDetail.holdingDuration')}</span>
                  <span className="text-white text-[calc(1rem*(12/16))]">
                    {walletStatistics?.holdingDuration
                      ? formatHoldingDuration(Number(walletStatistics.holdingDuration))
                      : '--'}
                  </span>
                </div>
                <a
                  href={CHAIN_EXPLORER_ADDRESS_URLS[chainId] + '/' + address}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="gradient"
                    className="rounded-[40px] h-7 before:rounded-[8px] after:rounded-[8px] w-full text-[#FFFFFF] text-[11px] leading-none font-[330]"
                  >
                    {t('detail.tokenDetail.viewOnExplorer')}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M10.2083 4.66667C11.0137 4.66667 11.6667 4.01374 11.6667 3.20833C11.6667 2.40292 11.0137 1.75 10.2083 1.75C9.40292 1.75 8.75 2.40292 8.75 3.20833C8.75 4.01374 9.40292 4.66667 10.2083 4.66667Z"
                        stroke="#FFFFFF"
                        strokeWidth="1.16667"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.79232 8.45768C4.59773 8.45768 5.25065 7.80476 5.25065 6.99935C5.25065 6.19394 4.59773 5.54102 3.79232 5.54102C2.98691 5.54102 2.33398 6.19394 2.33398 6.99935C2.33398 7.80476 2.98691 8.45768 3.79232 8.45768Z"
                        stroke="#FFFFFF"
                        strokeWidth="1.16667"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.75141 3.95898L5.05859 6.19633"
                        stroke="#FFFFFF"
                        strokeWidth="1.16667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.05859 7.74805L8.94954 10.0473"
                        stroke="#FFFFFF"
                        strokeWidth="1.16667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.2083 9.33398C11.0137 9.33398 11.6667 9.98691 11.6667 10.7923C11.6667 11.5977 11.0137 12.2507 10.2083 12.2507C9.40292 12.2507 8.75 11.5977 8.75 10.7923C8.75 9.98691 9.40292 9.33398 10.2083 9.33398Z"
                        stroke="#FFFFFF"
                        strokeWidth="1.16667"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </a>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
