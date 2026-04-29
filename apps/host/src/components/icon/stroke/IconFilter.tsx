import { HTMLAttributes } from 'react'

export const IconFilter = (props: HTMLAttributes<SVGElement>) => {
  const { className = 'text-[#D7D7D7]', ...rest } = props
  return (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M1 2.84088H8.8125H10.4697M16.625 2.84088H15.2045"
        stroke="#8F8B95"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M1 13.7311H8.8125H10.4697M16.625 13.7311H15.2045"
        stroke="#8F8B95"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M1 8.52271H2.6572M7.62879 8.52271H16.625" stroke="#8F8B95" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12.8371" cy="2.84091" r="2.21591" stroke="#8F8B95" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="5.26132" cy="8.52273" r="2.21591" stroke="#8F8B95" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="12.8371" cy="13.731" r="2.21591" stroke="#8F8B95" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}
