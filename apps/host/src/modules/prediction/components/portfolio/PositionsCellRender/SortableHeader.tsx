import { usePortfolio } from '@/modules/prediction/context/PortfolioContext'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableHeaderProps {
  columnKey: 'market' | 'avg' | 'bet' | 'toWin' | 'value'
  label: string
  className?: string
}

const SortableHeader = ({ columnKey, label, className }: SortableHeaderProps) => {
  const { sortBy, sortDirection, setSort } = usePortfolio()

  return (
    <div
      className={cn('cursor-pointer', className)}
      // onClick={() => setSort(columnKey)}
    >
      <span className="text-sm  font-light text-[#FFFFFF80] flex items-center gap-1 mb-[2px]">
        {label}
        {/* {sortBy === columnKey && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)} */}
      </span>
    </div>
  )
}

export default SortableHeader
