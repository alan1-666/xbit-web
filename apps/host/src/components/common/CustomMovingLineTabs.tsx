import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils.ts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UITab } from '@/types/uiTabs.ts'

type MovingLineTabsProps = {
  tabs: UITab[]
  defaultTab: string
  disabledTabs?: string[]
  onTabChange?: (tab: string) => any
  containerClassName?: string
  tabsListClassName?: string
  tabsClassName?: string
  tabsTriggerClassName?: string
  activeTabClassName?: string
}

export default function MovingLineTabs({
  tabs,
  defaultTab,
  disabledTabs,
  onTabChange,
  containerClassName,
  tabsClassName,
  tabsListClassName,
  tabsTriggerClassName,
  activeTabClassName,
}: MovingLineTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab)

  const [lineStyle, setLineStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([])

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab)
  }

  const handleTabChange = (tab: string) => {
    handleActiveTab(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab)
    const activeTabElement = tabsRef.current[activeIndex]
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement
      setLineStyle({ left: offsetLeft, width: offsetWidth })
    }
  }, [activeTab, tabs])

  return (
    <div
      className={cn(
        `flex items-center justify-center max-w-[100%] rounded-bl-none rounded-br-none bg-gradient-to-b from-[#3e3e3e82] to-[transparent] 
      overflow-x-auto overflow-y-hidden _hidescrollbar relative
      after:content-[''] 
      after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[0.6px] 
      after:bg-gradient-to-r after:from-[#3C2E77] after:to-[#006952] after:z-[-1] after:opacity-[0.5]
      `,
        containerClassName,
      )}
    >
      <Tabs
        className={cn('max-w-[100%] relative min-h-[40px]', tabsClassName)}
        onValueChange={handleTabChange}
        value={activeTab}
        defaultValue={defaultTab}
      >
        <TabsList className={cn(`relative bg-[none] justify-start rounded-none shadow-none px-0 w-full`, tabsListClassName)}>
          {tabs.map((tab, index) => (
            <TabsTrigger
              value={tab.value}
              key={tab.value}
              ref={(el) => (tabsRef.current[index] = el)}
              className={cn(
                ' text-(--text-tertiary) !bg-transparent transition-all select-none pb-2 px-2 pt-0 font-normal min-w-[60px]',
                activeTab === tab.value ? 'text-(--text-primary) font-medium relative' : '',
                tabsTriggerClassName,
              )}
              disabled={disabledTabs?.includes(tab.value)}
            >
              {tab.label}
              {activeTab === tab.value && (
                <div
                  className={cn(
                    "absolute transition-[.3s] bottom-0 before:content-[''] before:block before:h-[1.5px] before:rounded-[100%] before:bg-linear-to-r ",
                    "before:from-[#9945FF] before:to-[#00F3AB] after:content-[''] after:w-[26px] after:aspect-[16/6] after:absolute after:left-[50%] after:bottom-[-1px] ",
                    "after:translate-x-[-50%] after:bg-[url(/images/moving-line-tab-blur.webp)] after:bg-contain",
                    "right-[23%] left-[23%]",
                    activeTabClassName,
                  )}
                />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
