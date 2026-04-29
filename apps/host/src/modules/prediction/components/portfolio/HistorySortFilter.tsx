import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'
import { SortIcon } from '../icons'
import { useTranslation } from 'react-i18next'

interface HistorySortFilterProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export const HistorySortFilter = ({ value, onChange, className }: HistorySortFilterProps) => {
  const { t } = useTranslation()
  const optionsMap: Record<string, string> = {
    Newest: t('prediction.filters.newest'),
    Oldest: t('prediction.filters.oldest'),
    Value: t('prediction.filters.value'),
    Shares: t('prediction.filters.shares'),
  }
  const options = Object.keys(optionsMap)

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
          <SortIcon className="shrink-0" />
          {optionsMap[value] || value}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-lg border border-white/10 bg-[#1c1c1e] p-1 shadow-xl"
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onChange(option)}
            className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium focus:bg-white/5 focus:text-white ${value === option ? 'bg-white/10 text-white' : 'text-gray-400'
              }`}
          >
            {optionsMap[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
