import { Control, useWatch } from 'react-hook-form'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { useTranslation } from 'react-i18next'
import { BaseSelector, SelectorOption } from '@components/discover/filter/BaseSelector.tsx'

export interface TransactionsSelectorProps {
  control: Control<FilterFormData>
  allowSorting?: boolean
}

const options: SelectorOption[] = [
  {
    label: '>200',
    min: 200,
    key: '>200',
    max: undefined,
  },
  {
    label: '>500',
    min: 500,
    key: '>500',
    max: undefined,
  },
  {
    label: '>1000',
    min: 1000,
    key: '>1000',
    max: undefined,
  },
  {
    label: '>2000',
    min: 2000,
    key: '>2000',
    max: undefined,
  },
]

export const TransactionsSelector = (props: TransactionsSelectorProps) => {
  const { control, allowSorting } = props
  const { t } = useTranslation()

  const timeframe = useWatch({ control, name: 'timeframe' })
  const title = t('detail.trading.transactions', { time: timeframe })
  return (
    <BaseSelector
      control={control}
      name="transactions"
      title={title}
      options={options}
      minimumLabel={t('filter.minTransactions')}
      maximumLabel={t('filter.maxTransactions')}
      unit={t('filter.transactions')}
      allowSort={allowSorting}
    />
  )
}
