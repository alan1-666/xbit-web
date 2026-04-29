import { MouseEvent } from 'react'

export interface OutcomeProps {
  label: string
  line?: string
  value: string
  color?: string
  onClick?: () => void
}

export const Outcome = (props: OutcomeProps) => {
  const { label, value, color, line, onClick } = props
  const handleOnClick = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    onClick?.()
  }
  return (
    <div
      className="h-10 group before:absolute before:inset-x-0 before:bottom-0 rounded-[6px] relative cursor-pointer min-w-[150px] w-fit"
      style={{ backgroundColor: color || 'inherit' }}
      onClick={handleOnClick}
    >
      <div
        className="h-10 min-w-[150px] w-fit px-4 flex items-center justify-between z-[2] rounded-[6px] shadow-lg transition-transform -translate-y-1 group-hover:-translate-y-0.5"
        style={{ backgroundColor: color || 'inherit' }}
      >
        <span className="mr-1">
          {label} {line && <span className="text-[calc(12rem/16)]">{line}</span>}
        </span>{' '}
        {value}
      </div>
    </div>
  )
}
