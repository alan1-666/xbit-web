import { EventFrequency, EventSortField } from '@/@generated/gql/graphql-prediction'
import { createContext, useContext, useState, ReactNode, useMemo } from 'react'

export interface EventFilters {
  sortBy: EventSortField
  frequency: EventFrequency
  status: string
  hideSports: boolean
  hideCrypto: boolean
  hideEarnings: boolean
}

const DEFAULT_FILTERS: EventFilters = {
  sortBy: EventSortField.Volume_24H,
  frequency: EventFrequency.All,
  status: 'active',
  hideSports: false,
  hideCrypto: false,
  hideEarnings: false,
}

interface PredictionFilterContextType {
  isFilterActive: boolean
  setIsFilterActive: (active: boolean) => void
  toggleFilter: () => void
  filters: EventFilters
  setSortBy: (sortBy: EventSortField) => void
  setFrequency: (frequency: EventFrequency) => void
  setStatus: (status: string) => void
  setHideSports: (hide: boolean) => void
  setHideCrypto: (hide: boolean) => void
  setHideEarnings: (hide: boolean) => void
  clearFilters: () => void
  hasChangedFilters: boolean
}

const PredictionFilterContext = createContext<PredictionFilterContextType | undefined>(undefined)

export const PredictionFilterProvider = ({ children }: { children: ReactNode }) => {
  const [isFilterActive, setIsFilterActive] = useState(false)
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS)

  const toggleFilter = () => {
    setIsFilterActive((prev) => !prev)
  }

  const hasChangedFilters = useMemo(() => {
    return (
      filters.sortBy !== DEFAULT_FILTERS.sortBy ||
      filters.frequency !== DEFAULT_FILTERS.frequency ||
      filters.status !== DEFAULT_FILTERS.status ||
      filters.hideSports !== DEFAULT_FILTERS.hideSports ||
      filters.hideCrypto !== DEFAULT_FILTERS.hideCrypto ||
      filters.hideEarnings !== DEFAULT_FILTERS.hideEarnings
    )
  }, [filters])

  const setSortBy = (sortBy: EventSortField) => {
    setFilters((prev) => ({ ...prev, sortBy }))
  }

  const setFrequency = (frequency: EventFrequency) => {
    setFilters((prev) => ({ ...prev, frequency }))
  }

  const setStatus = (status: string) => {
    setFilters((prev) => ({ ...prev, status }))
  }

  const setHideSports = (hideSports: boolean) => {
    setFilters((prev) => ({ ...prev, hideSports }))
  }

  const setHideCrypto = (hideCrypto: boolean) => {
    setFilters((prev) => ({ ...prev, hideCrypto }))
  }

  const setHideEarnings = (hideEarnings: boolean) => {
    setFilters((prev) => ({ ...prev, hideEarnings }))
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <PredictionFilterContext.Provider
      value={{
        isFilterActive,
        setIsFilterActive,
        toggleFilter,
        filters,
        setSortBy,
        setFrequency,
        setStatus,
        setHideSports,
        setHideCrypto,
        setHideEarnings,
        clearFilters,
        hasChangedFilters,
      }}
    >
      {children}
    </PredictionFilterContext.Provider>
  )
}

export const usePredictionFilter = () => {
  const context = useContext(PredictionFilterContext)
  if (context === undefined) {
    throw new Error('usePredictionFilter must be used within a PredictionFilterProvider')
  }
  return context
}
