import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatBalance } from '@/lib/format'
import { Link } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'
import { useTranslation } from 'react-i18next'
import { Loader2, CircleCheck, CircleX } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type ClaimStatus } from '@/modules/prediction/hooks/useClaimablePositions'

interface ClaimWinningsItemProps {
  title: string
  wonAmount: number
  image: string
  marketSlug: string
  claimStatus?: ClaimStatus
  claimError?: string
}

export const ClaimWinningsItem = ({
  title,
  wonAmount,
  image,
  marketSlug,
  claimStatus,
  claimError,
}: ClaimWinningsItemProps) => {
  const { t } = useTranslation()
  return (
    <div className="block no-underline">
      <Link
        to={NAVIGATIONS.prediction.eventDetails(marketSlug)}
        className="flex items-start gap-3 p-3 rounded-xl bg-[#2D2D35] hover:bg-[#363640] transition-colors border border-transparent"
      >
        <div className="relative h-12 w-12 min-w-12">
          <Avatar className="h-full w-full rounded-lg bg-[#1C1C1E]">
            <AvatarImage
              src={image}
              className="object-cover w-full h-full"
              alt={t('prediction.portfolio.marketIconAlt')}
            />
            <AvatarFallback className="rounded-lg bg-[#1C1C1E] text-xs text-[#525252]">
              {title.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0 text-left py-0.5">
          <h3 className="font-medium text-white text-sm leading-tight mb-1.5 line-clamp-2">{title}</h3>
          <p className="text-xs text-[#94A3B8]">
            {t('prediction.portfolio.won')}{' '}
            <span className="text-rise font-medium">{formatBalance(wonAmount, { showCurrency: true })}</span>
          </p>
        </div>
        <div className="flex items-center justify-center w-8 h-12 shrink-0">
          {claimStatus === 'claiming' && <Loader2 className="w-5 h-5 text-[#94A3B8] animate-spin" />}
          {claimStatus === 'succeeded' && <CircleCheck className="w-5 h-5 text-emerald-400" />}
          {claimStatus === 'failed' && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleX className="w-5 h-5 text-red-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-[#363640] border-[#363640] text-red-500 px-3 py-1.5" side="left">
                  <p className="max-w-[200px] text-xs leading-tight break-words">{claimError || 'Unknown error'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </Link>
    </div>
  )
}
