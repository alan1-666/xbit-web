import { createContext } from 'react'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { LifecycleStates } from '@/@generated/gql/graphql-core.ts'

export interface DiscoverPageContextState {
  currentTab: string
  onTabChanged: (tab: string) => void
  filters: {
    [key: string]: FilterFormData
  }
  onFiltersChanged: (key: string, formData: FilterFormData) => void
  memeSubTab: LifecycleStates
  onMemeSubTabChanged: (memeSubTab: LifecycleStates) => void
}

export const DiscoverPageContext = createContext<DiscoverPageContextState>({
  currentTab: '',
  onTabChanged: () => {},
  filters: {},
  onFiltersChanged: () => {},
  memeSubTab: LifecycleStates.NewCreation, // Default value for memeSubTab
  onMemeSubTabChanged: () => {},
})
