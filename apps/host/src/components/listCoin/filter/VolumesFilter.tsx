import { Control, useWatch } from 'react-hook-form'
import FilterField, { FilterFormData } from '@components/listCoin/filter/FilterField.tsx'
import { Field } from '@components/listCoin/filter/types.ts'
import { useTranslation } from 'react-i18next'

export interface VolumesFilterProps {
  control: Control<FilterFormData>
  field: Field
}

export default function VolumesFilter(props: VolumesFilterProps) {
  const { control, field } = props
  const { t } = useTranslation()
  const period = useWatch({ control, name: 'period' })
  const title = t('detail.trading.volume', { time: `${period.value ?? ''}${period.unit ?? ''}` })
  return (
    <FilterField
      key="volumes"
      fieldKey="volumes"
      title={title}
      control={control}
      options={field.options}
      customized
      sortable
      minimumLabel={field.minimumLabel}
      maximumLabel={field.maximumLabel}
      unit={field.unit}
      formatter={field.formatter}
    />
  )
}
