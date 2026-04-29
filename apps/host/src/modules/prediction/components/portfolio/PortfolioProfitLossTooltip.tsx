import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export const PortfolioProfitLossTooltip = () => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="hidden shrink-0 cursor-pointer items-center justify-center md:flex">
            <Info size={12} className="text-gray-400/60 transition-colors hover:text-gray-400" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="flex flex-col gap-2 rounded-lg border border-white/10 bg-[#1c1c1e] p-2 text-sm text-gray-200 shadow-xl"
        >
          <div className="flex w-32 justify-between">
            <span className="font-medium text-white">Gain</span>
            <span>$0.00</span>
          </div>
          <div className="flex w-32 justify-between">
            <span className="font-medium text-white">Loss</span>
            <span>$0.00</span>
          </div>
          <div className="my-1 h-px w-full bg-white/10" />
          <div className="flex w-32 justify-between font-bold text-white">
            <span>Net total</span>
            <span>$0.00</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
