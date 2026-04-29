import { Control } from 'react-hook-form'
import { FilterFormData } from './FilterFormData'
import { BaseSelector, SelectorOption } from '@components/discover/filter/BaseSelector.tsx'
import { useTranslation } from 'react-i18next'

const options: SelectorOption[] = [
  {
    label: '>$50K',
    min: 50000,
    key: '>50k',
    max: undefined,
  },
  {
    label: '>$100K',
    min: 100000,
    key: '>100k',
    max: undefined,
  },
  {
    label: '>$500K',
    min: 500000,
    key: '>500k',
    max: undefined,
  },
  {
    label: '>$1M',
    min: 1000000,
    key: '>1m',
    max: undefined,
  },
]

export interface MarketCapSelectorProps {
  control: Control<FilterFormData>
  allowSorting?: boolean
}

export const MarketCapSelector = (props: MarketCapSelectorProps) => {
  const { control, allowSorting } = props
  const { t } = useTranslation()

  return (
    <BaseSelector
      control={control}
      name="marketCap"
      title={t('filter.marketCap')}
      options={options}
      minimumLabel={t('filter.minMarketCap')}
      maximumLabel={t('filter.maxMarketCap')}
      unit="$"
      allowSort={allowSorting}
    />
  )
}
