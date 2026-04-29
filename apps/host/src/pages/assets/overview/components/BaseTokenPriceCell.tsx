import { formatPercent, formatPrice } from '@/lib/format'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'

export interface TokenPriceCellProps {
  price: number
  showPriceChange?: boolean
  price24hChange?: number | null
}

export const BaseTokenPriceCell = (props: TokenPriceCellProps) => {
  const { price24hChange = null, price, showPriceChange } = props
  const { isDesktop } = useResponsive()
  return (
    <div className={`flex ${isDesktop ? 'flex-col' : 'items-center flex-row gap-1.5'}`}>
      <div
        className={`${isDesktop ? 'text-white text-[calc(14rem/16)] font-[380]' : 'text-[#908E98] text-[12px] font-normal'}`}
      >
        {formatPrice(price, { showCurrency: true, roundMode: 'ceil' })}
      </div>
      {showPriceChange && price24hChange !== null ? (
        <div
          className={`text-[calc(12rem/16)] font-[330] ${price24hChange > 0 ? 'text-rise' : price24hChange < 0 ? 'text-fall' : 'text-[#6C6A74]'}`}
        >
          {formatPercent(price24hChange, {
            showSign: true,
          })}
        </div>
      ) : (
        <div className="text-[calc(12rem/16)] font-[330] text-[#6C6A74]"></div>
      )}
    </div>
  )
}
