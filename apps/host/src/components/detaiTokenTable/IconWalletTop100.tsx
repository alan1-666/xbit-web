export interface IconWalletTop100Props {
  top: string
  className?: string
}

export const IconWalletTop100 = ({ top = '100', className }: IconWalletTop100Props) => {
  return (
    <svg
      id="Layer_2"
      data-name="Layer 2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 17.07 18.3"
      className={className}
    >
      <g id="Top100">
        <g>
          <g>
            <path
              fill="#2e88f6"
              d="M6.51,18.3c-1.75,0-3.41-.46-4.66-1.29C.65,16.21,0,15.12,0,13.94c0-1.18.66-2.26,1.85-3.05,2.57-1.72,6.75-1.72,9.31,0,.3.2.38.6.18.9-.2.3-.6.38-.9.18-2.13-1.43-5.73-1.43-7.87,0-.82.54-1.27,1.25-1.27,1.97,0,.73.45,1.44,1.27,1.99,1.04.69,2.44,1.07,3.94,1.07.36,0,.65.29.65.65s-.29.65-.65.65Z"
            />
            <path
              fill="#2e88f6"
              d="M6.51,8.91c-2.46,0-4.46-2-4.46-4.46S4.05,0,6.51,0s4.46,2,4.46,4.46-2,4.46-4.46,4.46ZM6.51,1.3c-1.74,0-3.16,1.42-3.16,3.16s1.42,3.16,3.16,3.16,3.16-1.42,3.16-3.16-1.42-3.16-3.16-3.16Z"
            />
          </g>
          <g>
            <text fill="#2e88f6" x="12" y="18" text-anchor="middle" font-size="7" fontWeight="medium">
              {top}
            </text>
          </g>
        </g>
      </g>
    </svg>
  )
}
