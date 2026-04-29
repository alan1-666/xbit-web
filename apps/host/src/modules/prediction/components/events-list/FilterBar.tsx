import { usePredictionFilter } from '@/modules/prediction/contexts/PredictionFilterContext'
import { cn } from '@/lib/utils'
import FilterSortBy from './filters/FilterSortBy'
import FilterEventFrequency from './filters/FilterEventFrequency'
import FilterActive from './filters/FilterActive'
import FilterHideSports from './filters/FilterHideSports'
import FilterHideCrypto from './filters/FilterHideCrypto'
import FilterHideEarnings from './filters/FilterHideEarnings'
import ClearFiltersButton from './filters/ClearFiltersButton'
import React, { useCallback, useRef } from 'react'

function FilterBar() {
  const { isFilterActive } = usePredictionFilter()
  const containerRef = useRef<HTMLDivElement>(null)

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return

    // Translate vertical scroll into horizontal scroll if vertical is dominant
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      el.scrollLeft += e.deltaY
    }
  }, [])

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-400 ease-out pt-2 lg:pt-3',
        isFilterActive ? 'max-h-[44px] opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0',
      )}
    >
      <div
        ref={containerRef}
        onWheel={onWheel}
        className="flex items-center gap-2 w-full overflow-x-auto no-scrollbar overscroll-contain"
      >
        <FilterSortBy />
        <FilterEventFrequency />
        <FilterActive />
        <FilterHideSports />
        <FilterHideCrypto />
        <FilterHideEarnings />
        <ClearFiltersButton />
      </div>
    </div>
  )
}

export default FilterBar
