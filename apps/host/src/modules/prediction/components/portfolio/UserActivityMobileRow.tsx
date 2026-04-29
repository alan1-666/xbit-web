import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { CHAIN_EXPLORER_TX_URLS } from '@/lib/constant'
import { ChainIds } from '@/types/enums'
import { formatAmount, formatBalance, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { roundByTickSize } from '@/utils/helpers'
import { formatToTimeAgoI18n } from '@/utils/time'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IHistoryItem } from '../../models/PortfolioModel'
import { CircleDollarIcon } from '../icons'
import { NAVIGATIONS } from '@/lib/navigations'
import { useTranslation } from 'react-i18next'

interface UserActivityMobileRowProps {
  item: IHistoryItem
  activityLabel: string
  isDeposit: boolean
  isTrade: boolean
  isBuy: boolean
  valueColor: string
  displaySign: string
  absUsdcSize: number
  isExpanded: boolean
  toggleExpand: () => void
  iconColor?: string
}

export const UserActivityMobileRow = ({
  item,
  activityLabel,
  isDeposit,
  isTrade,
  valueColor,
  displaySign,
  absUsdcSize,
  isExpanded,
  toggleExpand,
  iconColor,
}: UserActivityMobileRowProps) => {
  const { t } = useTranslation()
  const Subtitle = isTrade ? (
    <span className="text-xs text-gray-400">
      {activityLabel} {formatAmount(item.size, { showCurrency: false })}{' '}
      {item.outcome === 'Yes'
        ? t('prediction.common.yes')
        : item.outcome === 'No'
          ? t('prediction.common.no')
          : item.outcome}{' '}
      {t('prediction.history.at')}{' '}
      {formatPrice(roundByTickSize(item.price, item.tokenYesTickSize), { showCurrency: false })}¢
    </span>
  ) : null

  return (
    <div className="flex flex-col xl:hidden border-b border-white/10">
      {/* Header Row */}
      <div
        className="flex items-start justify-between py-4 px-4 cursor-pointer gap-3 active:bg-white/5 transition-colors"
        role="button"
        onClick={toggleExpand}
      >
        {/* Left: Icon + Title */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          {isDeposit ? (
            <div className="w-12 h-12 rounded-sm bg-blue-500/20 flex items-center justify-center shrink-0">
              <CircleDollarIcon className="text-blue-500 w-6 h-6" />
            </div>
          ) : (
            <Link
              to={NAVIGATIONS.prediction.eventDetails(item.eventSlug || item.slug)}
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-12 w-12 min-w-12 cursor-pointer rounded-sm">
                <AvatarImage src={item.icon} alt="Market icon" className="object-cover" />
                <AvatarFallback className="rounded-sm">M</AvatarFallback>
              </Avatar>
            </Link>
          )}

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col items-start gap-1 text-left">
              {item.type === 'REDEEM' ? (
                <>
                  <Link
                    to={NAVIGATIONS.prediction.eventDetails(item.eventSlug || item.slug)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-sm font-medium text-white text-pretty line-clamp-2 leading-snug">{item.title}</p>
                  </Link>
                  <div className="flex flex-row items-center gap-[4px] mt-1">
                    <span className={cn('text-xs font-medium', iconColor)}>{activityLabel}</span>
                  </div>
                </>
              ) : isTrade ? (
                <>
                  <Link
                    to={NAVIGATIONS.prediction.eventDetails(item.eventSlug || item.slug)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-sm font-medium text-white text-pretty line-clamp-2 leading-snug">{item.title}</p>
                  </Link>
                  {Subtitle}
                </>
              ) : (
                <p className="text-sm font-medium text-white pt-1">
                  {isDeposit ? t('prediction.history.depositedFunds') : t('prediction.history.withdrewFunds')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Value + Time + Arrow */}
        <div className="flex items-center gap-2 my-auto">
          <div className="flex flex-col items-end text-right gap-1">
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
            <span className="text-xs text-gray-500">
              {formatToTimeAgoI18n(item.timestamp * 1000, { unitLabel: 'short' }) === '--' ? (
                '--'
              ) : (
                <>
                  {formatToTimeAgoI18n(item.timestamp * 1000, { unitLabel: 'short' })} {t('prediction.history.ago')}
                </>
              )}
            </span>
          </div>
          <ChevronDown
            size={16}
            className={cn('text-gray-500 ml-1 transition-transform duration-200', isExpanded ? 'rotate-180' : '')}
          />
        </div>
      </div>

      {/* Expanded Detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-white/5"
          >
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  {isTrade && (
                    <>
                      <div>
                        <p className="text-[11px] text-gray-500 capitalize tracking-wider mb-0.5">
                          {t('prediction.table.avg')}
                        </p>
                        <p className="text-sm font-medium text-white">
                          {formatPrice(roundByTickSize(item.price, item.tokenYesTickSize), { showCurrency: false })}¢
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 capitalize tracking-wider mb-0.5">
                          {t('prediction.activities.shares')}
                        </p>
                        <p className="text-sm font-medium text-white">{formatAmount(item.size)}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <>
                    <div className=""></div>

                    {/* {isTrade && ( */}
                    <Link
                      to={NAVIGATIONS.prediction.eventDetails(item.eventSlug || item.slug)}
                      className={buttonVariants({
                        variant: 'gradient',
                        className:
                          'h-8! px-6 flex items-center justify-center text-xs font-medium text-white transition-colors',
                      })}
                    >
                      {t('prediction.history.view')}
                    </Link>
                    {/* )} */}
                    <Link
                      to={`${CHAIN_EXPLORER_TX_URLS[ChainIds.Polygon]}${item.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => !item.transactionHash && e.preventDefault()}
                      className={cn(
                        'h-8 w-8 flex items-center justify-center rounded-sm border border-white/10 text-white hover:bg-white/5 transition-colors',
                        !item.transactionHash && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
