import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatBalance, formatPercent, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { IPortfolioPosition } from '@/modules/prediction/models/PortfolioModel'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Share, X } from 'lucide-react'
import { useState, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations'
import { ArrowRightIcon } from '../../icons'
import { CashOutModal } from './CashOutModal'
import { Button } from '@/components/ui/button'

const MobilePositionItem = ({ item, isClosed }: { item: IPortfolioPosition; isClosed?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)
  const isProfit = item.cashPnl >= 0

  return (
    <div className="w-full px-3">
      <div className="xl:hidden">
        <div
          className={cn('flex items-center justify-between py-4', !isClosed ? 'cursor-pointer active:bg-white/5' : '')}
          role={!isClosed ? 'button' : undefined}
          tabIndex={!isClosed ? 0 : undefined}
          onClick={() => !isClosed && setIsOpen(!isOpen)}
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Avatar className="h-12 w-12 shrink-0 rounded-sm">
              <AvatarImage src={item.icon || '/placeholder.png'} alt="" className="object-cover" />
              <AvatarFallback className="rounded-sm">P</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link
                to={NAVIGATIONS.prediction.eventDetails(item.eventSlug || item.slug)}
                className="text-pretty text-sm font-medium text-white hover:underline block w-fit"
                onClick={(e: MouseEvent) => e.stopPropagation()}
              >
                {item.title}
              </Link>

              {isClosed ? (
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    {isProfit ? (
                      <>
                        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500">
                          <Check size={10} className="text-white" strokeWidth={3} />
                        </div>
                        <span className="font-medium text-rise">Won</span>
                      </>
                    ) : (
                      <>
                        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500">
                          <X size={10} className="text-white" strokeWidth={3} />
                        </div>
                        <span className="font-medium text-fall">Lost</span>
                      </>
                    )}
                  </div>
                  <span className="text-gray-400">
                    {parseFloat(item.size?.toFixed(2) || '0')} {item.outcome} at {(item.avgPrice * 100).toFixed(0)}¢
                  </span>
                </div>
              ) : (
                <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
                  <span>{formatBalance(item.initialValue)} on</span>
                  <span className={item.outcome === 'Yes' ? 'text-rise' : 'text-fall'}>{item.outcome}</span>
                  <span>to win {formatPrice(item.size)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end pl-2">
            <span className="text-sm font-medium text-white">{formatPrice(item.currentValue)}</span>
            <span className={cn('text-xs font-medium', isProfit ? 'text-rise' : 'text-fall')}>
              {isProfit ? '+' : ''}
              {formatPrice(item.cashPnl)} ({formatPercent(item.percentPnl)})
            </span>
          </div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-3 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-500">
                      <span>AVG</span>
                      <span>•</span>
                      <span>NOW</span>
                    </p>
                    <p className="flex items-center gap-1 text-sm font-medium">
                      <span className="text-white">{formatPrice(item.avgPrice * 100)}¢</span>
                      <ArrowRightIcon
                        className={cn('h-3 w-3', item.curPrice >= item.avgPrice ? 'text-rise' : 'text-fall')}
                      />
                      <span className={cn(item.curPrice >= item.avgPrice ? 'text-rise' : 'text-fall')}>
                        {formatPrice(item.curPrice * 100)}¢
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isClosed && (
                      <CashOutModal position={item}>
                        <Button className="h-7 min-w-[84px] rounded-[10px] bg-fall text-sm font-bold text-white shadow-[0px_3px_0px_0px_#a60215] transition-all hover:bg-fall/80 active:translate-y-[3px] active:shadow-none">
                          Sell
                        </Button>
                      </CashOutModal>
                    )}
                    {/* <button className="flex size-[30px] items-center justify-center rounded-sm border border-white/10 text-white transition hover:border-white/20 hover:text-white active:scale-[97%]">
                      <Share size={14} />
                    </button> */}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MobilePositionItem
