import { memo, useState } from 'react'
import { cn } from '@/lib/utils'
import { getGradientForLetter } from '@/modules/prediction/utils/earnings.utils'

interface LogoAvatarProps {
  symbol: string
  logoUrl?: string
}

export const LogoAvatar = memo<LogoAvatarProps>(({ symbol, logoUrl }) => {
  const [imageError, setImageError] = useState(false)
  const firstLetter = symbol.charAt(0).toUpperCase()
  const gradient = getGradientForLetter(firstLetter)

  const handleImageError = () => setImageError(true)

  if (!logoUrl || imageError) {
    return (
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br text-sm font-bold text-white shadow-sm',
          gradient,
        )}
        aria-label={`${symbol} logo`}
      >
        {firstLetter}
      </div>
    )
  }

  return (
    <img
      src={logoUrl}
      alt={`${symbol} logo`}
      className="h-8 w-8 rounded-lg object-cover shadow-sm"
      onError={handleImageError}
    />
  )
})

LogoAvatar.displayName = 'LogoAvatar'
