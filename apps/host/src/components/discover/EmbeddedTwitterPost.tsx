import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { Tweet } from 'react-tweet'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface EmbeddedTwitterPostProps {
  tweetId: string
  classNameIcon?: string
}

export const EmbeddedTwitterPost = (props: EmbeddedTwitterPostProps) => {
  const { tweetId, classNameIcon } = props
  const [open, setOpen] = useState(false)

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={open} onOpenChange={() => setOpen(!open)}>
        <TooltipTrigger
          asChild
          onClick={(event) => {
            setOpen(true)
            event.stopPropagation()
            event.preventDefault()
          }}
        >
          <img
            src="/images/icons/socials/ic-feather.svg?v=4"
            className={cn("size-4.5 cursor-pointer !pointer-events-auto", classNameIcon)}
            alt=""
          />
        </TooltipTrigger>
        <TooltipContent className="w-80 p-0 h-auto border-none bg-transparent overflow-hidden">
          <div data-theme="dark" className="max-h-[50vh] overflow-y-auto no-scrollbar">
            <Tweet id={tweetId} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default EmbeddedTwitterPost
