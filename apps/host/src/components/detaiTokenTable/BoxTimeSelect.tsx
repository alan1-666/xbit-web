import { cn } from '@/lib/utils'

const BoxTimeSelect = ({
  isActive,
  type,
  value,
  handleClick,
}: {
  isActive?: boolean
  type: 'date' | 'time'
  value: string
  handleClick: () => void
}) => {
  return (
    <div
      className={cn(
        'w-full bg-[#2B2B33] rounded-[6px] h-[40px] flex items-center justify-between border border-transparent p-[10px] cursor-pointer transition-all',
        isActive && 'border-[#C8A7FD] bg-[#212127]',
      )}
      onClick={handleClick}
    >
      <div className="text-sm font-[330] text-white">{value}</div>
      {type === 'date' && <img src="/images/calendar.svg" alt="" />}
      {type === 'time' && <img src="/images/icons/clock.svg" alt="" />}
    </div>
  )
}

export default BoxTimeSelect

// beSqUU-1