import React, { Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from '@/lib/utils.ts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import debounce from 'lodash-es/debounce'
import { UITab } from '@/types/uiTabs.ts'
import { useTranslation } from 'react-i18next'

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
  onItemClick?: (value: string) => void
  customTabRender?: (tab: UITab, defaultRender: () => React.ReactNode) => React.ReactNode
  preventDefaultTabs?: string[]
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
  onItemClick,
  customTabRender,
  preventDefaultTabs,
  ref,
}: MovingBgTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab)
  const [activeTabRect, setActiveTabRect] = useState<ActiveTabRect>(getTabRect(containerId, defaultTab))
  const tabBgRef = useRef<HTMLSpanElement>(null)
  const tabsListRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const tabBgStyles = {
    width: `${activeTabRect.width - 0.5}px`,
    height: `${activeTabRect.height}px`,
    transform: `translateX(${activeTabRect.left - 1}px)`,
  }

  const updateTabRect = (tab: string) => {
    // Use requestAnimationFrame to ensure the DOM has been painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setActiveTabRect(getTabRect(containerId, tab))
      })
    })
  }

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab)
    updateTabRect(tab)
  }

  const handleTabChange = (tab: string) => {
    // 如果该tab在preventDefaultTabs中，不执行默认的tab切换
    if (preventDefaultTabs?.includes(tab)) {
      return
    }
    handleActiveTab(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  useImperativeHandle(ref, () => ({
    selectTab: (tab: string) => handleActiveTab(tab),
  }))

  // Observer để theo dõi thay đổi kích thước của tabs
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      updateTabRect(activeTab)
    })

    if (tabsListRef.current) {
      observer.observe(tabsListRef.current)
    }

    return () => observer.disconnect()
  }, [activeTab])

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
      updateTabRect(activeTab)
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
        ref={tabsListRef}
        className={cn(
          'rounded-[50px] h-auto relative p-0 border-0 bg-transparent',
          tabsListClassName,

        )}
      >
        {tabs.map((tab) => {
          const isDisabled = tab.disabled || disabledTabs?.includes(tab.value)
          const defaultRender = () => {
            const triggerElement = (
              <TabsTrigger
                className={cn(
                  'relative z-1 rounded-[50px] !bg-transparent shadow-[none] px-[16px] leading-[1] select-none',
                  'text-[14px] font-[400] h-[30px] flex items-center justify-center transition-colors duration-200',
                  activeTab === tab.value ? 'text-[#A882FF]' : '!text-(--moving-bg-tabs-color)',
                  tabsTriggerClassName,
                  activeTab === tab.value ? tabsTriggerActiveClassName : tabsTriggerInactiveClassName,
                  isDisabled
                    ? '!text-[#FFFFFF50]'
                    : ' hover:!text-[#A882FF]',
                )}
                id={`${containerId}-${tab.value}`}
                value={tab.value}
                // disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled && onItemClick) {
                    onItemClick(tab.value)
                  }
                }}
              >
                {tab.label}
              </TabsTrigger>
            )

            if (isDisabled) {
              return (
                <TooltipProvider key={tab.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {triggerElement}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('liquidityChart.comingSoon')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            }

            return <React.Fragment key={tab.value}>{triggerElement}</React.Fragment>
          }

          if (customTabRender) {
            return <React.Fragment key={tab.value}>{customTabRender(tab, defaultRender)}</React.Fragment>
          }

          return defaultRender()
        })}
        {tabBgClassName && (
          <span
            className={cn(
              'opacity-0 absolute z-0 left-[1px] top-0 transition-transform duration-300 ease-out',
              tabBgClassName,
            )}
            style={tabBgStyles}
            ref={tabBgRef}
          />
        )}
      </TabsList>
    </Tabs>
  )
}

export default MovingBgTabs
