import { Control, useWatch } from 'react-hook-form'
import FilterField, { FilterFormData, FilterItemType } from '@components/listCoin/filter/FilterField.tsx'
import { useTranslation } from 'react-i18next'

export interface TransactionsFilterProps {
  control: Control<FilterFormData>
  options: FilterItemType[]
  formatter?: (value: number, unit: string) => string
}

export default function TransactionsFilter(props: TransactionsFilterProps) {
  const { control, options, formatter } = props
  const { t } = useTranslation()
  const period = useWatch({ control, name: 'period' })
  const title = t('detail.trading.transactions', { time: `${period?.value ?? ''}${period?.unit ?? ''}` })
  return (
    <FilterField
      key="transactions"
      fieldKey="transactions"
      title={title}
      control={control}
      options={options}
      customized
      sortable
      minimumLabel={t('filter.minTransactions')}
      maximumLabel={t('filter.maxTransactions')}
      unit={t('filter.transactions')}
      formatter={formatter}
    />
  )
}
