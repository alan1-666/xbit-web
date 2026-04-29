import { ReactNode } from 'react'
import { IconLargeChevronLeft } from '@components/icon'
import { cn } from '@/lib/utils'

export interface HeaderBackTransparentProps {
  title: string | ReactNode
  onBack?: () => void
  right?: ReactNode
  className?: string
}

export default function HeaderBackTransparent(props: HeaderBackTransparentProps) {
  const { title, onBack, right, className } = props
  return (
    <div className={cn('flex items-center justify-between px-3 py-2.5  w-full', className)}>
      <div className="flex items-center">
        <button onClick={onBack}>
          <IconLargeChevronLeft className="text-white" />
        </button>
      </div>
      <div className="text-[17px] font-semibold">{title}</div>
      <div className="flex items-center">{right}</div>
    </div>
  )
}
