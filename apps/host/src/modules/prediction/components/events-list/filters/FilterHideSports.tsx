import { usePredictionFilter } from '@/modules/prediction/contexts/PredictionFilterContext'
import FilterCheckbox from './FilterCheckbox'
import { useTranslation } from 'react-i18next'

function FilterHideSports() {
  const { filters, setHideSports } = usePredictionFilter()
  const { t } = useTranslation()

  return <FilterCheckbox label={t('prediction.filters.hideSports')} checked={filters.hideSports} onChange={setHideSports} />
}

export default FilterHideSports
