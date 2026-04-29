import { useTranslation } from 'react-i18next'

export const OrderBookHeader = () => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-3 h-9 items-center border-y px-3 text-[#605E68] font-light text-xs">
      <div className="px-0">{t('prediction.orderBook.header.price')}</div>
      <div className="px-0 text-end">{t('prediction.orderBook.header.shares')}</div>
      <div className="px-0 text-end">{t('prediction.orderBook.header.total')}</div>
    </div>
  )
}
