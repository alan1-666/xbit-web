import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils.ts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import debounce from 'lodash-es/debounce'
import { UITab } from '@/types/uiTabs.ts'
import { useTranslation } from 'react-i18next'
type MovingBgTabsProps = {
  tabs: UITab[]
  defaultTab: string
  currentTab:string
  disabledTabs?: string[]
  containerId: string
  containerClassName?: string
  tabsListClassName?: string
  tabsTriggerClassName?: string
  tabBgClassName?: string
  onTabChange?: (tab: string) => any
  tabTriggerNormalClassName?: string
  tabTriggerActiveClassName?: string
}

type ActiveTabRect = {
  width: number
  height: number
  left: number
}

const getTabRect = (containerId: string, tabId: string): ActiveTabRect => {
  const tabElement = document.getElementById(`${containerId}-${tabId}`)
  if (!tabElement)
    return {
      width: 0,
      height: 0,
      left: 0,
    }

  return {
    width: tabElement.offsetWidth,
    height: tabElement.offsetHeight,
    left: tabElement.offsetLeft,
  }
}

const MovingBgTabs = ({
  tabs,
  defaultTab,
  currentTab,
  disabledTabs,
  containerId,
  containerClassName,
  tabsListClassName,
  tabsTriggerClassName,
  tabBgClassName,
  onTabChange,
  tabTriggerActiveClassName = 'text-white font-[400]',
  tabTriggerNormalClassName = '!text-(--moving-bg-tabs-color) font-[500]'
}: MovingBgTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(currentTab)
  const [activeTabRect, setActiveTabRect] = useState<ActiveTabRect>(getTabRect(containerId, defaultTab))
  const tabBgRef = useRef<HTMLSpanElement>(null)
  const { t } = useTranslation()
  useEffect(() => {
    if (currentTab !== activeTab) {
      handleActiveTab(currentTab);
    }
  }, [currentTab]);

  const tabBgStyles = {
    width: `${activeTabRect.width - 0.5}px`,
    height: `${activeTabRect.height}px`,
    transform: `translateX(${activeTabRect.left - 1}px)`,
  }

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab)
    setActiveTabRect(getTabRect(containerId, tab))
  }

  const handleTabChange = (tab: string) => {
    handleActiveTab(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  useEffect(() => {
    const handleActiveTabTimeout = setTimeout(() => handleActiveTab(defaultTab), 100)
    let tabBgTransitionTimeout: ReturnType<typeof setTimeout>

    if (tabBgRef?.current) {
      tabBgTransitionTimeout = setTimeout(() => {
        // tabBgRef?.current?.classList.add('transition-[.3s]')
        tabBgRef?.current?.classList.remove('opacity-0')
      }, 150)
    }

    return () => {
      clearTimeout(tabBgTransitionTimeout)
      clearTimeout(handleActiveTabTimeout)
    }
  }, [])

  useEffect(() => {
    const resizeListener = debounce(() => {
      setActiveTabRect(getTabRect(containerId, activeTab))
    }, 50)

    window.addEventListener('resize', resizeListener)

    return () => {
      window.removeEventListener('resize', resizeListener)
    }
  }, [activeTab])

  return (
    <Tabs
      id={containerId}
      className={containerClassName}
      onValueChange={handleTabChange}
      value={activeTab}
      defaultValue={activeTab}
    >
      <TabsList
        className={cn(
          'rounded-[12px] h-auto relative p-0.5 border-[0.5px] border-solid border-[#ECECED0A] bg-[#ECECED14]',
          tabsListClassName,
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            className={cn(
              'relative z-1 rounded-[12px] !bg-transparent shadow-[none] text-[13px] h-[28px] p-[4px 6px] leading-[1] select-none',
              activeTab === tab.value ? tabTriggerActiveClassName : tabTriggerNormalClassName,
              tabsTriggerClassName,
            )}
            key={tab.value}
            id={`${containerId}-${tab.value}`}
            value={tab.value}
            disabled={disabledTabs?.includes(tab.value)}
          >
            {t(tab.label as string)}
          </TabsTrigger>
        ))}
        <span
          className={cn('absolute z-0 left-[1px] top-0.5',
            //  'transition-all duration-300 ease-in-out',
             tabBgClassName)}
          style={{ ...tabBgStyles }}
          ref={tabBgRef}
          // style={{
          //   width: `${activeTabRect.width - 0.5}px`,
          //   height: `${activeTabRect.height}px`,
          //   // transform: asd ? `translateX(${activeTabRect.left - 1}px)` : 'unset',
          // }}
        />
      </TabsList>
    </Tabs>
  )
}

export default MovingBgTabs
