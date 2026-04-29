import { HTMLAttributes } from 'react'

export const IconSearch = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="7.54673" cy="7.54941" r="4.68276" stroke="currentColor" strokeWidth="1.22159" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5255 10.665L13.1091 12.2487C13.1886 12.3282 13.1886 12.4571 13.1091 12.5366L12.5333 13.1125C12.4538 13.192 12.3249 13.192 12.2453 13.1125L10.6617 11.5288L11.5255 10.665Z"
        fill="currentColor"
      />
    </svg>
  )
}
