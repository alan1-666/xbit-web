import { HTMLAttributes } from 'react'

export const IconSelected = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="25" height="14" viewBox="0 0 25 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M17.6191 0.000488281C21.5503 0.000669994 24.7372 3.18749 24.7373 7.11865V14.0015C23.9279 12.5421 22.372 11.5543 20.585 11.5542H13.832C11.3884 11.554 9.11528 10.3007 7.81152 8.23389L4.01465 2.21436C3.14542 0.836416 1.63017 0.000488281 0.000976562 0.000488281H17.6191Z"
        fill="var(--impartal)"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12.8855 5.21711L15.533 7.99702L19.7689 2.9668"
        fill="var(--impartal)"
      />
      <path
        d="M12.8855 5.21711L15.533 7.99702L19.7689 2.9668"
        stroke="white"
        style={{ stroke: 'white', strokeOpacity: 1 }}
        stroke-width="1.58186"
      />
    </svg>
  )
}
