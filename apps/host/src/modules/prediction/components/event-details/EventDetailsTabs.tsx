import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { useMemo } from 'react'

const tabs = ['current', 'comments', 'holders', 'activity', 'about'] as const

export type EventDetailsContentTab = (typeof tabs)[number]

import { useTranslation } from 'react-i18next'

export interface EventDetailsContentTabsProps {
  tab: EventDetailsContentTab
  onTabChange: (tab: EventDetailsContentTab) => void
}

export const EventDetailsContentTabs = (props: EventDetailsContentTabsProps) => {
  const { tab, onTabChange } = props
  const { t } = useTranslation()

  const allTabs = useMemo(() => {
    return tabs.map((tab) => ({
      value: tab,
      label: t(`prediction.eventDetails.tabs.${tab}`),
    }))
  }, [t])

  return (
    <div className="sticky top-45 xl:top-28 z-10 bg-[#0A0A0A]">
      <MovingLineTabs
        tabs={allTabs}
        defaultTab={tab}
        onTabChange={(changedTab) => onTabChange(changedTab as EventDetailsContentTab)}
        containerClassName="justify-start bg-transparent"
        tabsListClassName="px-[1px]"
        itemClassName="pl-0 mr-2.5"
      />
    </div>
  )
}
