import { EventSortField } from '@/@generated/gql/graphql-prediction'
import { usePredictionFilter } from '@/modules/prediction/contexts/PredictionFilterContext'
import FilterWithDropdown from './FilterWithDropdown'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

function FilterSortBy() {
  const { filters, setSortBy } = usePredictionFilter()
  const { t } = useTranslation()

  const sortByOptions = useMemo(() => [
    { label: t('prediction.filters.sortBy.24hVolume'), value: EventSortField.Volume_24H },
    { label: t('prediction.filters.sortBy.volume'), value: EventSortField.Volume },
    { label: t('prediction.filters.sortBy.liquidity'), value: EventSortField.Liquidity },
    { label: t('prediction.filters.sortBy.newest'), value: EventSortField.StartDate },
    { label: t('prediction.filters.sortBy.endingSoon'), value: EventSortField.EndDate },
    { label: t('prediction.filters.sortBy.competitive'), value: EventSortField.Competitive },
  ], [t])

  return (
    <FilterWithDropdown
      title={t('prediction.filters.sortBy.title')}
      options={sortByOptions}
      value={filters.sortBy}
      onValueChange={(value) => setSortBy(value as EventSortField)}
    />
  )
}

export default FilterSortBy
