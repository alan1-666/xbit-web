import { usePredictionFilter } from '@/modules/prediction/contexts/PredictionFilterContext'
import FilterWithDropdown from './FilterWithDropdown'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

function FilterActive() {
  const { filters, setStatus } = usePredictionFilter()
  const { t } = useTranslation()

  const statusOptions = useMemo(() => [
    { label: t('prediction.filters.status.active'), value: 'active' },
    { label: t('prediction.filters.status.resolved'), value: 'resolved' },
  ], [t])

  return (
    <FilterWithDropdown
      title={t('prediction.filters.status.title')}
      options={statusOptions}
      value={filters.status}
      onValueChange={setStatus}
    />
  )
}

export default FilterActive
