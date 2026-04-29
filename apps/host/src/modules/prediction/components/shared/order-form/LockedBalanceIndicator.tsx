import { useContext } from "react"
import { OrderFormContext } from "./OrderFormContext"
import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useFormContext, useWatch } from "react-hook-form"
import { OrderFormData } from "./OrderFormData"

export const LockedBalanceIndicator = () => {
  const { lockedBalance } = useContext(OrderFormContext)
  const { control } = useFormContext<OrderFormData>()
  const [side, orderType] = useWatch({ control, name: ['side', 'orderType'] })
  if (!lockedBalance || side === 'buy' || orderType === 'market') return null
  return (
    <div className="flex justify-end">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="success" className="cursor-pointer flex text-rise items-center justify-end gap-1 text-xs font-normal leading-[1.3] -mt-2">
              <Info className="w-3 h-3" />
              <div className="">
                {lockedBalance} matching
              </div>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{lockedBalance} shares is locked in open orders</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div >
  )
}