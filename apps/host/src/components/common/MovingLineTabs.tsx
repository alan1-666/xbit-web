import { useState, useEffect, useRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils.ts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UITab } from '@/types/uiTabs.ts'
import { useTranslation } from 'react-i18next'

type MovingLineTabsProps = {
  tabs: UITab[]
  defaultTab: string
  disabledTabs?: string[]
  onTabChange?: (tab: string) => any
  containerClassName?: HTMLAttributes<HTMLDivElement>['className']
  tabsListClassName?: string
  tabsClassName?: string
  itemClassName?: string
  itemClassNameActive?: string
  widthMoveLine?: number
  wrapperClassName?: HTMLAttributes<HTMLDivElement>['className']
  forceUpdate?: boolean
  showTabLine?: boolean
  showContainerBottomLine?: boolean
  labelClassName?: string
  labelActiveClassName?: string
  tabLineClassName?: string
  icon?: React.ReactNode
  iconTab?: string
}

export default function MovingLineTabs({
  tabs,
  defaultTab,
  disabledTabs,
  onTabChange,
  containerClassName,
  tabsClassName,
  tabsListClassName,
  itemClassName,
  itemClassNameActive,
  widthMoveLine,
  wrapperClassName,
  forceUpdate,
  showTabLine = true,
  showContainerBottomLine = true,
  labelClassName,
  labelActiveClassName = '',
  tabLineClassName,
  icon,
  iconTab,
}: MovingLineTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab)
  const [lineStyle, setLineStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const tabsRef = useRef<Array<HTMLSpanElement | null>>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab)
  }

  const handleTabChange = (tab: string) => {
    handleActiveTab(tab)
    // 点击时让标签居中
    scrollToCenter(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  // 将标签滚动到中间位置
  const scrollToCenter = (tabValue: string) => {
    const activeIndex = tabs.findIndex((tab) => tab.value === tabValue)
    const activeTabElement = tabsRef.current[activeIndex]
    const container = containerRef.current as HTMLElement

    if (container && activeTabElement) {
      const containerWidth = container.clientWidth
      const tabLeft = activeTabElement.offsetLeft
      const tabWidth = activeTabElement.offsetWidth

      // 计算让标签居中的滚动位置
      const tabCenter = tabLeft + tabWidth / 2
      const containerCenter = containerWidth / 2
      const newScrollLeft = tabCenter - containerCenter

      // 确保不超出滚动范围
      const maxScrollLeft = container.scrollWidth - containerWidth
      const finalScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft))

      container.scrollTo({
        left: finalScrollLeft,
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab)
    const activeTabElement = tabsRef.current[activeIndex]

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement
      /**
       * change design move tabs line fix with 38px
       */
      // const TabLine = 38
      // 让固定宽度的线条始终在 tab 中居中
      // const left = offsetLeft + offsetWidth / 10
      // setLineStyle({ left: left, width: TabLine })
      setLineStyle({ left: offsetLeft - 1, width: offsetWidth + 3 })
    }
  }, [activeTab, tabs, forceUpdate])

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  return (
    <div className={cn('relative', wrapperClassName)}>
      <div
        ref={containerRef}
        className={cn(
          `flex items-center justify-center max-w-[100%] rounded-bl-none rounded-br-none rounded-tl-[8px] rounded-tr-[8px] bg-gradient-to-b from-[#3e3e3e82] to-[transparent]
          overflow-x-auto overflow-y-hidden _hidescrollbar
          after:content-['']
          after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1px]
          after:z-[-1]
        `,
          showContainerBottomLine && 'after:bg-[#ECECED14]',
          containerClassName,
        )}
      >
        <Tabs
          className={cn('max-w-[100%] relative', tabsClassName)}
          onValueChange={handleTabChange}
          value={activeTab}
          defaultValue={defaultTab}
        >
          <TabsList className={cn(`relative bg-[none] shadow-none`, tabsListClassName)}>
            {tabs.map((tab, index) => (
              <TabsTrigger
                value={tab.value}
                key={tab.value}
                id={`moving-line-tabs-${tab.value}`}
                aria-controls={`moving-line-tabs-${tab.value}`}
                className={cn(
                  'text-(--text-tertiary) !bg-transparent transition-all select-none',
                  itemClassName,
                  activeTab === tab.value ? `text-(--text-primary) ${itemClassNameActive}` : '',
                )}
                disabled={disabledTabs?.includes(tab.value)}
              >
                <span
                  ref={(el) => {
                    tabsRef.current[index] = el
                  }}
                  className={cn('flex items-center gap-1', labelClassName,
                    activeTab === tab.value ? `scale-105 ${labelActiveClassName}` : '',
                  )}
                >
                  {icon && tab.value === iconTab && icon}
                  {tab.label}
                </span>
              </TabsTrigger>
            ))}
            {showTabLine && (
              <div
                style={{
                  left: `${lineStyle.left}px`,
                  width: `${lineStyle.width}px`,
                }}
                className={cn(
                  `absolute
                  transition-[.3s]
                  bottom-0
                  before:content-['']
                  before:block
                  before:h-[3px]
                  before:bg-white
                  after:w-[26px]
                  after:aspect-[16/6]
                  after:absolute
                  after:left-[50%]
                  after:bottom-[-1px]
                  after:translate-x-[-50%]
                  `,
                  widthMoveLine
                    ? `before:w-[${widthMoveLine}px] before:left-[50%] before:translate-[-50%] before:relative`
                    : ``,
                  tabLineClassName,
                )}
              />
            )}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
