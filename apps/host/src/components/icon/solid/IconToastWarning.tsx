import { HTMLAttributes } from 'react'

export const IconToastWarning = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 22C14.7614 22 17.2614 20.8807 19.0711 19.0711C20.8807 17.2614 22 14.7614 22 12C22 9.2386 20.8807 6.7386 19.0711 4.92893C17.2614 3.11929 14.7614 2 12 2C9.2386 2 6.7386 3.11929 4.92893 4.92893C3.11929 6.7386 2 9.2386 2 12C2 14.7614 3.11929 17.2614 4.92893 19.0711C6.7386 20.8807 9.2386 22 12 22Z"
        fill="#FF6262"
        stroke="#FF6262"
        strokeWidth="1.33333"
        strokeLinejoin="round"
      />
      <path d="M12 6V13.5" stroke="#141414" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M11.999 16.4795C12.5973 16.4795 13.082 16.9642 13.082 17.5625C13.082 18.1608 12.5973 18.6455 11.999 18.6455C11.4007 18.6455 10.916 18.1608 10.916 17.5625C10.916 16.9642 11.4007 16.4795 11.999 16.4795Z"
        fill="#141414"
        stroke="#141414"
        strokeWidth="0.333333"
      />
    </svg>
  )
}
