import { Input } from '@components/ui/input.tsx'
import { Button } from '@components/ui/button.tsx'

interface OrderFormInputProps {
  amount: string
  setAmount: (amount: string) => void
  availableFunds: number
}

export const OrderFormInput = ({ amount, setAmount, availableFunds }: OrderFormInputProps) => {
  const handlePresetClick = (val: number) => {
    const current = parseFloat(amount) || 0
    setAmount((current + val).toString())
  }

  const handleMaxClick = () => {
    setAmount(availableFunds.toString())
  }

  return (
    <div className="flex flex-col gap-3 mt-1">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-foreground">Amount</span>
          <span className="text-xs text-muted-foreground font-medium">Balance ${availableFunds.toFixed(2)}</span>
        </div>
        {/* Large Input Display */}
        <div className="relative max-w-[140px]">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground/30 pointer-events-none">
            $
          </span>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="text-right text-3xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent placeholder:text-muted-foreground/20"
          />
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg font-semibold bg-transparent border-input hover:bg-accent"
          onClick={() => handlePresetClick(1)}
        >
          +$1
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg font-semibold bg-transparent border-input hover:bg-accent"
          onClick={() => handlePresetClick(20)}
        >
          +$20
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg font-semibold bg-transparent border-input hover:bg-accent"
          onClick={() => handlePresetClick(100)}
        >
          +$100
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg font-semibold bg-transparent border-input hover:bg-accent"
          onClick={handleMaxClick}
        >
          Max
        </Button>
      </div>
    </div>
  )
}
