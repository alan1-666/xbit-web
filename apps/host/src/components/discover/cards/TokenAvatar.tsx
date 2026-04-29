import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils.ts'
import { useTokenAvatarSubscription } from '@hooks/useTokenAvatarSubscription.ts'

export interface TokenAvatarProps {
  tokenAvatar?: string
  chainLogo?: string
  name?: string
  children?: ReactNode
  className?: string
  chainLogoContainerClassName?: string
  chainLogoClassName?: string
  subscriptionTopic?: string
  avatarClassName?: string
}

export const TokenAvatar = (props: TokenAvatarProps) => {
  const {
    tokenAvatar,
    chainLogo,
    name,
    children,
    className,
    chainLogoContainerClassName,
    chainLogoClassName,
    subscriptionTopic,
    avatarClassName,
  } = props

  const [displaySrc, setDisplaySrc] = useState(tokenAvatar)

  const realtimeAvatar = useTokenAvatarSubscription({
    topic: subscriptionTopic || '',
    defaultAvatar: tokenAvatar,
    enabled: !!subscriptionTopic,
  })

  useEffect(() => {
    const url = realtimeAvatar?.avatarUrl
    if (!url) {
      if (!tokenAvatar) {
        setDisplaySrc('')
      } else {
        setDisplaySrc(tokenAvatar)
      }
      return
    }

    const img = new Image()
    img.src = url
    img.onload = () => {
      setDisplaySrc(url)
    }
    img.onerror = () => {
      setDisplaySrc(tokenAvatar || '')
    }

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [realtimeAvatar])

  return (
    <Avatar className={cn('size-[44px] overflow-visible relative', className)}>
      <AvatarImage
        data-type="avatar"
        alt="token avatar"
        src={displaySrc}
        className={cn('size-full rounded-[8px] z-[2] border-[0.8px] border-[#2E0066] object-cover', avatarClassName)}
      />
      <AvatarFallback className="size-full z-[3] text-[calc(14rem/16)] border-[0.8px] border-[#2E0066] rounded-[8px] object-cover bg-[#111111] flex items-center justify-center capitalize select-none">
        {name?.slice(0, 2).toLowerCase()}
      </AvatarFallback>
      {children}
      {chainLogo && (
        <div
          className={cn(
            'p-[1px] z-10 bg-[linear-gradient(37.15deg,#E149F8_13.23%,#9945FF_37.52%,#00F3AB_93.06%)] rounded-full absolute -bottom-0.5 -right-0.5',
            chainLogoContainerClassName,
          )}
        >
          <img
            src={chainLogo}
            className={cn('size-3 rounded-full bg-[#000000]', chainLogoClassName)}
            alt="chain logo"
          />
        </div>
      )}
    </Avatar>
  )
}
