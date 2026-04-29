import { Outcome } from '@/modules/prediction/components/shared/Outcome.tsx'

export type MarketOutcome = {
  key: string
  label: string
  value: string
  color: string
  line?: string
}

export interface OutcomesProps {
  outcomes: MarketOutcome[]
  onSelect?: (market: MarketOutcome) => void
}

export const Outcomes = (props: OutcomesProps) => {
  const { outcomes, onSelect } = props
  return (
    <div className="flex items-center gap-2">
      {outcomes.map((outcome) => (
        <Outcome
          label={outcome.label}
          value={outcome.value}
          key={outcome.key}
          color={outcome.color}
          line={outcome.line}
          onClick={() => onSelect?.(outcome)}
        />
      ))}
    </div>
  )
}
