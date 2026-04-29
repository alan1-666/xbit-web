import { createContext, useContext, ReactNode, useState } from 'react'
import { PositionSortField, ClosedPositionSortField, SortDirection } from '@/@generated/gql/graphql-prediction.ts'
import { PortfolioProvider } from './PortfolioContext'

interface UserProfileContextType {
  userId: string | undefined
  // Active positions sort
  activeSortBy: PositionSortField
  activeSortDirection: SortDirection
  setActiveSort: (sortBy: PositionSortField) => void
  toggleActiveDirection: () => void
  // Closed positions sort
  closedSortBy: ClosedPositionSortField
  closedSortDirection: SortDirection
  setClosedSort: (sortBy: ClosedPositionSortField) => void
  toggleClosedDirection: () => void
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

interface UserProfileProviderProps {
  children: ReactNode
  userId: string | undefined
}

export const UserProfileProvider = ({ children, userId }: UserProfileProviderProps) => {
  // Active positions sort state
  const [activeSortBy, setActiveSortBy] = useState<PositionSortField>(PositionSortField.Current)
  const [activeSortDirection, setActiveSortDirection] = useState<SortDirection>(SortDirection.Desc)

  // Closed positions sort state
  const [closedSortBy, setClosedSortBy] = useState<ClosedPositionSortField>(ClosedPositionSortField.Realizedpnl)
  const [closedSortDirection, setClosedSortDirection] = useState<SortDirection>(SortDirection.Desc)

  const setActiveSort = (sortBy: PositionSortField) => {
    if (activeSortBy === sortBy) {
      setActiveSortDirection((prev) => (prev === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc))
    } else {
      setActiveSortBy(sortBy)
      setActiveSortDirection(SortDirection.Desc)
    }
  }

  const toggleActiveDirection = () => {
    setActiveSortDirection((prev) => (prev === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc))
  }

  const setClosedSort = (sortBy: ClosedPositionSortField) => {
    if (closedSortBy === sortBy) {
      setClosedSortDirection((prev) => (prev === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc))
    } else {
      setClosedSortBy(sortBy)
      setClosedSortDirection(SortDirection.Desc)
    }
  }

  const toggleClosedDirection = () => {
    setClosedSortDirection((prev) => (prev === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc))
  }

  return (
    <UserProfileContext.Provider
      value={{
        userId,
        activeSortBy,
        activeSortDirection,
        setActiveSort,
        toggleActiveDirection,
        closedSortBy,
        closedSortDirection,
        setClosedSort,
        toggleClosedDirection,
      }}
    >
      <PortfolioProvider>{children}</PortfolioProvider>
    </UserProfileContext.Provider>
  )
}

export const useUserProfile = () => {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
}
