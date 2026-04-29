import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils.ts'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { UITab } from '@/types/uiTabs.ts'

type MovingBgFilterTagsProps = {
  tabs: UITab[];
  defaultTab: string;
  activeTab?: string;
  containerId: string;
  containerClassName?: string;
  tabsListClassName?: string;
  tabsTriggerClassName?: string;
  tabBgClassName?: string;
  onTabChange?: (tab: string) => any;
  activeColor?: string;
}

const MovingBgGridFilterTags = ({
  tabs,
  defaultTab = tabs[0]?.value,
  activeTab = tabs[0]?.value,
  containerId,
  containerClassName,
  tabsListClassName,
  tabsTriggerClassName,
  tabBgClassName,
  onTabChange,
  activeColor = "!text-[#FFFFFF99]"
}: MovingBgFilterTagsProps) => {
  const tabBgRef = useRef<HTMLSpanElement>(null)

  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  useEffect(() => {
    let tabBgTransitionTimeout: ReturnType<typeof setTimeout>
    if (tabBgRef?.current) {
      tabBgRef?.current?.classList.remove('opacity-0')
      tabBgTransitionTimeout = setTimeout(() => {
        tabBgRef?.current?.classList.add('transition-[.3s]')
      }, 50)
    }

    return () => {
      clearTimeout(tabBgTransitionTimeout)
    }
  }, [])

  return (
    <Tabs
      id={containerId}
      className={cn('h-auto leading-[1]', containerClassName)}
      onValueChange={handleTabChange}
      value={activeTab}
      defaultValue={defaultTab}
    >
      <TabsList
        className={cn(
          '!rounded-md p-0 h-full relative overflow-x-auto no-scrollbar flex flex-wrap justify-start gap-y-2.5 gap-x-0 bg-transparent',
          tabsListClassName,
        )}
      >
        {tabs.map((tab: UITab) => (
          <TabsTrigger
            className={cn(
              'static rounded-none  text-[11px] min-w-[58px] w-fit h-5 leading-[1] app-font-regular px-2.5 py-1 ',
              activeTab === tab.value
                ? cn(activeColor, tabBgClassName)
                : '!text-[#FFFFFF99] bg-[#ECECED0A]',
              tabsTriggerClassName,
            )}
            key={tab.value}
            id={`${containerId}-${tab}`}
            value={tab.value}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default MovingBgGridFilterTags