import { Button } from '@/components/ui/button'
import { NAVIGATIONS } from '@/lib/navigations'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { IExtendedOpenOrder } from '@/modules/prediction/models/PortfolioModel'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CancelOrderDialog } from './CancelOrderDialog'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatBalance } from '@/lib/format.ts'

interface MobileOpenOrderItemProps {
  item: IExtendedOpenOrder
  showMarketHeader?: boolean
  tickSize?: number
}

export const MobileOpenOrderItem = ({ item, showMarketHeader = true }: MobileOpenOrderItemProps) => {
  const { t } = useTranslation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const formattedPrice = (+item.price * 100).toLocaleString('en-US')

  return (
    <div className="">
      {/* Header */}
      {showMarketHeader && (
        <Link
          to={NAVIGATIONS.prediction.eventDetails(item.marketSlug)}
          className="flex items-center justify-between gap-3 pb-3 cursor-pointer"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar className="size-6 shrink-0 rounded-sm">
              <AvatarImage src={item.marketIcon} alt="" className="object-cover" />
              <AvatarFallback className="rounded-sm">M</AvatarFallback>
            </Avatar>
            <p className="truncate text-sm font-medium text-white">{item.marketTitle}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </Link>
      )}
      <div className="border-[0.5px] border-[#79778C29] rounded-[8px] bg-[#101114] overflow-hidden">
        {/* Top Row: Qty - Outcome - Side - Cancel */}
        <div className="flex items-center justify-between p-2 bg-[#18181B]">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-sm px-1.5 py-0.5 text-xs font-medium',
                item.outcomeIndex === 0 ? 'text-rise bg-[#04332B]' : 'text-fall bg-[#3E1B1B]',
              )}
            >
              {item.outcome}
            </span>
            <div className="h-[16px] w-px bg-white/10"></div>
            <span className={cn('text-xs font-medium', item.side === 'Buy' ? 'text-rise' : 'text-fall')}>
              {item.side}
            </span>
          </div>
          <div>
            <CancelOrderDialog orderId={item.id} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                className="h-7 px-3 text-xs font-medium text-white hover:bg-white/5 hover:text-white rounded-md bg-[#2C2C34]"
              >
                {t('prediction.orders.cancel')}
              </Button>
            </CancelOrderDialog>
          </div>
        </div>

        {/* Details Matrix */}
        <div className="mt-2 grid grid-cols-3 gap-2 px-2">
          <div className="flex flex-col">
            <span className="text-xs text-[#605E68]">{t('prediction.orders.shares')}</span>
            <span className="text-sm font-medium text-white">{item.filled}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-[#605E68]">{t('prediction.orders.price')}</span>
            <span className="text-sm font-medium text-white">{formattedPrice}¢</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-[#605E68]">{t('prediction.orders.initialCost')}</span>
            <span className="text-sm font-medium text-white">
              {formatBalance(item.total ? +item.total : 0, { showCurrency: true })}
            </span>
          </div>
        </div>

        {/* Footer: Timestamp (and Pending text if needed, but removed as per request) */}
        <div className="mt-4 pt-3 flex justify-between items-center p-2 border-t-[0.5px] border-[#79778C29]">
          <span className="text-xs text-[#605E68]">{item.expiration}</span>
        </div>
      </div>
    </div>
  )
}
