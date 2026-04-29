import { FieldPath } from 'react-hook-form'
import { FilterFormData, FilterItemType } from '@components/listCoin/filter/FilterField.tsx'

export interface Field {
  key: FieldPath<FilterFormData>
  title: string
  minimumLabel: string
  maximumLabel: string
  unit: string
  options: FilterItemType[]
  customize?: boolean
  sortable?: boolean
  formatter?: (value: number, unit: string) => string
}
