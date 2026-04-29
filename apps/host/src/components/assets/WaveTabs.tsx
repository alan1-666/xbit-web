import { cn } from '@/lib/utils.ts'
import { motion } from 'framer-motion'

export type TabItem = {
  label: string
  value: string
}

export interface TabProps {
  tab: TabItem
  onClick: () => void
  active: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  activeTabIndex: number
  onTabChange: (tab: TabItem, index: number) => void
}

export const Tab = (props: TabProps) => {
  const { tab, onClick, active } = props
  return (
    <div onClick={onClick} className="flex-1 text-center z-10 cursor-pointer flex items-center justify-center">
      <div className={`relative max-w-fit ${active ? 'text-white' : 'text-white/70'}`}>
        {tab.label}
        {active && (
          <motion.div
            layoutId="tabs"
            transition={{ duration: 0.3 }}
            className="
              translate-y-1.5 absolute left-0 right-0 w-full bottom-0
              before:content-['']
              before:block
              before:h-[1.5px]
              before:rounded-[100%]
              before:bg-linear-to-r
              before:from-[#9945FF]
              before:to-[#00F3AB]
              after:content-['']
              after:w-[26px]
              after:aspect-[16/6]
              after:absolute
              after:left-[50%]
              after:bottom-[-1px]
              after:translate-x-[-50%]
              after:bg-[url(/images/moving-line-tab-blur.webp)]
              after:bg-contain
            "
          />
        )}
      </div>
    </div>
  )
}

export const Tabs = (props: TabsProps) => {
  const { tabs, activeTabIndex, onTabChange } = props
  const tabsLength = tabs.length
  return (
    <div className="flex items-center gap-2 w-full py-3 mt-4 rounded-t-lg relative overflow-hidden">
      <div className="bg-[#232329] absolute inset-0 top-1 rounded-t-[10px]" />
      <div
        className={cn(`absolute transition-all duration-300 bottom-0 h-[44px] z-0 will-change-transform`)}
        style={{ left: '0px', width: `100%` }}
      >
        <div
          className={cn(
            'w-full h-[50px] relative  bg-size-[100%_50px] bg-no-repeat',
            activeTabIndex === 0 ? 'bg-[url(/images/assets/tabBg.png)]' : 'bg-[url(/images/assets/tabBgRight.png)]',
            // 'before:absolute before:-left-8 before:w-8 before:h-[49px] before:bg-[url(/images/assets/tab-left.png)] before:bg-size-[100%_49px] bg-no-repeat',
            // 'after:absolute after:-right-8 after:w-8 after:h-[49px] after:bg-[url(/images/assets/tab-right.png)] after:bg-size-[100%_49px] bg-no-repeat',
          )}
        />
      </div>
      {tabs.map((tab, index) => (
        <Tab
          key={index}
          tab={tab}
          active={activeTabIndex === index}
          onClick={() => {
            onTabChange(tab, index)
          }}
        />
      ))}
    </div>
  )
}
