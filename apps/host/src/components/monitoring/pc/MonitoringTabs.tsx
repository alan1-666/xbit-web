import {UITab} from "@/types/uiTabs.ts";
import MovingChangeBgTabs from "@components/common/MovingChangeBgTabs.tsx";

type MonitoringTabsProps = {
  tabs: UITab[]
  activeTab: string
  setActiveTab: (tab: string) => void
}

const  MonitoringTabs = ({
  tabs,
  activeTab,
  setActiveTab,
}: MonitoringTabsProps) => {
  const handleTabChange = (e: string) => {
    setActiveTab(e)
  }
  return (
    <MovingChangeBgTabs
      tabs={tabs}
      defaultTab={activeTab}
      currentTab={activeTab}
      containerId='monitoringTabs'
      onTabChange={handleTabChange}
      containerClassName='bg-none'
      tabBgClassName='bg-[#3E2761] rounded-[6px]'
      tabsTriggerClassName='!text-[14px] leading-[1] !font-normal py-1.5 px-3 !bg-[#2A2839] rounded-[6px] data-[state=active]:text-[#C8A7FD] data-[state=active]:!bg-[#3E2761] h-[30px]'
      tabsListClassName='bg-transparent border-none gap-2'
      tabTriggerActiveClassName='text-[#FFF]'
      tabTriggerNormalClassName='text-[#FFFFFF80]'
    />
  );
};

export default MonitoringTabs;
