import { cn } from '@/lib/utils'
import { usePredictionFilter } from '@/modules/prediction/contexts/PredictionFilterContext'

export default function ButtonFilter() {
  const { isFilterActive, toggleFilter } = usePredictionFilter()

  return (
    <button
      onClick={toggleFilter}
      className={cn("hover:bg-white/10 rounded-lg transition-colors cursor-pointer min-w-7 h-7 flex items-center justify-center",
        isFilterActive ? 'bg-white/10' : 'bg-transparent'
      )}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        <line x1="3" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle
          className="transition-all duration-400 ease-out will-change-transform"
          cx={isFilterActive ? '15' : '9'}
          cy="8"
          r="3"
          fill="#0A0A0A"
          stroke="currentColor"
          strokeWidth="2"
        />

        <line x1="3" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle
          className="transition-all duration-400 ease-out will-change-transform"
          cx={isFilterActive ? '9' : '15'}
          cy="16"
          r="3"
          fill="#0A0A0A"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </button>
  )
}
