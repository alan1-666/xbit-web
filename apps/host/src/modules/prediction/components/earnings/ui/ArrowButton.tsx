import { memo } from 'react'
import { cn } from '@/lib/utils'

interface ArrowButtonProps {
  direction: 'left' | 'right'
  onClick: () => void
  disabled: boolean
  className?: string
  ariaLabel: string
}

export const ArrowButton = memo<ArrowButtonProps>(({ direction, onClick, disabled, className, ariaLabel }) => {
  const pathD = direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-4 w-4 items-center justify-center transition-all',
        disabled ? 'cursor-not-allowed text-slate-700 opacity-50' : ' text-white',
        className,
      )}
      aria-label={ariaLabel}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pathD} />
      </svg>
    </button>
  )
})

ArrowButton.displayName = 'ArrowButton'
