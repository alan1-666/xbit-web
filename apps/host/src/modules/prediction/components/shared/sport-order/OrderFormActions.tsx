import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import { Button } from '@components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'

interface OrderFormActionsProps {
  type: 'buy' | 'sell'
  selectedOutcome: string
  teams?: TeamModel[]
  outcomes: string[]
}

export const OrderFormActions = ({ type, selectedOutcome, teams, outcomes }: OrderFormActionsProps) => {
  const homeTeam = teams?.[0]
  const awayTeam = teams?.[1]

  return (
    <>
      {/* Action Button */}
      <Button
        className={cn(
          'w-full h-12 rounded-[10px] text-white text-base font-bold shadow-sm mt-2',
          type === 'sell' ? 'bg-red-600 hover:bg-red-700' : '',
        )}
        style={
          type === 'buy'
            ? {
                backgroundColor:
                  selectedOutcome === outcomes[0] ? homeTeam?.color || '#00338D' : awayTeam?.color || '#00338D',
              }
            : undefined
        }
      >
        {type === 'buy' ? 'Buy' : 'Sell'} {selectedOutcome}
      </Button>

      {/* Footer */}
      <p className="text-center text-[11px] text-muted-foreground font-medium mt-1">
        By trading, you agree to the{' '}
        <span className="underline cursor-pointer hover:text-foreground">Terms of Use</span>.
      </p>
    </>
  )
}
