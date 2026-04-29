import { DiscoverTabs, TAB_MEME } from '@components/discover/DiscoverTabs.tsx'
import { DiscoverPageContext, DiscoverPageContextState } from '@components/discover/DiscoverPageContext.tsx'
import { memo, useEffect, useMemo, useState } from 'react'
import { DiscoverTabContent } from '@components/discover/DiscoverTabContent.tsx'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { LifecycleStates } from '@/@generated/gql/graphql-core.ts'
import { store, useAppDispatch, useAppSelector } from '@/redux/store'
import { homeActions } from '@/redux/modules/home.slice.ts'
import { NewDiscoverHeader } from '@/components/discover/NewDiscoverHeader'
import styles from '@/styles/discover.module.scss'
import { cn } from '@/lib/utils.ts'
import ls from '@/lib/local-storage'
import useNetworkFeeSubcription from '@components/mqtt/NetworkFeeSubcription.tsx'
import { useLocation } from 'react-router-dom'

const NetworkFeeSubscription = memo(
  () => {
    useNetworkFeeSubcription()
    return null
  },
  () => true,
)

interface MemeDiscoverProps {
  inviteCode?: string
}

export const MemeDiscoverPage = ({ inviteCode }: MemeDiscoverProps) => {
  const location = useLocation()
  const currentTab = useMemo(() => {
    const lastSegment = location.pathname.split('/').pop()
    if (lastSegment === 'discover' || lastSegment === 'meme' || lastSegment === 'market') {
      return TAB_MEME
    }
    return lastSegment || TAB_MEME
  }, [location.pathname])
  const [memeSubTab, setMemeSubTab] = useState<LifecycleStates>(
    store.getState().home.memeSubTab || LifecycleStates.NewCreation,
  )
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.home.filters)

  const onFiltersChanged = (key: string, filter: FilterFormData) => {
    dispatch(homeActions.setFilters({ key, filter }))
  }

  useEffect(() => {
    if (inviteCode) {
      ls.set('futures_inviteCode', inviteCode)
    }
  }, [inviteCode])

  useEffect(() => {
    dispatch(homeActions.setCurrentTab(currentTab))
  }, [currentTab, dispatch])

  useEffect(() => {
    dispatch(homeActions.setMemeSubTab(memeSubTab))
  }, [memeSubTab, dispatch])

  const contextValue: DiscoverPageContextState = useMemo(() => {
    return {
      currentTab,
      onTabChanged: (tab: string) => {},
      filters,
      onFiltersChanged: onFiltersChanged,
      memeSubTab,
      onMemeSubTabChanged: (memeSubTab: LifecycleStates) => setMemeSubTab(memeSubTab),
    }
  }, [filters, memeSubTab])

  return (
    <div
      className={cn(
        '@container mx-auto mt-2 flex flex-col items-stretch -mb-20 min-h-[calc(100dvh-139px)] bg-[#0A0A0A]',
        styles['discover'],
      )}
    >
      <DiscoverPageContext.Provider value={contextValue}>
        {/*{!isLoginV2 ? <DiscoverHeader /> : <NewDiscoverHeader />}*/}
        {/* <NewDiscoverHeader /> */}
        <DiscoverTabs />
        <DiscoverTabContent currentTab={currentTab} />
        <NetworkFeeSubscription />
      </DiscoverPageContext.Provider>
    </div>
  )
}
