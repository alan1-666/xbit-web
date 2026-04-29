import { Skeleton } from '@/components/ui/skeleton'
import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { ReactNode } from 'react'

interface DepositSelectorProps {
  label: string
  rightLabel?: ReactNode
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  loading?: boolean
  getKey?: (option: any) => string
  options: {
    value: string
    label: string
    iconUrl?: string
    id?: string
    [key: string]: any
  }[]
  placeholder?: string
}

export const DepositSelector = ({
  label,
  rightLabel,
  value,
  onValueChange,
  disabled,
  loading,
  options,
  placeholder = 'Select',
  getKey,
}: DepositSelectorProps) => {
  const selectedOption = options.find((opt) => opt.value === value)
  const displayLabel = selectedOption?.label || placeholder
  const displayIcon = selectedOption?.iconUrl

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-[#fafafa]">{label}</label>
        {rightLabel && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            {rightLabel}
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="w-full h-12 rounded-[8px] bg-[#2D2D35]" />
      ) : (
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger className="w-full h-12 bg-transparent rounded-[8px] border border-[#79778C29] px-3 text-white focus:ring-0 focus:ring-offset-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <ChainCurrencyIcon
                currencyIcon={displayIcon || ''}
                name={displayLabel}
                // avatarClassName="w-5 h-5 m-0"
                // className="w-5 h-5"
              />
              <span className="font-semibold truncate">{displayLabel}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={getKey ? getKey(option) : option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <ChainCurrencyIcon
                    currencyIcon={option.iconUrl || ''}
                    name={option.label}
                    // avatarClassName="w-5 h-5 m-0"
                    // className="w-5 h-5"
                  />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
