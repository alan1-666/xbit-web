import GradientBordered from '@components/common/GradientBordered.tsx'
import { cn } from '@/lib/utils.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { ComponentPropsWithoutRef } from 'react'

type LogoWithChainProps = {
  className?: string
  logo: string
  logoClassName?: string
  logoContainerClassName?: string
  chainLogo?: string
  chainContainerClassName?: string
  chainInnerClassName?: string
  chainImgClassName?: string
  name: string
  avatarImageProps?: Omit<ComponentPropsWithoutRef<typeof AvatarImage>, 'src' | 'className'>
}

const LogoWithChain = ({
  logo,
  className,
  logoClassName,
  chainLogo,
  chainContainerClassName,
  chainInnerClassName,
  chainImgClassName,
  name,
  logoContainerClassName,
  avatarImageProps,
}: LogoWithChainProps) => {
  return (
    <div className={cn('relative', className)}>
      {/* container */}
      {/* logo */}
      <Avatar className={cn('w-auto h-auto', logoContainerClassName)}>
        <AvatarImage
          className={cn('w-[26px] min-w-[26px] aspect-square rounded-full object-cover', logoClassName)}
          src={logo}
          alt=""
          {...avatarImageProps}
        />
        <AvatarFallback
          className={cn(
            'w-[26px] min-w-[26px] aspect-square rounded-full text-[calc(14rem/16)] bg-[#111111] flex items-center justify-center capitalize select-none',
            logoClassName,
          )}
        >
          {name && /^[a-zA-Z0-9]/.test(name) ? name.slice(0, 2) : name?.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
      {/* chain logo */}
      {chainLogo && (
        <GradientBordered
          containerClassName={cn(
            'rounded-full w-[12px] min-w-[12px] aspect-square absolute bottom-[-1px] right-[-1px]',
            chainContainerClassName,
          )}
          innerBgClassName={cn('rounded-full', chainInnerClassName)}
        >
          <img src={chainLogo} className={cn('w-full h-full rounded-full', chainImgClassName)} alt="" />
        </GradientBordered>
      )}
    </div>
  )
}

export default LogoWithChain
