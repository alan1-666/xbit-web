import { Input } from '@/components/ui/input'
import { Minus, Plus } from 'lucide-react'

interface LimitPriceInputProps {
  price: string
  setPrice: (price: string) => void
  onAdjust: (adjustment: number) => void
  availableFunds: number
}

export const LimitPriceInput = ({ price, setPrice, onAdjust, availableFunds }: LimitPriceInputProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-base font-medium text-foreground">Limit Price</span>
        <span className="text-xs text-muted-foreground font-medium">Balance ${availableFunds.toFixed(2)}</span>
      </div>

      <div className="relative flex items-center border border-border rounded-md overflow-hidden bg-background h-10 w-full">
        <button
          onClick={() => onAdjust(-1)}
          className="flex items-center justify-center h-full w-10 border-r border-border hover:bg-neutral-800 transition-colors"
        >
          <Minus className="w-3 h-3 text-foreground" />
        </button>

        <div className="flex-1 relative flex items-center justify-center">
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="text-center border-none shadow-none focus-visible:ring-0 h-full text-lg font-semibold bg-transparent w-full"
            placeholder="0"
          />
          <span className="absolute right-8 text-muted-foreground font-semibold">¢</span>
        </div>

        <button
          onClick={() => onAdjust(1)}
          className="flex items-center justify-center h-full w-10 border-l border-border hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-3 h-3 text-foreground" />
        </button>
      </div>
    </div>
  )
}
