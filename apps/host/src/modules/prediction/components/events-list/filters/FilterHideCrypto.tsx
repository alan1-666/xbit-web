import { usePredictionFilter } from '@/modules/prediction/contexts/PredictionFilterContext'
import FilterCheckbox from './FilterCheckbox'
import { useTranslation } from 'react-i18next'

function FilterHideCrypto() {
  const { filters, setHideCrypto } = usePredictionFilter()
  const { t } = useTranslation()

  return <FilterCheckbox label={t('prediction.filters.hideCrypto')} checked={filters.hideCrypto} onChange={setHideCrypto} />
}

export default FilterHideCrypto
