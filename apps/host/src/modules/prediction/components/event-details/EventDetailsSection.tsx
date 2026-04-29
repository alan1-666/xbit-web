import {
  EventDetailsContentTab,
  EventDetailsContentTabs,
} from '@/modules/prediction/components/event-details/EventDetailsTabs.tsx'
import { useState } from 'react'
import { EventDetailsContent } from '@/modules/prediction/components/event-details/EventDetailsContent.tsx'
import { cn } from '@/lib/utils'

export const EventDetailsSection = () => {
  const [tab, setTab] = useState<EventDetailsContentTab>('current')
  return (
    <div className={cn('pb-4 xl:pb-8')}>
      <EventDetailsContentTabs tab={tab} onTabChange={setTab} />
      <div className="pt-4">
        <EventDetailsContent tab={tab} />
      </div>
    </div>
  )
}
