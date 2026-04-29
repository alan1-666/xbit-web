import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { UserProfileActivity } from './UserProfileActivity'
import { UserPositionsFilterBar } from './UserPositionsFilterBar'
import { UserActivePositionsTable } from '@/modules/prediction/components/profile/UserActivePositionsTable.tsx'
import { UserClosedPositionsTable } from '@/modules/prediction/components/profile/UserClosedPositionsTable.tsx'
import { useUserProfile } from '@/modules/prediction/context/UserProfileContext.tsx'

export const UserProfileContent = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'positions'
  const [positionsFilter, setPositionsFilter] = useState<'active' | 'closed'>('active')
  const { userId } = useUserProfile()

  const handleTabChange = (tab: string) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.set('tab', tab)
        return newParams
      },
      { replace: true },
    )
  }

  const tabs = [
    { key: 'positions', label: t('prediction.profile.positions') },
    { key: 'activity', label: t('prediction.profile.activity') },
  ]

  return (
    <div className="flex flex-col">
      {/* Sticky Tabs Header */}
      <div className="sticky top-12 z-20 xl:top-0 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a]">
        <div className="relative">
          <div className="relative inline-flex items-center gap-5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`relative z-10 inline-flex cursor-pointer items-center justify-center rounded-md py-1 text-[15px] font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'} `}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeProfileTab"
                    className="absolute bottom-0 h-0.5 w-full bg-white"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4 xl:pb-8">
        {activeTab === 'positions' && (
          <div className="flex flex-col">
            {/* Positions Controls (Active/Closed + Search + Sort) */}
            <UserPositionsFilterBar positionsFilter={positionsFilter} setPositionsFilter={setPositionsFilter} />

            <div className="xl:pt-2 pt-1">
              {positionsFilter === 'active' ? (
                <UserActivePositionsTable userAddress={userId || ''} />
              ) : (
                <UserClosedPositionsTable userAddress={userId || ''} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="flex flex-col gap-4">
            <div>
              <UserProfileActivity />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
