import { useTranslation } from 'react-i18next'

export const OpenOrdersHeader = () => {
  const { t } = useTranslation()
  return (
    <div className="hidden px-4 pb-2 bg-transparent border-b border-white/10 xl:flex text-[#FFFFFF80] text-sm font-[330]">
      <div className="pr-2" style={{ flex: '5 1 0%' }}>
        <span className="">{t('prediction.table.market')}</span>
      </div>
      <div className="px-2" style={{ flex: '0.5 1 0%' }}>
        <span className="">{t('prediction.table.side')}</span>
      </div>
      <div className="px-2" style={{ flex: '1 1 0%' }}>
        <span className="">{t('prediction.markets.outcome')}</span>
      </div>
      <div className="px-2" style={{ flex: '0.5 1 0%' }}>
        <span className="">{t('prediction.orders.price')}</span>
      </div>
      <div className="px-2" style={{ flex: '1 1 0%' }}>
        <span className="">{t('prediction.table.filled')}</span>
      </div>
      <div className="px-2" style={{ flex: '1 1 0%' }}>
        <span className="">{t('prediction.orderBook.header.total')}</span>
      </div>
      <div className="px-2" style={{ flex: '1.75 1 0%' }}>
        <span className="">{t('prediction.table.expiration')}</span>
      </div>
      <div className="flex justify-end pl-2" style={{ flex: '2 1 0%' }} />
    </div>
  )
}
