import React, { memo, useState, useMemo, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { CATEGORY_ALL } from '../hooks/useHandleGetData'

interface CategoryTabsProps {
  tabs?: string[]
  activeTab?: string
  onTabChange?: (tabValue: string) => void
  className?: string
  isLoadingCategory?: boolean
}
type CategoryKey =
  | "全部"
  | "Layer1"
  | "PreLaunch"
  | "Defi"
  | "Trending"
  | "Meme"
  | "AI"
  | "Gaming"
  | "Layer2"
  | "Dex";

export const categoriesLabelMap: Record<CategoryKey, string> = {
  全部: "全部",
  Layer1: "Layer1",
  PreLaunch: "PreLaunch",
  Defi: "DeFi",
  Trending: "Trending",
  Meme: "Meme",
  AI: "AI",
  Gaming: "GameFi",
  Layer2: "Layer2",
  Dex: "DEX"
};

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  tabs = [],
  activeTab: controlledActiveTab,
  onTabChange,
  className,
  isLoadingCategory,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0] || 'all')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // Use controlled or uncontrolled state
  const activeTab = controlledActiveTab ?? internalActiveTab

  const handleTabClick = (tabValue: string) => {
    if (onTabChange) {
      onTabChange(tabValue)
    } else {
      setInternalActiveTab(tabValue)
    }
  }

  const { t } = useTranslation()

  const sortedTabs = useMemo(() => {
    const desiredOrder = [
      '全部',
      'Trending',
      'Dex',
      'PreLaunch',
      'AI',
      'Defi',
      'Gaming',
      'Layer1',
      'Layer2',
      'Meme',
    ]
  
    return [...tabs].sort((a, b) => {
      const indexA = desiredOrder.indexOf(a)
      const indexB = desiredOrder.indexOf(b)
      if (indexA === -1 && indexB === -1) return 0
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })
  }, [tabs])

  // 当 activeTab 变化时，滚动到中间
  useEffect(() => {
    if (!activeTab || isLoadingCategory || !scrollContainerRef.current) return

    const activeTabElement = tabRefs.current[activeTab]
    const container = scrollContainerRef.current

    if (activeTabElement && container) {
      const containerRect = container.getBoundingClientRect()
      const tabRect = activeTabElement.getBoundingClientRect()
      
      // 计算需要滚动的距离，使 tab 滚动到容器中间
      const scrollLeft = activeTabElement.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (tabRect.width / 2)
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      })
    }
  }, [activeTab, isLoadingCategory])

  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <div
        ref={scrollContainerRef}
        className={cn(
          'flex items-center pt-4 pb-2 gap-2',
          'overflow-x-auto scrollbar-hide',
          'scroll-smooth',
          // // Hide scrollbar on different browsers
          '[&::-webkit-scrollbar]:hidden',
          '[-ms-overflow-style:none]',
          '[scrollbar-width:none]',
        )}
      >
        {isLoadingCategory ? (
          <div className="flex items-center gap-2 px-2 pt-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="h-6 w-16 bg-primary/10 rounded animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : (
          sortedTabs.map((tab) => (
            <button
              key={tab}
              ref={(el) => {
                tabRefs.current[tab] = el
              }}
              onClick={() => handleTabClick(tab)}
              className={cn(
                'px-2 py-0.5 transition-all duration-200 ease-in-out whitespace-nowrap font-semibold font-normal text-[calc(1rem*(12/16))] shrink-0 rounded-full hover:text-[#FAFAFA]',
                'hover:text-white',
                activeTab === tab ? 'text-[#FAFAFA] bg-[#18181D]' : 'text-[#908E98]',
              )}
            >
              {(categoriesLabelMap[tab as CategoryKey] || tab ) === CATEGORY_ALL
              ? t('tokenSearchDrawer.categories.all') 
              : categoriesLabelMap[tab as CategoryKey] || tab}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default memo(CategoryTabs)
