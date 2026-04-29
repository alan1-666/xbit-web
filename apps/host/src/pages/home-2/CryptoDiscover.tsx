import MarketOverviewList from '@/pages/futures-market/components/market-overview-list'
import { useTranslation } from 'react-i18next'

const CryptoDiscover = () => {
  const { t } = useTranslation()
  return (
    <div>
      <div className="px-3 text-[16px]">{t('assets.funding.crypto')}</div>
      <MarketOverviewList type={'home'} />
    </div>
  )
}

export default CryptoDiscover
