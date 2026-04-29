import { HTMLAttributes } from 'react'

export const IconResetStroke = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path 
        d="M16.5 6.5C15.2 4.3 12.8 2.7 10 2.7C6.3 2.7 3.2 5.4 2.8 8.9M3.5 13.5C4.8 15.7 7.2 17.3 10 17.3C13.7 17.3 16.8 14.6 17.2 11.1"
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path 
        d="M3.5 6.5V10.5H7.5M16.5 13.5V9.5H12.5"
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
