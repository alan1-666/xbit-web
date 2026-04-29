import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NAVIGATIONS } from '@/lib/navigations'
import { cn } from '@/lib/utils'
import { IExtendedOpenOrder } from '@/modules/prediction/models/PortfolioModel'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MobileOpenOrderItem } from './MobileOpenOrderItem'
import { formatBalance } from '@/lib/format'
import { CancelOrderDialog } from './CancelOrderDialog'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { roundByTickSize } from '@/utils/helpers'

interface OpenOrderRowProps {
  order: IExtendedOpenOrder
}

export const OpenOrderRow = ({ order }: OpenOrderRowProps) => {
  const { t } = useTranslation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div
      className="flex w-full flex-col
                items-center xl:border-b
                xl:border-white/5 bg-transparent
                xl:px-4 transition-colors
                xl:hover:bg-white/5 xl:flex-row
                max-xl:py-4 min-md:pb-0 xl:h-[65px] pb-2"
    >
      <div className="hidden h-[60px] w-full items-center xl:flex">
        <div className="min-w-0 flex-col gap-2.5 pr-2" style={{ flex: '5 1 0%' }}>
          <div className="flex items-center gap-3">
            <Link to={NAVIGATIONS.prediction.eventDetails(order.marketSlug)} className="shrink-0">
              <Avatar className="h-11 w-11 min-w-[44px] rounded-sm border border-white/5 cursor-pointer">
                <AvatarImage src={order.marketIcon} alt="Market" className="object-cover" />
                <AvatarFallback className="rounded-sm">M</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex min-w-0 flex-col gap-[2px]">
              <Link to={NAVIGATIONS.prediction.eventDetails(order.marketSlug)}>
                <h2 className="cursor-pointer break-all text-[13px] font-medium leading-[21px] text-white line-clamp-1 text-ellipsis overflow-hidden hover:underline">
                  {order.marketTitle}
                </h2>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center px-2" style={{ flex: '0.5 1 0%' }}>
          <span className="text-sm font-medium text-white">{order.side}</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '1 1 0%' }}>
          <div
            className={cn(
              'text-xs font-medium py-0.5 px-1 rounded',
              order.outcomeIndex === 0 ? 'text-rise' : 'text-fall',
            )}
          >
            {order.outcome}
          </div>
        </div>
        <div className="flex items-center px-2" style={{ flex: '0.5 1 0%' }}>
          <span className="text-sm text-white">{formatBalance(Number(order.price) * 100)}¢</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '1 1 0%' }}>
          <span className="text-sm text-white">{order.filled}</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '1 1 0%' }}>
          <span className="text-sm text-white">${order.total}</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '1.75 1 0%' }}>
          <span className="text-sm text-white">{order.expiration}</span>
        </div>
        <div className="flex items-center justify-end pl-2" style={{ flex: '2 1 0%' }}>
          <CancelOrderDialog orderId={order.id} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} />
            </button>
          </CancelOrderDialog>
        </div>
      </div>
      {/* Mobile View Single */}
      <div className="flex w-full flex-col xl:hidden px-3 pb-3">
        <MobileOpenOrderItem item={order} />
      </div>
    </div>
  )
}
