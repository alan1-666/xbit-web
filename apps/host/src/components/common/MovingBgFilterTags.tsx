import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils.ts'
import { MouseEvent, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'

export type MovingBgFilterTagsHandle = {
  selectTab: (tab: string) => void
}

type MovingBgFilterTagsProps = {
  tabs: string[]
  defaultTab: string
  activeTab?: string
  containerId: string
  containerClassName?: string
  tabsListClassName?: string
  tabsTriggerClassName?: string
  tabsTriggerActiveClassName?: string
  tabsTriggerInactiveClassName?: string
  tabBgClassName?: string
  onTabChange?: (tab: string) => any
  formatTabLabel?: (tab: string, activeTab?:string) => string
  ref?: Ref<MovingBgFilterTagsHandle>
}

type ActiveTagRect = {
  width: number
  height: number
  left: number
}

const getTagRect = (containerId: string, tabId: string): ActiveTagRect => {
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

const MovingBgFilterTags = ({
  tabs,
  defaultTab = tabs[0],
  activeTab = tabs[0],
  containerId,
  containerClassName,
  tabsListClassName,
  tabsTriggerClassName,
  tabsTriggerActiveClassName,
  tabsTriggerInactiveClassName,
  tabBgClassName,
  onTabChange,
  ref,
  formatTabLabel = (tab: string, activeTab?:string) => tab,
}: MovingBgFilterTagsProps) => {
  const [activeTagRect, setActiveTagRect] = useState<ActiveTagRect>(getTagRect(containerId, defaultTab))
  const tabBgRef = useRef<HTMLSpanElement>(null)

  const tabBgStyles = {
    width: `${activeTagRect.width - 0.5}px`,
    height: `${activeTagRect.height}px`,
    transform: `translateX(${activeTagRect.left - 1}px)`,
  }

  const handleTabChange = (tab: string) => {
    setActiveTagRect(getTagRect(containerId, tab))
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  // useEffect(() => {
  //   setActiveTagRect(getTagRect(containerId, defaultTab))
  //   let tabBgTransitionTimeout: ReturnType<typeof setTimeout>
  //   if (tabBgRef?.current) {
  //     tabBgRef?.current?.classList.remove('opacity-0')
  //     tabBgTransitionTimeout = setTimeout(() => {
  //       tabBgRef?.current?.classList.add('transition-[.3s]')
  //     }, 50)
  //   }

  //   return () => {
  //     clearTimeout(tabBgTransitionTimeout)
  //   }
  // }, [defaultTab])

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setActiveTagRect(getTagRect(containerId, activeTab))
    })

    const container = document.getElementById(containerId)
    if (container) {
      observer.observe(container)
    }

    // Initial setup sau khi DOM stable
    setActiveTagRect(getTagRect(containerId, activeTab))
    if (tabBgRef?.current) {
      tabBgRef.current.classList.remove('opacity-0')
      tabBgRef.current.classList.add('transition-all', 'duration-300')
    }

    return () => {
      observer.disconnect()
    }
  }, [containerId, activeTab])

  const handleOnTabClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    // check if the target is fully displayed. if not, scroll to the target so that it centers in the container
    const container = document.getElementById(containerId)
    if (container) {
      const containerRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      container.scrollTo({
        left: targetRect.left - containerRect.left + container.scrollLeft - targetRect.width / 2,
        behavior: 'smooth',
      })
    }
  }

  useImperativeHandle(ref, () => ({
    selectTab: (tab: string) => {
      handleTabChange(tab)
      const tabElement = document.getElementById(`${containerId}-${tab}`)
      if (tabElement) {
        tabElement.scrollIntoView({ behavior: 'smooth', inline: 'center' })
      }
    },
  }))

  return (
    <Tabs
      id={containerId}
      className={cn('h-[24px] leading-[1]', containerClassName)}
      onValueChange={handleTabChange}
      value={activeTab}
      defaultValue={defaultTab}
    >
      <TabsList
        className={cn(
          'rounded-[4px] h-full relative p-[2px] bg-[#ECECED14] overflow-x-auto no-scrollbar',
          tabsListClassName,
        )}
      >
        {tabs.map((tab: string) => (
          <TabsTrigger
            className={cn(
              'relative z-1 rounded-[3px] !bg-transparent shadow-[none] text-[11px] h-[20px] px-[6px] py-[4px] leading-[1] app-font-regular',
              activeTab === tab
                ? `!text-[#FFFFFF ${tabsTriggerActiveClassName}`
                : `!text-[#FFFFFF99] ${tabsTriggerInactiveClassName}`,
              tabsTriggerClassName,
            )}
            key={tab}
            id={`${containerId}-${tab}`}
            value={tab}
            onClick={handleOnTabClick}
          >
            {formatTabLabel(tab, activeTab)}
          </TabsTrigger>
        ))}
        <span
          className={cn(
            'opacity-0 absolute z-0 left-[1px] top-[2px] rounded-[3px] bg-[#6A2AE0]',
            'will-change-transform transform-gpu',
            tabBgClassName,
          )}
          style={{ ...tabBgStyles, backfaceVisibility: 'hidden' }}
          ref={tabBgRef}
        />
      </TabsList>
    </Tabs>
  )
}

export default MovingBgFilterTags
