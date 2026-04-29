import { HolderRow } from '@/modules/prediction/components/event-details/HolderRow.tsx'
import { BlankState } from '@components/v2/ui-shared/components/BlankState.tsx'

interface Holder {
  rank: number
  username: string
  address: string
  shares: number
  avatarColor: string
  avatarGradient: string
  profileImage?: string
}

interface HoldersColumnProps {
  outcome: string
  holders: Holder[]
  isYes: boolean
  side: 'left' | 'right'
}

import { useTranslation } from 'react-i18next'

export const HoldersColumn = ({ outcome, holders, isYes, side }: HoldersColumnProps) => {
  const paddingClass = side === 'left' ? 'pr-2.5' : 'pl-2.5'
  const sortedHolders = [...holders].sort((a, b) => b.shares - a.shares)
  const { t } = useTranslation()

  return (
    <div className="flex-1 flex flex-col w-full lg:border-r border-white/5 last:border-r-0 border">
      <div
        className={`flex w-full justify-between items-center h-[42px] border-b border-white/5 bg-background ${paddingClass}`}
      >
        <div className="flex items-center gap-2 px-2">
          <p className="text-text text-sm font-medium">{outcome} {t('prediction.eventDetails.tabs.holders').toLowerCase()}</p>
        </div>
        <p className="text-sm tracking-wider text-text-secondary font-medium hidden lg:flex">{t('prediction.activities.shares')}</p>
      </div>
      {holders.length > 0 ? (
        <div className={`w-full relative z-1 ${paddingClass}`}>
          <div className="flex flex-col w-full">
            {sortedHolders.map((holder, index) => (
              <HolderRow
                key={holder.address}
                holder={{ ...holder, rank: index + 1 }}
                isYes={isYes}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="py-4">
          <BlankState />
        </div>
      )}
    </div>
  )
}
