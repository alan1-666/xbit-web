import { Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from '@/lib/utils.ts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import debounce from 'lodash-es/debounce'
import { UITab } from '@/types/uiTabs.ts'

export type MovingBgTabsHandle = {
  selectTab: (tab: string) => void
}

type MovingBgTabsProps = {
  tabs: UITab[]
  defaultTab: string
  disabledTabs?: string[]
  containerId: string
  containerClassName?: string
  tabsListClassName?: string
  tabsTriggerClassName?: string
  tabBgClassName?: string
  tabsTriggerActiveClassName?: string
  tabsTriggerInactiveClassName?: string
  onTabChange?: (tab: string) => any
  ref?: Ref<MovingBgTabsHandle>
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
  disabledTabs,
  containerId,
  containerClassName,
  tabsListClassName,
  tabsTriggerClassName,
  tabBgClassName,
  onTabChange,
  tabsTriggerActiveClassName,
  tabsTriggerInactiveClassName,
  ref,
}: MovingBgTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab)
  const [activeTabRect, setActiveTabRect] = useState<ActiveTabRect>(getTabRect(containerId, defaultTab))
  const tabBgRef = useRef<HTMLSpanElement>(null)
  const tabBgStyles = {
    width: `${activeTabRect.width - 0.5}px`,
    height: `${activeTabRect.height}px`,
    transform: `translateX(${activeTabRect.left - 1}px)`,
  }

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab)
    // setActiveTabRect(getTabRect(containerId, tab))
    // Delay to ensure DOM has finished rendering with new font-size/font-weight
    setTimeout(() => {
      setActiveTabRect(getTabRect(containerId, tab))
    }, 0)
  }

  const handleTabChange = (tab: string) => {
    handleActiveTab(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  useImperativeHandle(ref, () => ({
    selectTab: (tab: string) => handleActiveTab(tab),
  }))

  useEffect(() => {
    const handleActiveTabTimeout = setTimeout(() => handleActiveTab(defaultTab), 100)
    let tabBgTransitionTimeout: ReturnType<typeof setTimeout>

    if (tabBgRef?.current) {
      tabBgTransitionTimeout = setTimeout(() => {
        tabBgRef?.current?.classList.add('transition-[.3s]')
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
      defaultValue={defaultTab}
    >
      <TabsList
        className={cn(
          'rounded-[50px] h-auto relative p-0 border-[0.5px] border-(--moving-bg-tabs-border-color) bg-(--moving-bg-tabs-bg-color)',
          tabsListClassName,
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            className={cn(
              'relative z-1 rounded-[50px] !bg-transparent shadow-[none] text-[13px] h-[30px]  px-[16px] leading-[1] select-none',
              'flex items-center justify-center min-w-fit',
              activeTab === tab.value ? '!text-white app-font-light' : '!text-(--moving-bg-tabs-color) app-font-light',
              tabsTriggerClassName,
              activeTab === tab.value ? tabsTriggerActiveClassName : tabsTriggerInactiveClassName,
            )}
            key={tab.value}
            id={`${containerId}-${tab.value}`}
            aria-controls={`${containerId}-${tab.value}`}
            value={tab.value}
            disabled={disabledTabs?.includes(tab.value)}
          >
            {tab.label}
          </TabsTrigger>
        ))}
        <span
          className={cn(
            'opacity-0 absolute z-0 left-[1px] top-0',
            tabBgClassName ? tabBgClassName : 'purple-btn-gradient-MovingBgTabs',
          )}
          style={tabBgStyles}
          ref={tabBgRef}
        />
      </TabsList>
    </Tabs>
  )
}

export default MovingBgTabs
