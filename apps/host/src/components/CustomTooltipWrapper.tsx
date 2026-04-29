import { ReactNode } from 'react'
import { useTooltip } from '@components/discover/TooltipProvider.tsx'
import { isMobile } from 'react-device-detect'

export interface CustomTooltipWrapperProps {
  children: ReactNode
  content: () => ReactNode
}

export const CustomTooltipWrapper = ({ children, content }: CustomTooltipWrapperProps) => {
  const { showTooltip, hideTooltip } = useTooltip()
  if (isMobile) {
    return (
      <div
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          showTooltip(content(), event.currentTarget)
        }}
      >
        {children}
      </div>
    )
  }
  return (
    <div
      onClick={(event) => {
        event.stopPropagation()
        event.preventDefault()
      }}
      onMouseEnter={(event) => showTooltip(content(), event.currentTarget)}
      onMouseLeave={hideTooltip}
    >
      {children}
    </div>
  )
}
