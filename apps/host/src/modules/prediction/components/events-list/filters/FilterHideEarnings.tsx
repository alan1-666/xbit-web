import { usePredictionFilter } from '@/modules/prediction/contexts/PredictionFilterContext'
import FilterCheckbox from './FilterCheckbox'
import { useTranslation } from 'react-i18next'

function FilterHideEarnings() {
  const { filters, setHideEarnings } = usePredictionFilter()
  const { t } = useTranslation()

  return <FilterCheckbox label={t('prediction.filters.hideEarnings')} checked={filters.hideEarnings} onChange={setHideEarnings} />
}

export default FilterHideEarnings
