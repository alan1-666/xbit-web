import { cn } from '@/lib/utils'
import { useState } from 'react'
interface BoxTitleProps {
  title: string
  value: string
  defaultExpand?: boolean
  onExpandChange?: (status: boolean) => void
}
const BoxTitle = ({ title, value, defaultExpand = true, onExpandChange }: BoxTitleProps) => {
  const [isExpand, setIsExpand] = useState<boolean>(defaultExpand)

  const handleArrowClick = (status: boolean) => {
    setIsExpand(status)
    if (onExpandChange) {
      onExpandChange(status)
    }
  }

  return (
    <div className="px-3.5 py-6 flex items-center justify-between text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))] text-[#FFFFFF]">
      <div className="pr-2">{title}</div>
      <div className="flex items-center">
        {value}
        <img
          className={cn('ml-2 cursor-pointer transition-all duration-200', isExpand ? 'rotate-0' : '-rotate-90')}
          src="/images/assets/arrow-down.svg"
          onClick={() => handleArrowClick(!isExpand)}
          alt="icon arrow down"
        />
      </div>
    </div>
  )
}
export default BoxTitle
