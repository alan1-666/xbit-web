import { createContext, useContext, useState, ReactNode } from 'react'

type SortDirection = 'asc' | 'desc' | null
type SortColumn = 'market' | 'avg' | 'bet' | 'toWin' | 'value' | null

interface PortfolioContextType {
  sortBy: SortColumn
  sortDirection: SortDirection
  setSort: (column: SortColumn) => void
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [sortBy, setSortBy] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const setSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDirection('desc')
    }
  }

  return <PortfolioContext.Provider value={{ sortBy, sortDirection, setSort }}>{children}</PortfolioContext.Provider>
}

export const usePortfolio = () => {
  const context = useContext(PortfolioContext)
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}
