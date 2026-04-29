import { Control } from 'react-hook-form'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { BaseSelector } from '@components/discover/filter/BaseSelector.tsx'
import { useTranslation } from 'react-i18next'

export interface ProgressSelectorProps {
  control: Control<FilterFormData>
  allowSorting?: boolean
}

const options = [
  {
    label: '>50%',
    min: 50,
    key: '>50',
    max: undefined,
  },
  {
    label: '>70%',
    min: 70,
    key: '>70',
    max: undefined,
  },
  {
    label: '>90%',
    min: 90,
    key: '>90',
    max: undefined,
  },
]

export const ProgressSelector = (props: ProgressSelectorProps) => {
  const { control, allowSorting } = props
  const { t } = useTranslation()
  return (
    <BaseSelector
      control={control}
      name="progress"
      title={t('filter.internalProgress')}
      options={options}
      minimumLabel={t('filter.minProgress')}
      maximumLabel={t('filter.maxProgress')}
      unit="%"
      allowSort={allowSorting}
    />
  )
}
