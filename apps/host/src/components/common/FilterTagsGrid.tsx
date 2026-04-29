import { cn } from '@/lib/utils.ts'

type FilterTagsGridProps = {
  tabs: string[]
  defaultTab: string
  activeTab?: string
  containerId: string
  containerClassName?: string
  tabsListClassName?: string
  tabsTriggerClassName?: string
  tabBgClassName?: string
  onTabChange?: (tab: string) => any
  activeColor?: string
  styleTabActive?: string
}

const FilterTagsGrid = ({
  tabs,
  defaultTab = tabs[0],
  activeTab = tabs[0],
  containerId,
  containerClassName,
  tabsListClassName,
  tabsTriggerClassName,
  onTabChange,
  activeColor = '!text-[#FFFFFF99]',
  styleTabActive,
}: FilterTagsGridProps) => {
  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  return (
    <div className={cn('mt-2.5 relative flex flex-wrap gap-1.5 bg-transparent', tabsListClassName)}>
      {tabs.map((tab: string) => (
        <div
          key={tab}
          className={cn(
            'px-2 py-1 font-[330] text-[12px] leading-[1] text-center rounded-[5px] min-w-[67px] cursor-pointer whitespace-nowrap',
            tabsTriggerClassName,
            activeTab === tab ? `!text-[#C8A7FD] !bg-[#3E2761] ${activeColor}` : '!text-[#908E98] bg-[#18171E]',
          )}
          onClick={() => handleTabChange(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  )
}

export default FilterTagsGrid
