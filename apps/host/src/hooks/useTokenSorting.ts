import { useState } from 'react'
import { CategorySortField, CategorySortState } from '@/components/category/CategorySortHeader'

/**
 * Custom hook to handle token sorting logic
 * Accepts a list of tokens and returns sorted tokens based on current sort state
 */
export const useTokenSorting = () => {
  // Sort state initialization with market cap descending as default
  const [sortState, setSortState] = useState<CategorySortState>({
    field: CategorySortField.MarketCap,
    direction: 'desc',
  })

  // Handle sort change
  const handleSortChange = (field: CategorySortField) => {
    setSortState((prevState) => {
      // If clicking the same field, toggle direction
      if (prevState.field === field) {
        return {
          field,
          direction: prevState.direction === 'desc' ? 'asc' : 'desc',
        }
      }

      // If clicking a new field, set to descending by default
      return {
        field,
        direction: 'desc',
      }
    })
  }

  return {
    sortState,
    handleSortChange,
  }
}

export default useTokenSorting
