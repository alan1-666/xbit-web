import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SharesInputProps {
  shares: string
  setShares: (shares: string) => void
  onAdjust: (adjustment: number) => void
}

export const SharesInput = ({ shares, setShares, onAdjust }: SharesInputProps) => {
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-foreground">Shares</span>
          <button
            className="text-xs font-medium text-muted-foreground underline decoration-dotted"
            onClick={() => setShares('100')} // Placeholder MAX logic
          >
            Max
          </button>
        </div>

        <div className="relative flex items-center border border-border rounded-md overflow-hidden bg-background h-10 w-full pr-3 text-right">
          <Input
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="text-right border-none shadow-none focus-visible:ring-0 h-full text-lg font-semibold bg-transparent w-full pr-1"
            placeholder="0"
          />
        </div>
      </div>

      {/* Quick Share Adjustments */}
      <div className="flex gap-2 justify-end w-full">
        {[-100, -10, 10, 100].map((val) => (
          <Button
            key={val}
            variant="outline"
            size="sm"
            onClick={() => onAdjust(val)}
            className={cn(
              'flex-1 h-8 px-0 text-xs font-medium border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {val > 0 ? `+${val}` : val}
          </Button>
        ))}
      </div>
    </>
  )
}
