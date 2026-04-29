import { Control } from 'react-hook-form'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { BaseSelector, SelectorOption } from '@components/discover/filter/BaseSelector.tsx'
import { useTranslation } from 'react-i18next'

export interface LiquidityPoolSelectorProps {
  control: Control<FilterFormData>
  allowSorting?: boolean
}

const options: SelectorOption[] = [
  {
    label: '>$10K',
    min: 10000,
    key: '>10k',
    max: undefined,
  },
  {
    label: '>$100K',
    min: 100000,
    key: '>100k',
    max: undefined,
  },
  {
    label: '>$300K',
    min: 300000,
    key: '>300k',
    max: undefined,
  },
  {
    label: '>$500K',
    min: 500000,
    key: '>500k',
    max: undefined,
  },
]

export const LiquidityPoolSelector = (props: LiquidityPoolSelectorProps) => {
  const { control, allowSorting } = props
  const { t } = useTranslation()

  return (
    <BaseSelector
      control={control}
      name="liquidityPool"
      title={t('listCoin.columns.pool')}
      options={options}
      minimumLabel={t('filter.minPool')}
      maximumLabel={t('filter.maxPool')}
      unit="$"
      allowSort={allowSorting}
    />
  )
}
