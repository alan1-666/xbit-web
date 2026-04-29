import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { FilterIcon } from '../icons'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

interface HistoryActivityFilterProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export const HistoryActivityFilter = ({ value, onChange, className }: HistoryActivityFilterProps) => {
  const { t } = useTranslation()
  const options = [
    { value: 'All', label: t('prediction.filters.all') },
    { value: 'Trades', label: t('prediction.filters.trades') },
    { value: 'Buy', label: t('prediction.filters.buy') },
    { value: 'Merge', label: t('prediction.filters.merge') },
    { value: 'Redeem', label: t('prediction.filters.redeem') },
  ]

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-white/10 bg-transparent px-4 text-sm font-medium text-gray-400 transition hover:border-white/20 hover:text-gray-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
            className
          )}
        >
          <FilterIcon />
          {selectedOption?.label || value}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-lg border border-white/10 bg-[#1c1c1e] p-1 shadow-xl">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium focus:bg-white/5 focus:text-white ${value === option.value ? 'bg-white/10 text-white' : 'text-gray-400'
              }`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
