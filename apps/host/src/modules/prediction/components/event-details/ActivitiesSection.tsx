import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { useEffect, useState } from 'react'
import { TabComments } from '@/modules/prediction/components/event-details/TabComments.tsx'
import { TabHolders } from '@/modules/prediction/components/event-details/TabHolders.tsx'
import { TabActivities } from '@/modules/prediction/components/event-details/TabActivities.tsx'
import { useSearchParams } from 'react-router-dom'

const tabs = [
  { label: 'Comments', value: 'comments' },
  { label: 'Top Holders', value: 'holders' },
  { label: 'Activity', value: 'activity' },
]

const TabContent = ({ tab }: { tab: string }) => {
  if (tab === 'comments') {
    return <TabComments />
  }
  if (tab === 'holders') {
    return <TabHolders />
  }
  if (tab === 'activity') {
    return <TabActivities />
  }
  return null
}

export const ActivitiesSection = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab') || 'comments'
  const [selectedTab, setSelectedTab] = useState(tabFromUrl)

  // Sync selected tab with URL on mount
  useEffect(() => {
    const validTabs = tabs.map((t) => t.value)
    const currentTab = searchParams.get('tab')
    if (currentTab && validTabs.includes(currentTab)) {
      setSelectedTab(currentTab)
    }
  }, [searchParams])

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
    setSearchParams({ tab })
  }

  return (
    <div className="max-w-full">
      <MovingLineTabs
        tabs={tabs}
        defaultTab={selectedTab}
        onTabChange={handleTabChange}
        containerClassName="justify-start bg-transparent px-0"
        itemClassName="px-0 mr-4"
      />
      <TabContent tab={selectedTab} />
    </div>
  )
}
