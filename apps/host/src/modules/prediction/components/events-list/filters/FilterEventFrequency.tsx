import { EventFrequency } from '@/@generated/gql/graphql-prediction'
import { usePredictionFilter } from '@/modules/prediction/contexts/PredictionFilterContext'
import FilterWithDropdown from './FilterWithDropdown'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

function FilterEventFrequency() {
  const { filters, setFrequency } = usePredictionFilter()
  const { t } = useTranslation()

  const eventFrequencyOptions = useMemo(() => [
    { label: t('prediction.filters.all'), value: EventFrequency.All },
    { label: t('prediction.filters.daily'), value: EventFrequency.Daily },
    { label: t('prediction.filters.weekly'), value: EventFrequency.Weekly },
    { label: t('prediction.filters.monthly'), value: EventFrequency.Monthly },
  ], [t])

  return (
    <FilterWithDropdown
      title={t('prediction.filters.frequency.title')}
      options={eventFrequencyOptions}
      value={filters.frequency}
      onValueChange={(value) => setFrequency(value as EventFrequency)}
    />
  )
}

export default FilterEventFrequency
