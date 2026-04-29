import { cn } from '@/lib/utils.ts'
import { useTranslation } from 'react-i18next'
import { DisplayPriceType } from '@/types/enums.ts'

type OrderBookTableHeaderProps = {
  className?: string
  priceType?: DisplayPriceType
  handleChangeCurrency: () => void
  handleChangePriceType: () => void
}
const OrderBookTableHeader = ({
  className,
  priceType,
  handleChangeCurrency,
  handleChangePriceType,
}: OrderBookTableHeaderProps) => {
  const { t } = useTranslation()

  return (
    <div className={cn('grid grid-cols-5 gap-1 w-full bg-[#111] text-[#908E98]', className)}>
      <div className="col-span-2 flex items-center gap-[2px] select-none cursor-pointer" onClick={handleChangeCurrency}>
        <div className="font-[330] text-[10px] leading-none whitespace-nowrap">{t('detail.tokenDetail.volume')}</div>
        <img src="/images/orderBook/icon-refund.svg" className="w-3 min-w-3" alt="change currency" />
      </div>

      <div
        className="col-span-2 flex items-center gap-[2px] flex-1 select-none cursor-pointer"
        onClick={handleChangePriceType}
      >
        <div className="font-[330] text-[10px] leading-none whitespace-nowrap">
          {priceType === DisplayPriceType.PRICE ? t('orderBook.price') : t('orderBook.marketCap')}
        </div>
        <img src="/images/futuresDetail/arrow-swap-icon.svg" className="w-2.5 min-w-2.5" alt="change mc - price" />
      </div>

      <div className="flex items-center justify-end gap-[2px] select-none">
        <div className="font-[330] text-[10px] leading-none whitespace-nowrap">{t('orderBook.time')}</div>
      </div>
    </div>
  )
}

export default OrderBookTableHeader
