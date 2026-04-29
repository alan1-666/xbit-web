import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs.tsx'
import { UITab } from '@/types/uiTabs.ts'
import { useState } from 'react'
import { cn } from '@/lib/utils.ts'
import {useResponsive} from "@hooks/hyperliquid/useResponsive.ts";

type FilterFollowedTabsProps = {
  tabs: UITab[];
  defaultTab: string;
  disabledTabs?: string[];
  containerId: string;
  containerClassName?: string;
  tabsListClassName?: string;
  tabsTriggerClassName?: string;
  tabBgClassName?: string;
  onTabChange?: (tab: string) => any;
}

const FilterFollowedTabs = ({
  tabs,
  defaultTab,
  containerId,
  containerClassName,
  onTabChange,
  tabsTriggerClassName,
  disabledTabs,
  tabsListClassName
}: FilterFollowedTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab)

  const {isDesktop} = useResponsive()

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab)
  }

  const handleTabChange = (tab: string) => {
    handleActiveTab(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  return (
    <Tabs
      id={containerId}
      className={containerClassName}
      onValueChange={handleTabChange}
      value={activeTab}
      defaultValue={defaultTab}
    >
      <TabsList
        className={cn(
          'bg-transparent gap-1.5 p-0 h-fit',
          tabsListClassName
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            className={cn(
              (isDesktop ? 'py-1.5 text-[13px] leading-[1] font-normal' : 'py-1 !border !border-[#ECECED14] app-font-regular text-[12px] leading-[1]'),
              activeTab === tab.value
                ? (isDesktop ? '!bg-[#3E2761] !text-[#C8A7FD]' : '!text-[#FFFFFF] !bg-[#ECECED14] ')
                : (isDesktop ? '!text-[#6C6A74] !bg-[#18171E]' : '!text-[#FFFFFF80]'),
              tabsTriggerClassName,
            )}
            key={tab.value}
            id={`${containerId}-${tab.value}`}
            value={tab.value}
            disabled={disabledTabs?.includes(tab.value)}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default FilterFollowedTabs
