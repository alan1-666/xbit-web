import { formatPrice } from '@/lib/format'

interface OpenOrdersFooterProps {
  totals: {
    matched: number
    size: number
    amount: number
  }
}

export const OpenOrdersFooter = ({ totals }: OpenOrdersFooterProps) => {
  return (
    <>
      {/* Footer Total Row */}
      <div className="hidden h-[60px] items-center border-t-2 border-white/5 px-4 xl:flex">
        <div style={{ flex: '5 1 0%' }}>
          <span className="text-sm font-semibold text-white">Total</span>
        </div>
        <div style={{ flex: '0.5 1 0%' }} />
        <div style={{ flex: '1 1 0%' }} />
        <div style={{ flex: '0.5 1 0%' }} />
        <div style={{ flex: '1 1 0%' }}>
          <span className="text-sm font-semibold text-white">
            {totals.matched} / {totals.size}
          </span>
        </div>
        <div style={{ flex: '1 1 0%' }}>
          <span className="text-sm font-semibold text-white">{formatPrice(totals.amount)}</span>
        </div>
        <div style={{ flex: '1.75 1 0%' }} />
        <div style={{ flex: '2 1 0%' }} />
      </div>

      {/* Mobile Footer Total */}
      <div className="flex items-center justify-between border-t-2 border-white/5 py-3 px-4 xl:hidden">
        <span className="text-sm font-semibold text-white">Total</span>
        <div className="flex gap-4">
          <span className="text-sm font-semibold text-white">
            {totals.matched} / {totals.size}
          </span>
          <span className="text-sm font-semibold text-white">{formatPrice(totals.amount)}</span>
        </div>
      </div>
    </>
  )
}
