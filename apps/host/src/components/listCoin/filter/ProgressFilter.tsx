import { Control, useWatch } from 'react-hook-form'
import FilterField, { FilterFormData } from '@components/listCoin/filter/FilterField.tsx'
import { Field } from '@components/listCoin/filter/types.ts'

export interface ProgressFilterProps {
  control: Control<FilterFormData>
  field: Field
}
export default function ProgressFilter(props: ProgressFilterProps) {
  const { control, field } = props
  const dex = useWatch({ control, name: 'dex' })
  return (
    <FilterField
      key="progress"
      fieldKey="progress"
      title={field.title}
      control={control}
      options={field.options}
      customized
      sortable
      minimumLabel={field.minimumLabel}
      maximumLabel={field.maximumLabel}
      unit={field.unit}
      disabled={dex?.data === 'Raydium'}
      formatter={field.formatter}
    />
  )
}
