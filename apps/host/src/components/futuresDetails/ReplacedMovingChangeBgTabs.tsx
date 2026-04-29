import { useState, useEffect, useRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils.ts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UITab } from '@/types/uiTabs.ts'
import DetailSymbol from './DetailSymbol'
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
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>
}

export default function ReplacedMovingBgTabs({
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
  scrollContainerRef,
}: MovingLineTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab)
  const [lineStyle, setLineStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isScrollTop, setIsScrollTop] = useState<boolean>(true)
  const { t } = useTranslation()
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
    const scrollContainer = scrollContainerRef?.current
    if (!scrollContainer) return

    let lastScrollTop = scrollContainer.scrollTop

    const handleScroll = () => {
      const currentScrollTop = scrollContainer.scrollTop

      if (currentScrollTop === 0) {
        // scroll to top - show menu
        setIsScrollTop(true)
      } else {
        // show symbol button
        setIsScrollTop(false)
      }

      lastScrollTop = currentScrollTop
    }

    scrollContainer.addEventListener('scroll', handleScroll)

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [scrollContainerRef])

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab)
    const activeTabElement = tabsRef.current[activeIndex]

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement
      /**
       * change design move tabs line fix with 38px
       */
      const TabLine = 38
      let left = offsetLeft
      if (offsetWidth <= TabLine) {
        left += offsetLeft
      } else {
        left += (offsetWidth - TabLine) / 2
      }

      setLineStyle({ left: left, width: TabLine })
    }
  }, [activeTab, tabs, forceUpdate])

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  // 处理滚动逻辑 - 监听 activeTab 变化（包括手动点击）
  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab)
    const activeTabElement = tabsRef.current[activeIndex]
    const container = containerRef.current as HTMLElement

    if (container && activeTabElement) {
      const containerWidth = container.clientWidth
      const scrollLeft = container.scrollLeft

      // 计算当前标签在容器中的位置
      const tabLeft = activeTabElement.offsetLeft
      // const tabRight = tabLeft + activeTabElement.offsetWidth
      const visibleLeft = scrollLeft
      // const visibleRight = scrollLeft + containerWidth

      let newScrollLeft = scrollLeft

      // 计算容器中心点
      const containerCenter = containerWidth / 2
      // 计算当前标签相对于可视区域左边界的位置
      const tabRelativePosition = tabLeft - visibleLeft
      // 如果标签在容器宽度的一半以上（右侧），向右滚动一个标签
      if (tabRelativePosition > containerCenter) {
        const targetIndex = Math.min(tabs.length - 1, activeIndex + 1)
        const targetElement = tabsRef.current[targetIndex]

        if (targetElement) {
          // 向右滚动：让目标标签显示在可视区域内
          newScrollLeft = targetElement.offsetLeft + targetElement.offsetWidth - containerWidth + 20
        }
      }
      // 如果标签在容器宽度的一半以下（左侧），向左滚动一个标签
      else if (tabRelativePosition < containerCenter) {
        const targetIndex = Math.max(0, activeIndex - 1)
        const targetElement = tabsRef.current[targetIndex]

        if (targetElement) {
          // 向左滚动：让目标标签显示在可视区域内
          newScrollLeft = targetElement.offsetLeft - 20
        }
      }

      // 只有在需要滚动时才执行
      if (Math.abs(newScrollLeft - scrollLeft) > 1) {
        container.scrollTo({
          left: newScrollLeft,
          behavior: 'smooth',
        })
      }
    }
  }, [activeTab, tabs])

  return (
    <div className={cn('relative', wrapperClassName)}>
      <div
        ref={containerRef}
        className={cn(
          `flex items-center justify-center max-w-[100%] rounded-bl-none rounded-br-none rounded-tl-[8px] rounded-tr-[8px] bg-gradient-to-b from-[#3e3e3e82] to-[transparent] 
      overflow-x-auto overflow-y-hidden _hidescrollbar
      after:content-[''] 
      after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[0.5px] 
      `,
          containerClassName,
        )}
      >
        <div style={{ display: isScrollTop ? 'block' : 'none' }}>
          <Tabs
            className={cn('max-w-[100%] relative', tabsClassName)}
            onValueChange={handleTabChange}
            value={activeTab}
            defaultValue={defaultTab}
          >
            <TabsList className={cn(`relative bg-[none] shadow-none `, tabsListClassName)}>
              {tabs.map((tab, index) => (
                <TabsTrigger
                  value={tab.value}
                  key={tab.value}
                  ref={(el) => {
                    tabsRef.current[index] = el
                  }}
                  className={cn(
                    ' text-(--text-tertiary) !bg-transparent transition-all select-none',
                    activeTab === tab.value ? ` text-(--text-primary) font-bold ${itemClassNameActive}` : '',
                    itemClassName,
                  )}
                  disabled={disabledTabs?.includes(tab.value)}
                >
                  {t(tab.label)}
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
                before:h-[1.5px]
                before:rounded-[100%]
                before:bg-linear-to-r
                before:from-[#9945FF]
                before:to-[#00F3AB]
                after:w-[26px]
                after:aspect-[16/6]
                after:absolute
                after:left-[50%]
                after:bottom-[-1px]
                after:translate-x-[-50%]
                after:bg-[url(/images/moving-line-tab-blur.webp)]
                after:bg-contain`,
                    widthMoveLine
                      ? `before:w-[${widthMoveLine}px] before:left-[50%] before:translate-[-50%] before:relative`
                      : ``,
                  )}
                />
              )}
            </TabsList>
          </Tabs>
        </div>
        <div
          className={(cn(`py-[5px] px-[10px] mt-[4px]`))} 
          style={{ display: isScrollTop ? 'none' : 'block' }}>
            <DetailSymbol type="header" />
        </div>
      </div>
    </div>
  )
}
