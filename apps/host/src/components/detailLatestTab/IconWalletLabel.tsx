import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import {useResponsive} from "@hooks/hyperliquid/useResponsive.ts";
import {cn} from "@/lib/utils.ts";

export interface IconWalletLabelProps {
  icon: string
  label: string
}

export const IconWalletLabel = (props: IconWalletLabelProps) => {
  const { icon, label } = props
  const { isDesktop } = useResponsive()
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <img className={cn("cursor-pointer", isDesktop ? 'w-4 h-4' : 'w-3 h-3 ')} src={icon} alt="" />
        </TooltipTrigger>
        <TooltipContent>
          <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
            {label}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
