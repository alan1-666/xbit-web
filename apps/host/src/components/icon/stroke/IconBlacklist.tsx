import { HTMLAttributes } from 'react'

export const IconBlacklist = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M11.2133 1.33325H4.78659C3.36659 1.33325 2.21326 2.49325 2.21326 3.90659V13.2999C2.21326 14.4999 3.07326 15.0066 4.12659 14.4266L7.37992 12.6199C7.72659 12.4266 8.28659 12.4266 8.62659 12.6199L11.8799 14.4266C12.9333 15.0133 13.7933 14.5066 13.7933 13.2999V3.90659C13.7866 2.49325 12.6333 1.33325 11.2133 1.33325Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.2185 9.5754L5.97583 5.33276"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.97583 5.33276L5.73319 9.5754"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
