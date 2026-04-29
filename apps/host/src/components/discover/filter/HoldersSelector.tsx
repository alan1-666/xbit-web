import { Control } from 'react-hook-form'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { useTranslation } from 'react-i18next'
import { BaseSelector, SelectorOption } from '@components/discover/filter/BaseSelector.tsx'

const options: SelectorOption[] = [
  { min: 100, max: undefined, label: '>100', key: '>100' },
  { min: 500, max: undefined, label: '>500', key: '>500' },
  { min: 1000, max: undefined, label: '>1000', key: '>1000' },
  { min: 2000, max: undefined, label: '>2000', key: '>2000' },
]

export interface HoldersSelectorProps {
  control: Control<FilterFormData>
  allowSorting?: boolean
}

export const HoldersSelector = (props: HoldersSelectorProps) => {
  const { control, allowSorting } = props
  const { t } = useTranslation()

  return (
    <BaseSelector
      control={control}
      name="holders"
      title={t('listCoin.columns.holders')}
      options={options}
      minimumLabel={t('filter.minHolders')}
      maximumLabel={t('filter.maxHolders')}
      unit=""
      allowSort={allowSorting}
    />
  )
}
