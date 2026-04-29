import { HTMLAttributes } from 'react'

export const IconWallet = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clip-path="url(#clip0_21594_1030447)">
        <path
          d="M15.124 4.03955C16.4088 4.03971 17.45 5.08191 17.4502 6.3667V8.69189H12.2158C11.2523 8.69194 10.471 9.47355 10.4707 10.437C10.4707 11.4007 11.2521 12.1821 12.2158 12.1821H17.4502V15.6733C17.4501 16.9582 16.4088 17.9993 15.124 17.9995H2.32715C1.04218 17.9995 8.38463e-05 16.9583 0 15.6733V6.3667C0.000146422 5.08181 1.04222 4.03955 2.32715 4.03955H15.124ZM12.2148 9.56592C12.6967 9.56592 13.0879 9.95613 13.0879 10.438C13.0879 10.9199 12.6967 11.311 12.2148 11.311C11.7331 11.3109 11.3428 10.9198 11.3428 10.438C11.3428 9.9562 11.7331 9.56604 12.2148 9.56592ZM10.0986 0.312988C11.2115 -0.32952 12.6348 0.0516946 13.2773 1.16455L14.2656 2.87646H5.65723L10.0986 0.312988Z"
          fill="url(#paint0_linear_21594_1030447)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_21594_1030447"
          x1="-2.27525e-07"
          y1="18.0001"
          x2="18.2687"
          y2="-0.44895"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#E843FE" />
          <stop offset="0.45684" stop-color="white" />
          <stop offset="0.61684" stop-color="white" />
          <stop offset="1" stop-color="#00FFCD" />
        </linearGradient>
        <clipPath id="clip0_21594_1030447">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
