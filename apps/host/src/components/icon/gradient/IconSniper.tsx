import { HTMLAttributes } from 'react'

export interface IconSniperProps extends HTMLAttributes<SVGElement> {
  gradient?: boolean
}

export const IconSniper = (props: IconSniperProps) => {
  const { gradient, ...rest } = props
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <mask id="mask0_24139_217643" maskUnits="userSpaceOnUse" x="0" y="0" width="14" height="14">
        <path d="M14 0H0V14H14V0Z" fill="white" />
      </mask>
      <g mask="url(#mask0_24139_217643)">
        <path
          d="M6.41683 2.9577C4.62851 3.2135 3.21398 4.62803 2.95818 6.41635H4.0835V7.58301H2.95818C3.21398 9.37134 4.62851 10.7859 6.41683 11.0417V9.91634H7.5835V11.0417C9.37182 10.7859 10.7863 9.37134 11.0421 7.58301H9.91683V6.41635H11.0421C10.7863 4.62803 9.37182 3.2135 7.5835 2.9577V4.08301H6.41683V2.9577ZM1.78221 6.41635C2.05121 3.9829 3.98338 2.05073 6.41683 1.78172V0.583008H7.5835V1.78172C10.0169 2.05073 11.9491 3.9829 12.2181 6.41635H13.4168V7.58301H12.2181C11.9491 10.0165 10.0169 11.9487 7.5835 12.2177V13.4164H6.41683V12.2177C3.98338 11.9487 2.05121 10.0165 1.78221 7.58301H0.583496V6.41635H1.78221ZM8.16683 6.99968C8.16683 7.64403 7.64451 8.16635 7.00016 8.16635C6.35581 8.16635 5.8335 7.64403 5.8335 6.99968C5.8335 6.35533 6.35581 5.83301 7.00016 5.83301C7.64451 5.83301 8.16683 6.35533 8.16683 6.99968Z"
          fill={gradient ? 'url(#paint0_linear_24139_217643)' : 'currentColor'}
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_24139_217643"
          x1="7.00015"
          y1="0.583008"
          x2="7.00015"
          y2="13.4164"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFB4" />
          <stop offset="1" stopColor="#00FFF6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
