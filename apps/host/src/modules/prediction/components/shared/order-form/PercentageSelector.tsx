import { cn } from '@/lib/utils.ts'
import { useEffect, useState } from 'react'

type Option = {
  label: string
  value: number
}

const percentageOptions: Option[] = [
  { label: '25%', value: 25 },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: '100%', value: 100 },
]

const incrementOptions: Option[] = [
  { label: '-100', value: -100 },
  { label: '-10', value: -10 },
  { label: '+10', value: 10 },
  { label: '+100', value: 100 },
]

/** For buy market: +$1, +$2, +$5, +$10, +$100, Max. Use -1 for Max. */
const amountOptions: Option[] = [
  { label: '+$1', value: 1 },
  { label: '+$2', value: 2 },
  { label: '+$5', value: 5 },
  { label: '+$10', value: 10 },
  { label: '+$100', value: 100 },
  { label: 'Max', value: -1 },
]

export interface PercentageSelectorProps {
  variant?: 'percentage' | 'increment' | 'amount'
  onSelect?: (value: number) => void
  outcome?: string
  /** When this value changes, clear the selected state (e.g. pass orderSuccessKey from context). */
  clearWhen?: unknown
  /** When this value changes (e.g. sellMaxSelectedKey), select 100% (max) in percentage variant. */
  selectMaxWhen?: unknown
}

const getOptions = (variant: string) => {
  if (variant === 'increment') return incrementOptions
  if (variant === 'amount') return amountOptions
  return percentageOptions
}

export const PercentageSelector = (props: PercentageSelectorProps) => {
  const { variant = 'percentage', onSelect, outcome, clearWhen, selectMaxWhen } = props
  const options = getOptions(variant)
  const [lastClicked, setLastClicked] = useState<number | null>(null)

  const isActive = (optionValue: number) => lastClicked === optionValue

  const handleClick = (optionValue: number) => {
    setLastClicked(optionValue)
    onSelect?.(optionValue)
  }

  useEffect(() => {
    setLastClicked(null)
  }, [outcome])

  useEffect(() => {
    if (clearWhen !== undefined) setLastClicked(null)
  }, [clearWhen])

  useEffect(() => {
    if (selectMaxWhen !== undefined && variant === 'percentage') setLastClicked(100)
  }, [selectMaxWhen, variant])
  return (
    <div className="flex items-center gap-2 justify-center" role="group" aria-label="Quick amount options">
      {options.map((option) => (
        <button
          key={`${option.label}-${option.value}`}
          type="button"
          aria-pressed={isActive(option.value)}
          className={cn(
            'px-3 py-0.5 border border-transparent bg-[#2B2B33] rounded-[6px] text-xs text-white leading-6 cursor-pointer hover:bg-white/10',
            isActive(option.value) && 'border-[#AB70FF] bg-transparent',
          )}
          onClick={(e) => {
            e.preventDefault()
            handleClick(option.value)
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
