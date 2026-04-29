import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePortfolio } from '@/modules/prediction/context/PortfolioContext'
import { SortIcon, SortIconAsc } from '../icons'

const OPTIONS = [
  { label: 'Market', key: 'market' as const },
  { label: 'Avg Price', key: 'avg' as const },
  { label: 'Bet', key: 'bet' as const },
  { label: 'To Win', key: 'toWin' as const },
  { label: 'Value', key: 'value' as const },
]

export const PortfolioSortDropdown = () => {
  const { sortBy, sortDirection, setSort } = usePortfolio()

  const activeOption = OPTIONS.find((o) => o.key === sortBy)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-white/10 bg-transparent px-4 text-sm font-medium text-gray-400 transition hover:border-white/20 hover:text-gray-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {sortDirection === 'asc' ? <SortIconAsc className="shrink-0" /> : <SortIcon className="shrink-0" />}
          {activeOption ? activeOption.label : 'Sort by'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-lg border border-white/10 bg-[#1c1c1e] p-1 shadow-xl">
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.key}
            onClick={() => setSort(option.key)}
            className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium focus:bg-white/5 focus:text-white ${
              sortBy === option.key ? 'bg-white/10 text-white' : 'text-gray-400'
            }`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
