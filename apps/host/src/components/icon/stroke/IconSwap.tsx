import { HTMLAttributes } from 'react'

export const IconSwap = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13.4515 6L15.7432 8.29167M15.7432 8.29167L13.4515 10.5833M15.7432 8.29167H8.86816"
        stroke="currentColor"
        strokeWidth="1.14583"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.95841 14.0208L4.66675 11.7291M4.66675 11.7291L6.95841 9.43748M4.66675 11.7291H11.5417"
        stroke="currentColor"
        strokeWidth="1.14583"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10.139" cy="9.99998" r="8.59375" stroke="currentColor" strokeWidth="1.14583" />
    </svg>
  )
}
