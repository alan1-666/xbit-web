import { HTMLAttributes } from 'react'

export const IconLayout = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="3.5" y="2.5" width="11" height="11" rx="0.5" stroke="#B9B9B9" />
      <rect x="3.5" y="2.5" width="11" height="3" rx="0.5" stroke="#B9B9B9" />
    </svg>
  )
}
