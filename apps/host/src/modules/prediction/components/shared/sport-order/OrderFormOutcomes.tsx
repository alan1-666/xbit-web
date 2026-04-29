import { TeamModel } from '@/modules/prediction/models/TeamModel.ts'
import { cn } from '@/lib/utils.ts'

interface OrderFormOutcomesProps {
  outcomes: string[]
  selectedOutcome: string
  setSelectedOutcome?: (outcome: string) => void
  teams?: TeamModel[]
  outcomePrices: number[]
}

export const OrderFormOutcomes = ({
  outcomes,
  selectedOutcome,
  setSelectedOutcome,
  teams,
  outcomePrices,
}: OrderFormOutcomesProps) => {
  const homeTeam = teams?.[0]
  const awayTeam = teams?.[1]

  return (
    <div className="grid grid-cols-2 gap-3">
      {outcomes.map((outcome: string, index: number) => {
        const isSelected = selectedOutcome === outcome
        const team = index === 0 ? homeTeam : awayTeam
        const teamColor = team?.color || (index === 0 ? '#00338D' : '#E5E7EB')

        const priceDisplay = Math.ceil((outcomePrices[index] || 0) * 100) + '¢'

        return (
          <button
            key={index}
            onClick={() => setSelectedOutcome?.(outcome)}
            className={cn(
              'flex items-center justify-center gap-2 py-3 px-4 rounded-[10px] transition-all',
              isSelected
                ? 'text-white shadow-md'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10',
            )}
            style={isSelected ? { backgroundColor: teamColor } : undefined}
          >
            <span className="font-bold text-sm uppercase">{team?.abbreviation || outcome.slice(0, 3)}</span>
            <span className={cn('text-lg font-bold', isSelected ? '' : 'opacity-70')}>{priceDisplay}</span>
          </button>
        )
      })}
    </div>
  )
}
