import { HTMLAttributes } from 'react'

export const IconNext = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6 10L12 5L6 6.91406e-07L6 3.15789L-2.99078e-07 3.1579L-1.38036e-07 6.84211L6 6.84211L6 10Z"
        fill="url(#paint0_linear_21785_383597)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_21785_383597"
          x1="8.159"
          y1="7.38592"
          x2="-3.49044"
          y2="7.93244"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00F3AB" />
          <stop offset="0.8" stop-color="#9945FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}
