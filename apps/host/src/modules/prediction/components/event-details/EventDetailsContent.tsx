import { TabComments } from '@/modules/prediction/components/event-details/TabComments.tsx'
import { TabActivities } from '@/modules/prediction/components/event-details/TabActivities.tsx'
import { TabHolders } from '@/modules/prediction/components/event-details/TabHolders.tsx'
import { EventDetailsContentTab } from '@/modules/prediction/components/event-details/EventDetailsTabs.tsx'
import { TabMarkets } from '@/modules/prediction/components/event-details/TabMarkets.tsx'
import { TabAbout } from '@/modules/prediction/components/event-details/TabAbout.tsx'

export interface EventDetailsContentProps {
  tab: EventDetailsContentTab
}
export const EventDetailsContent = (props: EventDetailsContentProps) => {
  const { tab } = props
  if (tab === 'current') return <TabMarkets />
  if (tab === 'comments') return <TabComments />
  if (tab === 'activity') return <TabActivities />
  if (tab === 'holders') return <TabHolders />
  if (tab === 'about') return <TabAbout />
}
