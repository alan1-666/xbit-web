import { useTranslation } from 'react-i18next'
import { ItemAsset } from './TabAssets'
import { dataOrderHistory } from './data'

const PositionHistoryV2 = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-2 mt-3">
      {dataOrderHistory.data.getUserTradeHistory.histories.map((item, index) => (
        <ItemAsset item={item} t={t} key={index} />
      ))}

      <div className="h-16" />
    </div>
  )
}

export default PositionHistoryV2
