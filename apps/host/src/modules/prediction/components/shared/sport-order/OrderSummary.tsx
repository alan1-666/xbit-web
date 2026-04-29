import { Info } from 'lucide-react'

interface OrderSummaryProps {
  cost: number
}

export const OrderSummary = ({ cost }: OrderSummaryProps) => {
  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex justify-between items-center">
        <span className="text-base font-medium text-foreground">You'll receive</span>
        <span className="text-[18px] text-brand-500 underline decoration-dotted decoration-brand-500/50 underline-offset-4">
          ${cost.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-foreground font-medium text-base">
          <span>To win</span>
          <Info className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1.5 text-green-500 text-[20px] font-medium">
          <span className="text-green-500">$0</span>
        </div>
      </div>
    </div>
  )
}
