import { memo } from 'react'

interface EmptyStateProps {
  className?: string
}

export const EmptyState = memo<EmptyStateProps>(({ className }) => {
  return (
    <div className={className}>
      <img src="/images/icons/icon-earnings.svg" alt="No earnings" className="h-6 w-6 opacity-50" />
      <span className="mt-2 text-sm text-[#908E98]">No earnings</span>
    </div>
  )
})

EmptyState.displayName = 'EmptyState'
