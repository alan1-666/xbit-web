import React from 'react'
import { UITab } from '@/types/uiTabs.ts'

interface CustomTabsProps {
  tabs: UITab[]
  activeTab: string
  onTabChange: (tabValue: string) => void
  className?: string
}

const CustomTabs: React.FC<CustomTabsProps> = ({ tabs, activeTab, onTabChange, className = '' }) => {
  return (
    <div className={`flex gap-6 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`
            text-xl font-normal transition-colors duration-200 cursor-pointer
            ${activeTab === tab.value ? 'text-[#FBFBFB]' : 'text-[#6C6A76]'}
            hover:text-[#FBFBFB]
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default CustomTabs
