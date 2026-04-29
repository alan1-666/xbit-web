import { cn } from '@/lib/utils.ts'
import { Link, useLocation } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'

interface Holder {
  rank: number
  username: string
  address: string
  shares: number
  avatarColor: string
  avatarGradient: string
  profileImage?: string
}

interface HolderRowProps {
  holder: Holder
  isYes: boolean
}

// Abbreviate address-like string to 5…5 format (meme style)
const abbreviateAddress = (str: string) => (str.length > 10 ? `${str.slice(0, 5)}…${str.slice(-5)}` : str)

// Check if string looks like an address (EVM 0x+hex, or 0x+hex-timestamp format)
const isAddressLike = (str: string) => /^0x[a-fA-F0-9]{40}$/.test(str) || /^0x[a-fA-F0-9]+-[0-9]+$/.test(str)

import { useTranslation } from 'react-i18next'

export const HolderRow = ({ holder, isYes }: HolderRowProps) => {
  const location = useLocation()
  const { t } = useTranslation()
  const displayName = (() => {
    const raw = holder.username || holder.address
    const shouldAbbreviate = raw === holder.address || isAddressLike(raw)
    return shouldAbbreviate ? abbreviateAddress(raw) : raw
  })()

  return (
    <div className="flex w-full justify-between items-center gap-2 border-b h-[60px] lg:h-[56px] border-white/5 last:border-b-0">
      <div className="flex flex-1 items-center gap-3 min-w-0 px-2">
        <Link className="relative" to={NAVIGATIONS.prediction.portfolioUser(holder.address)} state={{ from: location }}>
          <div
            className={cn(
              'absolute z-5 pointer-events-none -top-[3px] -right-1.5 w-5 h-5 rounded-full flex justify-center items-center text-[10px] text-white font-semibold',
              holder.rank === 1
                ? 'bg-[#E1A510]'
                : holder.rank === 2
                  ? 'bg-[#96AAB4]'
                  : holder.rank === 3
                    ? 'bg-[#BD7F6E]'
                    : 'bg-black',
            )}
          >
            {holder.rank}
          </div>
          <Avatar className="w-8 h-8">
            <AvatarImage src={holder.profileImage} alt={displayName} />
            <AvatarFallback
              className="text-xs font-semibold"
              style={{
                backgroundColor: holder.avatarColor || '#333',
                backgroundImage: holder.avatarGradient,
              }}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col lg:flex-row flex-1 min-w-0 overflow-hidden">
          <div className="flex flex-col flex-1">
            <div className="hidden xl:flex items-center gap-1">
              <Link
                to={NAVIGATIONS.prediction.portfolioUser(holder.address)}
                state={{ from: location }}
                className="text-text text-sm font-medium truncate decoration-solid underline decoration-transparent hover:decoration-text transition-colors cursor-pointer"
              >
                {displayName}
              </Link>
            </div>
            <div className="flex xl:hidden">
              <p className={cn('text-xs font-medium truncate ', isYes ? 'text-green-400' : 'text-red-500')}>
                {Math.round(holder.shares).toLocaleString()} {t('prediction.activities.shares')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="justify-end hidden xl:flex">
        <p className={cn('text-sm font-medium truncate', isYes ? 'text-green-400' : 'text-red-500')}>
          {Math.round(holder.shares).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
