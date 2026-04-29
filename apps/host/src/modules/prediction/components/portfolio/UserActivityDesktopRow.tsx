import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CHAIN_EXPLORER_TX_URLS } from '@/lib/constant'
import { formatAmount, formatBalance, formatPrice } from '@/lib/format'
import { NAVIGATIONS } from '@/lib/navigations'
import { cn } from '@/lib/utils'
import { roundByTickSize } from '@/utils/helpers'
import { ChainIds } from '@/types/enums'
import { formatToTimeAgoI18n } from '@/utils/time'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IHistoryItem } from '../../models/PortfolioModel'
import { CircleDollarIcon } from '../icons'
import { useTranslation } from 'react-i18next'

interface UserActivityDesktopRowProps {
  item: IHistoryItem
  activityLabel: string
  ActivityIcon: React.ElementType
  isDeposit: boolean
  isTrade: boolean
  isBuy: boolean
  valueColor: string
  displaySign: string
  absUsdcSize: number
  iconColor?: string
}

export const UserActivityDesktopRow = ({
  item,
  activityLabel,
  ActivityIcon,
  isDeposit,
  valueColor,
  displaySign,
  absUsdcSize,
  iconColor,
}: UserActivityDesktopRowProps) => {
  const { t } = useTranslation()
  return (
    <div className="hidden xl:flex items-center px-4 h-[65px] xl:border-b xl:border-white/10 transition-colors bg-transparent hover:bg-white/5 gap-0">
      {/* Activity */}
      <div className="w-[130px] flex items-center gap-3">
        <ActivityIcon className={cn('shrink-0', iconColor || 'text-white')} />
        <span className="text-sm font-medium text-white">{activityLabel}</span>
      </div>

      {/* Market Info */}
      <div className="flex-5">
        <div className="flex items-center flex-row gap-3">
          {isDeposit ? (
            <div className="w-11 h-11 rounded-sm bg-blue-500/20 flex items-center justify-center shrink-0">
              <CircleDollarIcon className="text-blue-500" />
            </div>
          ) : (
            <Link to={NAVIGATIONS.prediction.eventDetails(item.eventSlug || item.slug)} className="shrink-0">
              <Avatar className="h-11 w-11 min-w-[44px] cursor-pointer rounded-sm">
                <AvatarImage src={item.icon} alt="Market icon" className="object-cover" />
                <AvatarFallback className="rounded-sm">{item.title.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
          )}

          <div className="flex flex-col gap-[2px] min-w-0">
            {isDeposit ? (
              <p className="text-sm font-medium text-white truncate">{t('prediction.history.depositedFunds')}</p>
            ) : (
              <>
                <Link to={NAVIGATIONS.prediction.eventDetails(item.eventSlug || item.slug)}>
                  <h2 className="text-white font-medium line-clamp-1 text-ellipsis overflow-hidden hover:underline cursor-pointer break-all text-[13px] leading-[21px]">
                    {item.title}
                  </h2>
                </Link>
                <div className={cn('flex flex-row items-center gap-[4px]', item.type === 'REDEEM' && 'hidden')}>
                  <div
                    className={cn(
                      'inline-flex items-center rounded-md border w-fit font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-xs px-1.5 py-0.5',
                      item.outcomeIndex === 0 ? 'bg-[#04332B] text-[#00CE89]' : 'bg-[#38120B] text-[#EA3B4F]',
                    )}
                  >
                    {item.outcome === 'Yes'
                      ? t('prediction.common.yes')
                      : item.outcome === 'No'
                        ? t('prediction.common.no')
                        : item.outcome}{' '}
                    {formatPrice(roundByTickSize(item.price, item.tokenYesTickSize), { showCurrency: false })}¢
                  </div>
                  <span className="font-medium text-gray-400 leading-[18px] tracking-[0.15px] text-[12px]">
                    {formatAmount(item.size)} {t('prediction.activities.shares')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Value & Time */}
      <div className="flex-1 flex items-center justify-end gap-4">
        <div className="text-right w-16 shrink-0">
          <p className={cn('text-sm font-medium', valueColor)}>
            {item.isLost ? (
              '--'
            ) : (
              <>
                {displaySign}
                {formatBalance(absUsdcSize, { showCurrency: true })}
              </>
            )}
          </p>
        </div>
        <span className="text-xs text-gray-500 font-medium w-24 text-right leading-tight">
          {formatToTimeAgoI18n(item.timestamp * 1000, { unitLabel: 'short' })}
        </span>
        <div className="flex items-center gap-2 w-8 justify-end shrink-0">
          <Link
            to={`${CHAIN_EXPLORER_TX_URLS[ChainIds.Polygon]}${item.transactionHash}`}
            target="_blank"
            onClick={(e) => !item.transactionHash && e.preventDefault()}
            rel="noopener noreferrer"
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded-sm border border-white/10 text-white hover:bg-white/5 transition-colors',
              !item.transactionHash && 'cursor-not-allowed opacity-50',
            )}
          >
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
