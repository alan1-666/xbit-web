import { createContext, useContext, useState, ReactNode } from 'react'
import { Event } from '@/@generated/gql/graphql-prediction'

interface SportsSelectionContextType {
  selectedEvent: Event | null
  setSelectedEvent: (event: Event | null) => void
}

const SportsSelectionContext = createContext<SportsSelectionContextType | undefined>(undefined)

export const SportsSelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  return (
    <SportsSelectionContext.Provider value={{ selectedEvent, setSelectedEvent }}>
      {children}
    </SportsSelectionContext.Provider>
  )
}

export const useSportsSelection = () => {
  const context = useContext(SportsSelectionContext)
  if (!context) {
    throw new Error('useSportsSelection must be used within a SportsSelectionProvider')
  }
  return context
}
