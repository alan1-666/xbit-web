import { fShortenNumber } from '@/lib/number.ts'

type RoundType = 'down' | 'up' | 'nearest'

export interface AmountFormattedProps {
  amount: number
  decimals?: number
  roundType?: RoundType
}

const roundFns: Record<RoundType, (value: number) => number> = {
  down: (value) => Math.floor(value),
  up: (value) => Math.ceil(value),
  nearest: (value) => Math.round(value),
}

export const AmountFormatted = (props: AmountFormattedProps) => {
  const { amount, decimals = 2, roundType = 'nearest' } = props
  if (amount >= 1) return <span>{fShortenNumber(amount, decimals, { round: roundType })}</span>
  const text = amount.toExponential(decimals + 2)
  const [base, exp] = text.split('e')
  const roundFn = roundFns[roundType]
  const meaningfulDigits = roundFn((parseFloat(base) / 10) * Math.pow(10, decimals))
    .toString()
    .replace(/0+$/, '')
  const exponent = Math.abs(+exp) - 1
  return (
    <span>
      0{!!meaningfulDigits && '.'}
      {exponent > 0 && (
        <>
          {exponent <= 4 ? (
            '0'.repeat(exponent)
          ) : (
            <>
              0<sub>{exponent}</sub>
            </>
          )}
        </>
      )}
      {meaningfulDigits}
    </span>
  )
}
