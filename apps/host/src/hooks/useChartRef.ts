import { usePageType } from '@/hooks/usePageType'
import { chartRefRegistry } from '@/services/chartRefRegistry'
import { useMemo } from 'react'

type TvChartRef = {
  tvIndictor: () => void
  tvSetting: () => void
}

/**
 * Hook to get chart ref from registry based on current pageType
 * @returns Chart ref or null if not available
 */
export const useChartRef = (): TvChartRef | null => {
  const pageType = usePageType()
  
  return useMemo(() => {
    return chartRefRegistry.getRef(pageType)
  }, [pageType])
}

