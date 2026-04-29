import { formatPrice } from '@/lib/format.ts'
import { useTranslation } from 'react-i18next'

export interface OrderBookSpreadProps {
  last: number
  spread: number
}

export const OrderBookSpread = ({ last, spread }: OrderBookSpreadProps) => {
  const { t } = useTranslation()

  return (
    <div className="border-y relative grid grid-cols-3 h-9 items-center px-2 text-xs text-[#605E68]">
      <div>
        {t('prediction.orderBook.spread.last')} {formatPrice(last * 100)}¢
      </div>
      <div className="text-end">
        {t('prediction.orderBook.spread.spread')} {formatPrice(spread)}¢
      </div>
    </div>
  )
}
