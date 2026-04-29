import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { IconHelp } from '@components/icon'
import { formatAmount, formatPercent } from '@/lib/format'
import Loader from '@/components/common/Loader'
import { useTranslation } from 'react-i18next'

interface QuoteSummaryProps {
  isLoading: boolean
  estimatedAmount?: number
  priceImpact?: number
  tokenSymbol: string
}

export const QuoteSummary = ({ isLoading, estimatedAmount, priceImpact, tokenSymbol }: QuoteSummaryProps) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-3 text-[12px] leading-3 font-light">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[#A1A1AA]">{t('exchange.estAmount')}</div>
        <div className="text-white">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              {estimatedAmount ? '≈ ' : ''}
              {formatAmount(estimatedAmount, {
                roundMode: 'floor',
                unit: tokenSymbol,
              })}
            </>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[#A1A1AA]">
          {t('exchange.priceImpact')}{' '}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <IconHelp className="size-3 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] rounded-md border border-[#79778C29] bg-[#212127] p-2 text-[12px] leading-4 font-[330] text-[#908E98]">
                {t('exchange.priceImpactTooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-white">{isLoading ? <Loader /> : formatPercent(priceImpact ? priceImpact * 100 : 0)}</div>
      </div>
    </div>
  )
}
