import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { IExtendedOpenOrder } from '@/modules/prediction/models/PortfolioModel'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { OpenOrderGroupChild } from './OpenOrderGroupChild'
import { MobileOpenOrderItem } from './MobileOpenOrderItem'
import { CancelAllOrdersDialog } from './CancelAllOrdersDialog'
import { useTranslation } from 'react-i18next'

interface OpenOrderGroupProps {
  group: {
    marketId: string
    orders: IExtendedOpenOrder[]
    marketTitle: string
    marketIcon: string
  }
  isExpanded: boolean
  onToggle: (marketId: string) => void
}

export const OpenOrderGroup = ({ group, isExpanded, onToggle }: OpenOrderGroupProps) => {
  const { t } = useTranslation()
  const [isCancelAllDialogOpen, setIsCancelAllDialogOpen] = useState(false)
  const orderIds = group.orders.map((order) => order.id)

  return (
    <div className="flex w-full flex-col border-b border-white/5">
      {/* Desktop Header Row */}
      <div className="hidden h-[65px] w-full items-center bg-transparent px-4 transition-colors hover:bg-white/5 xl:flex">
        <div className="min-w-0 flex-col gap-2 pr-2" style={{ flex: '5 1 0%' }}>
          <div className="flex items-center gap-3">
            <Link to="#" className="shrink-0">
              <div className="relative h-11 w-11 min-w-[44px] overflow-hidden rounded-sm">
                <Avatar className="h-full w-full rounded-sm">
                  <AvatarImage src={group.marketIcon} alt="Market" className="object-cover" />
                  <AvatarFallback className="rounded-sm">M</AvatarFallback>
                </Avatar>
              </div>
            </Link>
            <div className="flex min-w-0 flex-col gap-[2px]">
              <Link to="#">
                <h2 className="cursor-pointer break-all text-[13px] font-medium leading-[21px] text-white line-clamp-1 text-ellipsis overflow-hidden hover:underline">
                  {group.marketTitle}
                </h2>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center px-2" style={{ flex: '0.5 1 0%' }}>
          <span className="text-sm font-medium text-white">-</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '1 1 0%' }}>
          <span className="text-sm text-white">-</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '0.5 1 0%' }}>
          <span className="text-sm text-white">-</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '1 1 0%' }}>
          <span className="text-sm text-white">-</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '1 1 0%' }}>
          <span className="text-sm text-white">-</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '1.75 1 0%' }}>
          <span className="text-sm text-white">-</span>
        </div>
        <div className="flex items-center justify-end gap-4 pl-2" style={{ flex: '2 1 0%' }}>
          <button
            onClick={() => onToggle(group.marketId)}
            className="flex items-center gap-2 text-white transition-colors hover:text-white/80"
          >
            <span className="text-sm font-medium">
              {isExpanded ? t('prediction.orders.hide') : t('prediction.orders.count', { count: group.orders.length })}
            </span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <CancelAllOrdersDialog
            orderIds={orderIds}
            open={isCancelAllDialogOpen}
            onOpenChange={setIsCancelAllDialogOpen}
          >
            <button
              onClick={() => setIsCancelAllDialogOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </CancelAllOrdersDialog>
        </div>
      </div>

      {/* Desktop Children Rows */}
      <div className="hidden xl:block">
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {group.orders.map((item) => (
                <OpenOrderGroupChild key={item.id} item={item} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile View Multiple */}
      <div className="flex w-full flex-col xl:hidden px-3 pb-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div
            className="flex items-center justify-between gap-3 cursor-pointer"
            onClick={() => onToggle(group.marketId)}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="size-[24px] shrink-0 rounded-sm">
                <AvatarImage src={group.marketIcon} alt="Market" className="object-cover" />
                <AvatarFallback className="rounded-sm">M</AvatarFallback>
              </Avatar>
              <p className="truncate text-sm font-medium text-white">{group.marketTitle}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400">
                {isExpanded
                  ? t('prediction.orders.hide')
                  : t('prediction.orders.count', { count: group.orders.length })}
              </span>
              {isExpanded ? (
                <ChevronUp size={14} className="text-gray-400" />
              ) : (
                <ChevronDown size={14} className="text-gray-400" />
              )}
            </div>
          </div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-end pt-3 pb-2 border-b border-white/5 mb-3">
                  <CancelAllOrdersDialog
                    orderIds={orderIds}
                    open={isCancelAllDialogOpen}
                    onOpenChange={setIsCancelAllDialogOpen}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsCancelAllDialogOpen(true)
                      }}
                      className="text-xs font-medium text-red-500 active:text-red-400"
                    >
                      {t('prediction.orders.cancelAll')}
                    </button>
                  </CancelAllOrdersDialog>
                </div>
                <div className="flex flex-col gap-3">
                  {group.orders.map((item) => (
                    <MobileOpenOrderItem key={item.id} item={item} showMarketHeader={false} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
