import { useTranslation } from 'react-i18next'

export interface OrderBookEmptyStateProps {
  type: 'bids' | 'asks'
}

export const OrderBookEmptyState = ({ type }: OrderBookEmptyStateProps) => {
  const { t } = useTranslation()
  const message = type === 'asks' ? t('prediction.orderBook.empty.noAsks') : t('prediction.orderBook.empty.noBids')

  return (
    <div className="grid grid-cols-3 h-9 items-center px-2 text-xs text-[#605E68]">
      <div className="col-span-3 text-center">{message}</div>
    </div>
  )
}
