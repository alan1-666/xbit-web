import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ARROW_UP_ICON = '/images/prediction/arrow-down.svg'

const MIN_BALANCE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: '100000', amount: '100,000' },
  { value: '110000', amount: '110,000' },
  { value: '120000', amount: '120,000' },
  { value: '150000', amount: '150,000' },
] as const

export interface TopHoldersMinBalanceSelectorProps {
  value: string
  onChange?: (value: string) => void
}

export const TopHoldersMinBalanceSelector = (props: TopHoldersMinBalanceSelectorProps) => {
  const { value, onChange } = props

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-auto">
        <SelectValue placeholder="Min balance" />
      </SelectTrigger>
      <SelectContent>
        {MIN_BALANCE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {'amount' in option ? (
              <span className="flex items-center gap-1">
                <img src={ARROW_UP_ICON} alt="" className="w-4 h-4 rotate-180" />
                {option.amount}
              </span>
            ) : (
              option.label
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
