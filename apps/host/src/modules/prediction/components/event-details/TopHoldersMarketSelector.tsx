import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'

export interface TopHoldersMarketSelectorProps {
  markets: MarketModel[]
  currentMarket: string
  onChange?: (marketId: string) => void
}

import { useTranslation } from 'react-i18next'

export const TopHoldersMarketSelector = (props: TopHoldersMarketSelectorProps) => {
  const { markets, currentMarket, onChange } = props
  const { t } = useTranslation()

  if (markets.length < 2) {
    return null
  }

  return (
    <Select value={currentMarket} onValueChange={onChange}>
      <SelectTrigger className="w-auto">
        <SelectValue placeholder={t('prediction.common.selectMarket')} />
      </SelectTrigger>
      <SelectContent>
        {markets.map((market) => (
          <SelectItem key={market.id} value={market.id.toString()}>
            {market.groupItemTitle}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
