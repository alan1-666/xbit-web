import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

const IconArrowUpRight: React.FC<IconProps> = ({ size = 24, ...props }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M7 7H17V17" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20L16 8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default IconArrowUpRight
