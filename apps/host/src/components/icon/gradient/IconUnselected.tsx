import { HTMLAttributes } from 'react'

export const IconUnselected = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <mask id="mask0_24075_1711287" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="10">
        <rect width="16" height="10" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_24075_1711287)">
        <path
          d="M13.0078 0C14.6645 0.000230276 16.0078 1.34329 16.0078 3V8.85547C16.0078 9.26137 15.9254 9.64787 15.7793 10.001C15.0747 8.86023 13.8133 8.09961 12.374 8.09961H9.20703C7.75426 8.09958 6.41538 7.31201 5.70996 6.04199L3.49707 2.05762C2.79162 0.78769 1.45273 0 0 0H13.0078Z"
          fill="#878787"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.68848 3.65768L10.3227 5.60655L12.9375 2.08008"
          fill="#878787"
        />
        <path d="M8.68848 3.65768L10.3227 5.60655L12.9375 2.08008" stroke="white" strokeOpacity="0.5" />
      </g>
    </svg>
  )
}
