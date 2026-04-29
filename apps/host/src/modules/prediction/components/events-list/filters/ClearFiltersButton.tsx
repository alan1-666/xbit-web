import { usePredictionFilter } from '@/modules/prediction/contexts/PredictionFilterContext'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

function ClearFiltersButton() {
  const { clearFilters, hasChangedFilters } = usePredictionFilter()
  const { t } = useTranslation()

  if (!hasChangedFilters) {
    return null
  }

  return (
    <button
      type="button"
      onClick={clearFilters}
      className={cn(
        'text-sm text-white/70 hover:text-white transition-colors h-7.5 px-3 rounded-full',
        'hover:underline cursor-pointer border border-[#2F3F50] whitespace-nowrap'
      )}
    >
      {t('prediction.filters.clearFilters')}
    </button>
  )
}

export default ClearFiltersButton
