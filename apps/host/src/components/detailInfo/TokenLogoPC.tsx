import { useState } from 'react'
import { Avatar } from '@radix-ui/react-avatar'
import { AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { cn } from '@/lib/utils.ts'
import GradientBordered from '@components/common/GradientBordered.tsx'

export interface TokenLogoProps {
  tokenLogo: string
  tokenSymbol: string
  chainLogo: string
}

export const TokenLogo = (props: TokenLogoProps) => {
  const { tokenLogo, tokenSymbol, chainLogo } = props
  const [showCamera, setShowCamera] = useState(false)
  const openGoogleLens = () => {
    const googleLensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(tokenLogo)}`
    window.open(googleLensUrl, '_blank')
  }
  return (
    <div className="cursor-pointer relative">
      <Avatar
        className="size-11.5 block relative"
        onMouseEnter={() => setShowCamera(true)}
        onMouseLeave={() => setShowCamera(false)}
      >
        <AvatarImage
          src={tokenLogo}
          alt={tokenSymbol}
          className="size-full border-[0.5px] border-[#2E0066] rounded-[6px] object-cover"
        />
        <AvatarFallback
          className={cn(
            'size-full aspect-square rounded-[6px] text-[calc(14rem/16)] bg-[#111111] flex items-center justify-center capitalize select-none border-[0.5px] border-[#2E0066]',
          )}
        >
          {tokenSymbol.toLowerCase()}
        </AvatarFallback>
        <div
          className={cn(
            'absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-[6px]',
            showCamera ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          onClick={openGoogleLens}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-3"
          >
            <path
              d="M6.76017 22H17.2402C20.0002 22 21.1002 20.31 21.2302 18.25L21.7502 9.99C21.8902 7.83 20.1702 6 18.0002 6C17.3902 6 16.8302 5.65 16.5502 5.11L15.8302 3.66C15.3702 2.75 14.1702 2 13.1502 2H10.8602C9.83017 2 8.63017 2.75 8.17017 3.66L7.45017 5.11C7.17017 5.65 6.61017 6 6.00017 6C3.83017 6 2.11017 7.83 2.25017 9.99L2.77017 18.25C2.89017 20.31 4.00017 22 6.76017 22Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.5 8H13.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 18C13.79 18 15.25 16.54 15.25 14.75C15.25 12.96 13.79 11.5 12 11.5C10.21 11.5 8.75 12.96 8.75 14.75C8.75 16.54 10.21 18 12 18Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <GradientBordered
          containerClassName={cn('rounded-full aspect-square absolute bottom-[-1px] right-[-1px] size-3.5')}
          innerBgClassName="rounded-full"
        >
          <img src={chainLogo} className="w-full rounded-full" alt="" />
        </GradientBordered>
      </Avatar>
    </div>
  )
}
