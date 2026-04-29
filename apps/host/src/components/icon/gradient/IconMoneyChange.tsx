import { HTMLAttributes } from 'react'

export interface IconMoneyChangeProps extends HTMLAttributes<SVGElement> {
  gradient?: boolean
}

export const IconMoneyChange = (props: IconMoneyChangeProps) => {
  const { gradient, ...rest } = props
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M1.99976 6.56055V5.56055C1.99976 3.81055 2.99976 3.06055 4.49976 3.06055H9.49976C10.9998 3.06055 11.9998 3.81055 11.9998 5.56055V8.56055C11.9998 10.3105 10.9998 11.0605 9.49976 11.0605H6.99976"
        stroke={gradient ? 'url(#paint0_linear_24139_217658)' : 'currentColor'}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.14258 7.89441C6.14258 8.35631 6.49973 8.72774 6.93782 8.72774H7.83305C8.214 8.72774 8.52353 8.40393 8.52353 7.99917C8.52353 7.56584 8.33306 7.4087 8.05211 7.3087L6.61877 6.80869C6.33782 6.70869 6.14734 6.55631 6.14734 6.11822C6.14734 5.71822 6.45686 5.38965 6.83781 5.38965H7.73305C8.17115 5.38965 8.5283 5.76108 8.5283 6.22298"
        stroke={gradient ? 'url(#paint1_linear_24139_217658)' : 'currentColor'}
        strokeWidth="0.714286"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.33325 4.91797V9.20368"
        stroke={gradient ? 'url(#paint2_linear_24139_217658)' : 'currentColor'}
        strokeWidth="0.714286"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 8.52734H4.67001C4.99001 8.52734 5.25 8.78733 5.25 9.10733V9.74734"
        stroke={gradient ? 'url(#paint3_linear_24139_217658)' : 'currentColor'}
        strokeWidth="0.75"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.60999 7.91797L2 8.52795L2.60999 9.13794"
        stroke={gradient ? 'url(#paint4_linear_24139_217658)' : 'currentColor'}
        strokeWidth="0.75"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.25 11.1682H2.57999C2.25999 11.1682 2 10.9082 2 10.5882V9.94824"
        stroke={gradient ? 'url(#paint5_linear_24139_217658)' : 'currentColor'}
        strokeWidth="0.75"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.64038 11.7776L5.25037 11.1676L4.64038 10.5576"
        stroke={gradient ? 'url(#paint6_linear_24139_217658)' : 'currentColor'}
        strokeWidth="0.75"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_24139_217658"
          x1="6.99976"
          y1="3.06055"
          x2="6.99976"
          y2="11.0605"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFB4" />
          <stop offset="1" stopColor="#00FFF6" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_24139_217658"
          x1="7.33544"
          y1="5.38965"
          x2="7.33544"
          y2="8.72774"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFB4" />
          <stop offset="1" stopColor="#00FFF6" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_24139_217658"
          x1="7.83325"
          y1="4.91797"
          x2="7.83325"
          y2="9.20368"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFB4" />
          <stop offset="1" stopColor="#00FFF6" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_24139_217658"
          x1="3.625"
          y1="8.52734"
          x2="3.625"
          y2="9.74734"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFB4" />
          <stop offset="1" stopColor="#00FFF6" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_24139_217658"
          x1="2.30499"
          y1="7.91797"
          x2="2.30499"
          y2="9.13794"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFB4" />
          <stop offset="1" stopColor="#00FFF6" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_24139_217658"
          x1="3.625"
          y1="9.94824"
          x2="3.625"
          y2="11.1682"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFB4" />
          <stop offset="1" stopColor="#00FFF6" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_24139_217658"
          x1="4.94537"
          y1="10.5576"
          x2="4.94537"
          y2="11.7776"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFB4" />
          <stop offset="1" stopColor="#00FFF6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
