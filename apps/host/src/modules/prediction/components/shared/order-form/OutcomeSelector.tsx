import { cn } from '@/lib/utils.ts'
import { useFormContext, useWatch } from 'react-hook-form'
import { OrderFormData } from './OrderFormData.ts'
import { useMemo } from 'react'

interface OutcomeOptionProps {
  outcomeValue: 'yes' | 'no'
  label: string
  price: number
  className?: string
  onClick?: () => void
  minTickSize?: number
}

const OutcomeOption = (props: OutcomeOptionProps) => {
  const { label, price = 0, className, onClick, minTickSize = 0.01 } = props
  const formattedPrice = useMemo(() => {
    // Precision derived from minTickSize (e.g. 0.01 → cents, 0.001 → tenths of cents)
    // const precision = -Math.log10(minTickSize * 100)
    // return (price * 100)
    //   .toLocaleString('en-US', {
    // minimumFractionDigits: precision < 0 ? 0 : precision,s
    // maximumFractionDigits: precision < 0 ? 0 : precision,
    // })
    //   .replace(/\.0+$/, '')
    const priceInCents = price * 100
    return priceInCents.toLocaleString('en-US', {})
  }, [price, minTickSize])
  return (
    <button
      type="button"
      className={cn(
        'h-9 flex gap-1 w-full items-center justify-between rounded-[6px] px-2.5 text-base transition-colors cursor-pointer font-semibold text-left',
        className,
      )}
      onClick={onClick}
    >
      <span className='max-w-32 truncate'>{label}</span>
      <span className="text-base lg:text-lg">{formattedPrice}¢</span>
    </button>
  )
}

export interface OutcomeSelectorProps {
  outcomes: string[]
  outcomePrices: number[]
  minTickSize?: number
  onOutcomeSelect?: (outcome: 'yes' | 'no') => void
}

export const OutcomeSelector = (props: OutcomeSelectorProps) => {
  const { outcomes, outcomePrices, minTickSize, onOutcomeSelect } = props
  const { control, setValue } = useFormContext<OrderFormData>()
  const selectedOutcome = useWatch({ control, name: 'outcome' })
  const [yesLabel, noLabel] = outcomes
  const [yesPrice, noPrice] = outcomePrices
  const handleYesClick = () => {
    setValue('outcome', 'yes')
    setValue('data.price', yesPrice)
    onOutcomeSelect?.('yes')
  }
  const handleNoClick = () => {
    setValue('outcome', 'no')
    setValue('data.price', noPrice)
    onOutcomeSelect?.('no')
  }
  return (
    <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
      <OutcomeOption
        outcomeValue="yes"
        label={yesLabel || 'Yes'}
        price={yesPrice}
        className={cn(selectedOutcome === 'yes' ? 'bg-rise/10 text-rise' : 'bg-[#2B2B33] text-[#908E98]')}
        onClick={handleYesClick}
        minTickSize={minTickSize}
      />
      <OutcomeOption
        outcomeValue="no"
        label={noLabel || 'No'}
        price={noPrice}
        className={cn(selectedOutcome === 'no' ? 'bg-fall/10 text-fall' : 'bg-[#2B2B33] text-[#908E98]')}
        onClick={handleNoClick}
        minTickSize={minTickSize}
      />
    </div>
  )
}
