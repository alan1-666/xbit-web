import { cn } from '@/lib/utils'
import { IExtendedOpenOrder } from '@/modules/prediction/models/PortfolioModel'
import { X } from 'lucide-react'
import { MobileOpenOrderItem } from './MobileOpenOrderItem'
import { CancelOrderDialog } from './CancelOrderDialog'
import { useState } from 'react'
import { formatBalance } from '@/lib/format'

interface OpenOrderGroupChildProps {
  item: IExtendedOpenOrder
}

export const OpenOrderGroupChild = ({ item }: OpenOrderGroupChildProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <div className="hidden h-[60px] w-full items-center bg-transparent px-4 transition-colors hover:bg-white/5 xl:flex">
        {/* Indented empty market column */}
        <div className="pr-2" style={{ flex: '5 1 0%' }}></div>

        <div className="flex items-center px-2" style={{ flex: '0.5 1 0%' }}>
          <span className="text-sm font-medium text-white">{item.side}</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '1 1 0%' }}>
          <div
            className={cn(
              'text-xs font-medium py-0.5 px-1 rounded',
              item.outcome === 'Yes' ? 'text-rise' : 'text-fall',
            )}
          >
            {item.outcome}
          </div>
        </div>
        <div className="flex items-center px-2" style={{ flex: '0.5 1 0%' }}>
          <span className="text-sm text-white">{formatBalance(Number(item.price) * 100)}¢</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '1 1 0%' }}>
          <span className="text-sm text-white">{item.filled}</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '1 1 0%' }}>
          <span className="text-sm text-white">${item.total}</span>
        </div>
        <div className="flex items-center px-2" style={{ flex: '1.75 1 0%' }}>
          <span className="text-sm text-white">{item.expiration}</span>
        </div>
        <div className="flex items-center justify-end pl-2" style={{ flex: '2 1 0%' }}>
          <CancelOrderDialog orderId={item.id} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </CancelOrderDialog>
        </div>
      </div>

      <div className="flex w-full flex-col xl:hidden">
        <MobileOpenOrderItem item={item} showMarketHeader={false} />
      </div>
    </>
  )
}
