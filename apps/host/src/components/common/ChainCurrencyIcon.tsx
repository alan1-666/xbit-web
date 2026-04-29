import { IMAGES_CONSTANTS } from '@/lib/constant'
import { cn } from '@/lib/utils.ts'
// import { getAvatarFromAddress } from '@/utils/list-coin-helper'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator'
import { ComponentPropsWithoutRef, memo, useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Skeleton } from '../ui/skeleton'

export type ChainCurrencyIconProps = {
  chainIcon?: string
  currencyIcon: string
  avatarClassName?: string
  name?: string
  fallbackClassName?: string
  className?: string
  avatarImageClassName?: string
  fallbackImageEnable?: boolean
  fallbackImage?: string
  fallbackNFT?: string
  skeleton?: boolean
  chainIconClassName?: string
  avatarImageProps?: Omit<ComponentPropsWithoutRef<typeof AvatarImage>, 'src' | 'className'>
}

const ChainCurrencyIcon = memo(
  ({
    chainIcon,
    currencyIcon,
    avatarClassName,
    name,
    fallbackClassName,
    className,
    avatarImageClassName,
    fallbackImageEnable = false,
    fallbackImage = IMAGES_CONSTANTS.DEFAULT.FALLBACK,
    fallbackNFT = '',
    skeleton = false,
    chainIconClassName,
    avatarImageProps,
  }: ChainCurrencyIconProps) => {
    const [src, setSrc] = useState('')
    useEffect(() => {
      generateAvatar(fallbackNFT).then(setSrc)
    }, [fallbackNFT])
    if (skeleton) {
      return <Skeleton className="size-[44px] relative mr-[10px]" />
    } else {
      return (
        <div className={cn('relative', className)}>
          <Avatar className={cn('size-[calc(1rem*(30/16))] relative', avatarClassName)}>
            <AvatarImage
              className={cn('size-[calc(1rem*(30/16))] absolute top-0 left-0 z-10 object-cover', avatarImageClassName)}
              src={currencyIcon}
              alt=""
              {...avatarImageProps}
            />
            {fallbackImageEnable ? (
              <AvatarImage
                className={cn(fallbackNFT.length ? '' : 'size-[calc(1rem*(30/16))]', avatarImageClassName)}
                src={
                  fallbackNFT.length
                    ? // ? `${btoa(getAvatarFromAddress(fallbackNFT))}`
                      src
                    : fallbackImage
                }
                data-avatar-type="wallet"
                alt=""
              />
            ) : (
              <AvatarFallback
                className={cn(
                  'size-[calc(1rem*(30/16))] text-[calc(14rem/16)] rounded-full object-cover bg-[#111111] flex items-center justify-center capitalize select-none',
                  fallbackClassName,
                )}
              >
                {name && /^[a-zA-Z0-9]/.test(name) ? name.slice(0, 2) : name?.slice(0, 1)}
              </AvatarFallback>
            )}
          </Avatar>
          {!!chainIcon && (
            <img
              className={cn(
                'size-[calc(1rem*(12/16))] rounded-full absolute right-[-3px] bottom-[-1px] bg-[#111111]',
                chainIconClassName,
              )}
              src={chainIcon}
              alt=""
            />
          )}
        </div>
      )
    }
  },
)
export default ChainCurrencyIcon
