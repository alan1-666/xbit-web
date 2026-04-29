import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { formatPriceChange, fShortenNumber } from '@/lib/number.ts'
import { useMemo } from 'react'

interface CategoryStatsCardProps {
  label: string
  averageIncrease: number
  totalMarketCap: string
  totalVolume: string
  upCount: number
  downCount: number
  className?: string
  total?: number
}

/**
 * Component that displays category statistics in a card format
 * Shows average increase, total market cap, volume, and up/down counts
 */
export const CategoryStatsCard = ({
  label,
  averageIncrease,
  totalMarketCap,
  totalVolume,
  upCount,
  downCount,
  className = '',
  total,
}: CategoryStatsCardProps) => {
  const { t } = useTranslation()

  const tokenCount = total ?? upCount + downCount
  const totalTokens = fShortenNumber(tokenCount)
  const priceChange = useMemo(() => {
    if (!total) return 0
    return averageIncrease / total
  }, [averageIncrease, tokenCount])

  return (
    <div className={`p-[1px] rounded-[10px] bg-gradient-to-br from-[#25364C] to-[#31254F] ${className}`}>
      <div className="w-full h-full rounded-[9px] bg-gradient-to-br from-[#142224] to-[#231E37] py-3 px-2.5">
        <div className="flex justify-between items-center">
          <h5 className="text-primary text-[calc(15rem/16)] font-medium">{label}</h5>
          <div className="text-[#FFFFFFB2] text-[calc(11rem/16)] font-light leading-3">
            {t('categoryDetail.totalTokens')}{' '}
            <span className="text-[calc(12rem/16)] text-white font-normal">{totalTokens}</span>
          </div>
        </div>
        <div className="w-full flex-row flex justify-between items-center mt-2.5">
          <div className="w-[25%] inline-flex flex-col items-start gap-1">
            <div className="text-right text-[#FFFFFFB2] text-[calc(11rem/16)] font-light leading-3 whitespace-nowrap">
              {t('categoryDetail.avgIncrease')}
            </div>
            <div className={cn('text-xs font-normal leading-3', priceChange >= 0 ? 'text-rise' : 'text-fall')}>
              {priceChange > 0 ? '+' : ''}
              {formatPriceChange(priceChange)}
            </div>
          </div>
          <div className="w-[20%] inline-flex flex-col justify-center items-center gap-1">
            <div className="text-left text-[#FFFFFFB2] text-[calc(11rem/16)] font-light leading-3">
              {t('categoryDetail.totalMarketCap')}
            </div>
            <div className="text-primary text-xs font-normal leading-3">{totalMarketCap}</div>
          </div>
          <div className="w-[25%] inline-flex flex-col justify-center items-end gap-1">
            <div className="text-right text-[#FFFFFFB2] text-[calc(11rem/16)] font-light leading-3">
              {t('categoryDetail.h24Volume')}
            </div>
            <div className="text-primary text-xs font-normal leading-3">{totalVolume}</div>
          </div>
        </div>
        <div className="w-full mt-2.5 h-1.5 bg-gradient-to-r from-[var(--rise-alternate)] to-[var(--fall-alternate)] rounded-[20px]" />
        <div className="w-full flex-row flex justify-between items-center mt-2.5">
          <div className="h-5 px-2 py-1 bg-[#AB57FF1A] rounded-[3px] border border-rise flex justify-center items-center gap-2.5">
            <div className="justify-start text-rise text-[calc(11rem/16)] font-normal leading-[calc(11rem/16)]">
              {t('categoryDetail.upCount')} {fShortenNumber(upCount)}
            </div>
          </div>
          <div className="h-5 px-2 py-1 bg-[#AB57FF1A] rounded-[3px] border border-fall flex justify-center items-center gap-2.5">
            <div className="justify-start text-fall text-[calc(11rem/16)] font-normal leading-[calc(11rem/16)]">
              {t('categoryDetail.downCount')} {fShortenNumber(downCount)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryStatsCard
