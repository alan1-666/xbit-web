import { Link, useLocation } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { useTranslation } from 'react-i18next'

interface Holder {
  rank: number
  username: string
  address: string
  shares: number
  avatarColor: string
  avatarGradient: string
  profileImage?: string
}

interface HolderRowMobileProps {
  holder: Holder
  isYes: boolean
}

const abbreviateAddress = (str: string) => (str.length > 10 ? `${str.slice(0, 5)}…${str.slice(-5)}` : str)
const isAddressLike = (str: string) => /^0x[a-fA-F0-9]{40}$/.test(str) || /^0x[a-fA-F0-9]+-[0-9]+$/.test(str)

export const HolderRowMobile = ({ holder, isYes }: HolderRowMobileProps) => {
  const location = useLocation()
  const { t } = useTranslation()
  const displayName = (() => {
    const raw = holder.username || holder.address
    const shouldAbbreviate = raw === holder.address || isAddressLike(raw)
    return shouldAbbreviate ? abbreviateAddress(raw) : raw
  })()

  return (
    <Link
      to={NAVIGATIONS.prediction.portfolioUser(holder.address)}
      state={{ from: location }}
      className="flex w-full items-center gap-1.5 border-b border-white/5 py-3 last:border-b-0 pl-2.5"
    >
      <Avatar className="h-8 w-8 shrink-0">
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
      <p
        className={cn(
          'text-sm font-medium',
          isYes ? 'text-rise' : 'text-fall',
        )}
      >
        {Math.round(holder.shares).toLocaleString()} <span className='text-xs'>{t('prediction.activities.shares')}</span>
      </p>
    </Link>
  )
}
