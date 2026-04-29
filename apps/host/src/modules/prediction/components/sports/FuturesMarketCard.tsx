import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export interface FuturesOutcome {
  id: string
  name: string
  icon?: string
  probability: number
  color?: string
  isWinner?: boolean
}

export interface FuturesMarketCardProps {
  title: string
  outcomes: FuturesOutcome[]
  link?: string
  className?: string
  enableExpand?: boolean
  initialCount?: number
  showIcon?: boolean
  showProgressBar?: boolean
}

export const FuturesMarketCard = ({
  title,
  outcomes,
  link,
  className,
  enableExpand = true,
  initialCount = 5,
  showIcon = true,
  showProgressBar = true,
}: FuturesMarketCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // If expansion is disabled, we just show the initialCount
  const effectiveDisplayCount = enableExpand ? 6 : initialCount

  const visibleOutcomes = enableExpand ? outcomes : outcomes.slice(0, effectiveDisplayCount)

  const hasMore = enableExpand && outcomes.length > effectiveDisplayCount

  return (
    <div
      className={cn(
        'flex flex-col bg-[#1C1F26] rounded-xl border border-white/5 overflow-hidden transition-all hover:bg-[#1C1F26] hover:shadow-md hover:-translate-y-px',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center px-5 py-4 border-b border-white/5">
        {link ? (
          <Link to={link || '#'} className="group flex items-center gap-2">
            <h3 className="text-lg font-bold text-white group-hover:underline decoration-2 decoration-transparent group-hover:decoration-white transition-all">
              {title}
            </h3>
          </Link>
        ) : (
          <h3 className="text-lg font-bold text-white">{title}</h3>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col w-full">
        <div className="flex flex-col w-full relative">
          <div
            className={cn(
              'flex flex-col w-full transition-all duration-300 ease-in-out overflow-hidden',
              !isExpanded && enableExpand ? 'max-h-[300px]' : 'max-h-[2000px]',
            )}
          >
            {visibleOutcomes.map((outcome) => (
              <Link
                key={outcome.id}
                to={link ? `${link}` : '#'}
                className="group relative flex items-center justify-between px-3 py-2 hover:bg-white/2 transition-colors"
              >
                <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
                  {/* Icon */}
                  {showIcon && (
                    <div className="w-8 h-8 shrink-0 rounded-[6px] overflow-hidden bg-[#2C3038] flex items-center justify-center">
                      {outcome.icon ? (
                        <img src={outcome.icon} alt={outcome.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400">
                          {outcome.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Name */}
                  <span className="text-sm font-semibold text-gray-200 truncate group-hover:underline decoration-2 decoration-transparent group-hover:decoration-gray-200 transition-all">
                    {outcome.name}
                  </span>
                </div>

                {/* Bar & Percent */}
                <div className="flex items-center justify-end h-8 gap-2 ml-4 shrink-0 xl:w-1/2">
                  {/* Percent Text */}
                  <span className="text-sm font-bold text-white w-9 text-right tabular-nums">
                    {outcome.probability < 1 ? '<1' : Math.round(outcome.probability)}%
                  </span>

                  {/* Bar Container */}
                  {showProgressBar && (
                    <div className="w-24 sm:w-36 xl:w-auto xl:flex-1 h-full bg-transparent rounded-lg overflow-hidden relative">
                      {/* Bar Segment */}
                      <div
                        className="h-full rounded-lg transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.max(outcome.probability, 1)}%`,
                          backgroundColor: outcome.color || '#3B82F6', // Default blue
                        }}
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-transparent group-hover:bg-white/5 transition-opacity pointer-events-none" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {/* Fade overlay when collapsed (only if expandable) */}
          {enableExpand && !isExpanded && hasMore && (
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-[#1C1F26] to-transparent pointer-events-none" />
          )}
        </div>
      </div>

      {hasMore && (
        <div className="px-4 py-3 border-t border-white/5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1 mx-auto"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn('transition-transform duration-300', isExpanded ? 'rotate-180' : 'rotate-0')}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
