import { MouseEvent } from 'react'
import { TokenAvatarWithProgress, TokenAvatarWithProgressProps } from './TokenAvatarWithProgress'
import { IconCamera } from '@components/v2/ui-shared/icons/IconCamera.tsx'
import { IconEyeClose } from '@components/v2/ui-shared/icons/IconEyeClose.tsx'
import { IconIgnoreDev } from '@components/v2/ui-shared/icons/IconIgnoreDev.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SimilarTokensList } from '@pages/meme/discover/desktop/components/SimilarTokensList.tsx'
import { cn } from '@/lib/utils.ts'
import { useSelector } from 'react-redux'
import { selectTokenAvatarByAddress } from '@/redux/modules/tokenAvatars.slice.ts'

export interface HoverableTokenAvatarProps extends TokenAvatarWithProgressProps {
  onHideToken?: () => void
  onHideDEV?: () => void
  address: string
  chainId: number
  thumbnailUrl?: string
  className?: string
  avatarClassName?: string
  allowBlacklist?: boolean
  showSimilarTokens?: boolean
}

const TokenImageTooltip = (props: HoverableTokenAvatarProps) => {
  const { tokenAvatar, thumbnailUrl, name, address, chainId, showSimilarTokens = true } = props
  const cdnAvatar = useSelector(selectTokenAvatarByAddress(address))
  const openGoogleLens = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    if (!tokenAvatar) return
    const googleLensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(tokenAvatar)}`
    window.open(googleLensUrl, '_blank')
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <div role="button" aria-label="hoverable avatar" className="absolute inset-0 flex items-center justify-center">
          <IconCamera />
        </div>
      </TooltipTrigger>
      <TooltipContent align="start" side="bottom" className="p-2 border border-[#ECECED14] rounded-[8px] bg-[#232329]">
        <div className="max-w-full">
          <Avatar className="size-[260px] overflow-hidden rounded-[8px] relative">
            <div className="relative group">
              <AvatarImage
                src={cdnAvatar?.avatarUrl || thumbnailUrl || tokenAvatar}
                className="size-full rounded-[8px] z-[2] border-[0.8px]  object-cover cursor-pointer"
              />
              <div
                className="absolute inset-0 bg-black/40 justify-center items-center cursor-pointer hidden hover:flex group-hover:flex"
                onClick={openGoogleLens}
              >
                <IconCamera className="size-10" />
              </div>
            </div>
            <AvatarFallback className="size-full z-[3] text-[calc(14rem/16)] border-[0.8px] rounded-[8px] object-cover bg-[#111111] flex items-center justify-center capitalize select-none">
              {name?.slice(0, 2).toLowerCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {showSimilarTokens ? <SimilarTokensList chainId={chainId} token={address} /> : null}
      </TooltipContent>
    </Tooltip>
  )
}

export const HoverableTokenAvatar = (props: HoverableTokenAvatarProps) => {
  const { onHideToken, onHideDEV, allowBlacklist = true, ...rest } = props

  const handleHideToken = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    onHideToken?.()
  }

  const handleHideDEV = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    onHideDEV?.()
  }

  return (
    <div className={cn('relative group size-16', props.className)}>
      <TokenAvatarWithProgress {...rest} className={cn(props.avatarClassName)} />
      <div className="absolute inset-0 bg-[#00000033] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded-[8px]">
        <div className="size-full flex items-center justify-center relative">
          <TokenImageTooltip {...props} />

          {allowBlacklist ? (
            <div className="flex flex-col gap-0.5 absolute -top-1 -left-1">
              <div className="bg-[#232329] border-[0.6px] border-[#878787] text-[#878787] size-4 flex items-center justify-center rounded-[4px]">
                <SimpleTooltip content="Hide token" side="right">
                  <IconEyeClose className="size-[11px] hover:text-white cursor-pointer" onClick={handleHideToken} />
                </SimpleTooltip>
              </div>
              <div className="bg-[#232329] border-[0.6px] border-[#878787] text-[#878787] size-4 flex items-center justify-center rounded-[4px]">
                <SimpleTooltip content="Ignore DEV" side="right">
                  <IconIgnoreDev className="size-[11px] hover:text-white cursor-pointer" onClick={handleHideDEV} />
                </SimpleTooltip>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
