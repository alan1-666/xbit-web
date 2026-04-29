import { useState, useCallback, useMemo } from 'react'

// Sorting types
export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  column: string | null
  direction: SortDirection
  activeColor?: string
}

// Generic function to handle sorting of any data type
function sortData<T>(data: T[], sortState: SortState): T[] {
  if (!sortState.column || !sortState.direction) {
    return data
  }

  return [...data].sort((a, b) => {
    const aValue = a[sortState.column as keyof T]
    const bValue = b[sortState.column as keyof T]

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortState.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    // Default comparison for other types
    const valueA = String(aValue).toLowerCase()
    const valueB = String(bValue).toLowerCase()

    return sortState.direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
  })
}

interface UseSortableTableReturn<T> {
  sortedData: T[]
  sortState: SortState
  handleSort: (column: string) => void
  getSortIndicator: (column: string, activeColorProps?: string) => {
    upColor: string
    downColor: string
  }
}

export default function useSortableTable<T>(initialData: T[]): UseSortableTableReturn<T> {
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null,
  })

  const handleSort = useCallback((column: string) => {
    setSortState((prevState) => {
      // If clicking the same column, cycle through sort directions
      if (prevState.column === column) {
        const nextDirection = prevState.direction === null ? 'asc' : prevState.direction === 'asc' ? 'desc' : null

        return {
          column: nextDirection === null ? null : column,
          direction: nextDirection,
        }
      }

      // If clicking a new column, start with ascending sort
      return {
        column,
        direction: 'asc',
      }
    })
  }, [])

  const getSortIndicator = useCallback(
    (column: string, activeColorProps?: string) => {
      const activeColor = activeColorProps ? activeColorProps : '#843BEA'
      const inactiveColor = '#5E5C66'

      let upColor = inactiveColor
      let downColor = inactiveColor

      if (sortState.column === column) {
        if (sortState.direction === 'asc') {
          upColor = activeColor
        } else if (sortState.direction === 'desc') {
          downColor = activeColor
        }
      }

      return { upColor, downColor }
    },
    [sortState],
  )

  const sortedData = useMemo(() => {
    return sortData(initialData, sortState)
  }, [initialData, sortState])

  return {
    sortedData,
    sortState,
    handleSort,
    getSortIndicator,
  }
}
