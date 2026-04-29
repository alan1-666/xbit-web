import { useContext } from 'react'
import { OrderFormContext } from '@/modules/prediction/components/shared/order-form/OrderFormContext.ts'
import { formatPercent } from '@/lib/format.ts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { TriangleAlert } from 'lucide-react'

export const EstimateFee = () => {
  const { fee } = useContext(OrderFormContext) // fee is in bps, e.g., 1 = 0.01%, 10_000 = 100%
  const feeInPercent = fee / 100
  const isHighFee = feeInPercent > 5

  if (fee === 0) return null

  return (
    <div className="flex items-baseline justify-between">
      <div className="text-[#908E98]">
        <span>Fee</span>
      </div>
      <div className="text-white flex items-center gap-1">
        <span>{formatPercent(feeInPercent)}</span>
        {isHighFee && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <TriangleAlert className="size-3.5 text-yellow-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-70">
                <p className="text-xs leading-none">
                  High fee warning: The maximum trading fee for this market exceeds 5%, which is higher than usual.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
