import { HTMLAttributes } from 'react'

export const IconSortUp = ({ currentColor = '#E2E8F0', ...rest }: { currentColor?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="8px"
      height="8px"
      fill={currentColor}
      className="icon"
      viewBox="0 0 7 7"
      {...rest}
    >
      <path d="M3.199 2.344a.4.4 0 01.602 0L6.42 5.337A.4.4 0 016.118 6H.882a.4.4 0 01-.302-.663L3.2 2.344z"></path>
    </svg>
  )
}

export const IconSortDown = ({ currentColor = '#E2E8F0', ...rest }: { currentColor?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="8px"
      height="8px"
      fill={currentColor}
      className=""
      viewBox="0 0 7 7"
      {...rest}
    >
      <path d="M3.801 4.656a.4.4 0 01-.602 0L.58 1.663A.4.4 0 01.882 1h5.236a.4.4 0 01.302.663L3.8 4.656z"></path>
    </svg>
  )
}

export const IconSortUp1 = ({ currentColor = '#E2E8F0', ...rest }: { currentColor?: string }) => {
  return (
    <svg width="14" height="15" viewBox="0 0 14 15" fill={currentColor} xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path d="M10.5411 6.51984C10.4303 6.51984 10.3195 6.47901 10.232 6.39151L7.00031 3.15984L3.76865 6.39151C3.59948 6.56068 3.31948 6.56068 3.15031 6.39151C2.98115 6.22234 2.98115 5.94234 3.15031 5.77318L6.69115 2.23234C6.86031 2.06318 7.14031 2.06318 7.30948 2.23234L10.8503 5.77318C11.0195 5.94234 11.0195 6.22234 10.8503 6.39151C10.7686 6.47901 10.652 6.51984 10.5411 6.51984Z" />
      <path d="M7 12.8956C6.76083 12.8956 6.5625 12.6973 6.5625 12.4581V2.64062C6.5625 2.40146 6.76083 2.20312 7 2.20312C7.23917 2.20312 7.4375 2.40146 7.4375 2.64062V12.4581C7.4375 12.6973 7.23917 12.8956 7 12.8956Z" />
    </svg>
  )
}

export const IconSortDown1 = ({ currentColor = '#E2E8F0', ...rest }: { currentColor?: string }) => {
  return (
    <svg width="14" height="15" viewBox="0 0 14 15" fill={currentColor} xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path d="M10.5411 8.48016C10.4303 8.48016 10.3195 8.52099 10.232 8.60849L7.00031 11.8402L3.76865 8.60849C3.59948 8.43932 3.31948 8.43932 3.15031 8.60849C2.98115 8.77766 2.98115 9.05766 3.15031 9.22682L6.69115 12.7677C6.86031 12.9368 7.14031 12.9368 7.30948 12.7677L10.8503 9.22682C11.0195 9.05766 11.0195 8.77766 10.8503 8.60849C10.7686 8.52099 10.652 8.48016 10.5411 8.48016Z" />
      <path d="M7 2.10438C6.76083 2.10438 6.5625 2.30271 6.5625 2.54188V12.3594C6.5625 12.5985 6.76083 12.7969 7 12.7969C7.23917 12.7969 7.4375 12.5985 7.4375 12.3594V2.54188C7.4375 2.30271 7.23917 2.10438 7 2.10438Z" />
    </svg>
  )
}

export const IconTelegram = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 12 12">
      <g clipPath="url(#clip0_7920_515)">
        <path d="M11.894 1.91l-1.8 8.487c-.134.6-.49.746-.992.465L6.36 8.842l-1.322 1.273c-.147.147-.27.27-.551.27l.196-2.793L9.764 3c.22-.196-.05-.307-.344-.11L3.138 6.844.43 6c-.588-.183-.6-.588.122-.869l10.582-4.078c.49-.183.918.11.76.857z"></path>
      </g>
      <defs>
        <clipPath id="clip0_7920_515">
          <rect width="12" height="12"></rect>
        </clipPath>
      </defs>
    </svg>
  )
}

export const IconTelegramLogin = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 20 20">
      <g clipPath="url(#clip0_6766_653)">
        <path d="M17.784 10a7.784 7.784 0 11-15.568 0 7.784 7.784 0 0115.568 0z" fill="#fff"></path>
        <path
          d="M13.27 14.587l1.64-7.734c.146-.68-.245-.949-.691-.782L4.576 9.788c-.659.256-.647.625-.112.792l2.467.77 5.725-3.605c.268-.179.514-.078.313.1l-4.631 4.186-.179 2.545c.257 0 .369-.112.502-.246l1.205-1.16 2.5 1.84c.458.257.782.124.905-.424l-.001.001zM20 10c0 5.524-4.476 10-10 10S0 15.524 0 10 4.476 0 10 0s10 4.476 10 10z"
          fill="#57A6DE"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_6766_653">
          <rect width="20" height="20" fill="#fff"></rect>
        </clipPath>
      </defs>
    </svg>
  )
}

export const IconX = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M2.08594 2.0835L7.91888 7.91644" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.08503 7.91644L7.91797 2.0835" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const IconWave = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="66" height="42" viewBox="0 0 66 42" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g filter="url(#filter0_dd_24075_1711939)">
        <path
          d="M8 12.0792C8 12.0792 9.152 12.2084 9.87166 12.0792C11.6404 11.7616 11.8317 9.59642 13.615 9.37696C17.0103 8.95911 14.7719 17.4143 18.1604 16.9432C21.2034 16.5202 19.2058 5.23884 22.9733 5.05337C25.9139 4.9086 23.4359 21.2703 28.0535 20.9966C30.7881 20.8345 28.0535 1 32.8663 1C36.3422 1 33.9358 20.9966 37.6791 20.9966C41.4225 20.9966 39.9397 6.11915 42.2246 5.05337C45.7005 3.43202 43.2941 17.6908 47.3048 16.4028C50.2586 15.4542 48.503 9.99762 51.5829 9.64718C53.8108 9.39368 53.7617 12.1465 55.9947 12.3494C56.5146 12.3967 58 12.3494 58 12.3494"
          stroke="#A162F7"
          style={{ stroke: '#A162F7', strokeOpacity: 1 }}
          strokeWidth="2"
          strokeLinecap="round"
          className="wave-path"
        />
      </g>
      <defs>
        <filter
          id="filter0_dd_24075_1711939"
          x="0.373106"
          y="0"
          width="65.2538"
          height="41.2342"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="5.4223" />
          <feGaussianBlur stdDeviation="1.42509" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.411765 0 0 0 0 0 0 0 0 0 1 0 0 0 0.3 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_24075_1711939" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="12.6073" />
          <feGaussianBlur stdDeviation="3.31345" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.411765 0 0 0 0 0 0 0 0 0 1 0 0 0 0.4 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_24075_1711939" result="effect2_dropShadow_24075_1711939" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_24075_1711939" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}

export const IconSpinner = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
      <path
        fill="currentColor"
        d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"
      />
    </svg>
  )
}

export const IconEmpty = () => {
  return <img className="size-18" alt="" src="/images/icons/ic-empty.png" />
}

export const IconEmptyV3 = () => {
  return <img className="size-18" alt="" src="/images/icons/ic-empty.png" />
}

export const NewArrowLeftIcon = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10.25 5L3.25 11.8772L10.25 19" strokeWidth={2} />
    </svg>
  )
}
export const IconChevronLeft = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13.0606 5.28232C13.2559 5.47759 13.2559 5.79419 13.0606 5.98945L7.40382 11.6456C7.20855 11.8409 7.20853 12.1574 7.40379 12.3527L13.0607 18.0103C13.2559 18.2055 13.2559 18.5221 13.0607 18.7173L12.3536 19.4245C12.1583 19.6197 11.8417 19.6197 11.6464 19.4245L4.92893 12.707C4.53841 12.3164 4.53841 11.6833 4.92893 11.2927L11.6464 4.57523C11.8417 4.37997 12.1583 4.37997 12.3536 4.57523L13.0606 5.28232Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconDoubleArrow = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="29"
      height="14"
      viewBox="0 0 29 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5 7L2 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 6.70703L27.7071 7.41414L28.4142 6.70703L27.7071 5.99993L27 6.70703ZM8.99999 5.70703C8.44771 5.70703 8 6.15475 8 6.70703C8 7.25932 8.44771 7.70703 8.99999 7.70703L8.99999 6.70703L8.99999 5.70703ZM21 12.707L21.7071 13.4141L27.7071 7.41414L27 6.70703L26.2929 5.99993L20.2929 11.9999L21 12.707ZM27 6.70703L27.7071 5.99993L21.7071 -7.38956e-05L21 0.707033L20.2929 1.41414L26.2929 7.41414L27 6.70703ZM27 6.70703L27 5.70703L8.99999 5.70703L8.99999 6.70703L8.99999 7.70703L27 7.70703L27 6.70703Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconLargeChevronLeft = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M13.0606 5.28232C13.2559 5.47759 13.2559 5.79419 13.0606 5.98945L7.40382 11.6456C7.20855 11.8409 7.20853 12.1574 7.40379 12.3527L13.0607 18.0103C13.2559 18.2055 13.2559 18.5221 13.0607 18.7173L12.3536 19.4245C12.1583 19.6197 11.8417 19.6197 11.6464 19.4245L4.92893 12.707C4.53841 12.3164 4.53841 11.6833 4.92893 11.2927L11.6464 4.57523C11.8417 4.37997 12.1583 4.37997 12.3536 4.57523L13.0606 5.28232Z"
        fill="white"
      />
    </svg>
  )
}

export const IconTrash = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 5.97998C17.67 5.64998 14.32 5.47998 10.98 5.47998C9 5.47998 7.02 5.57998 5.04 5.77998L3 5.97998"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.8504 9.14014L18.2004 19.2101C18.0904 20.7801 18.0004 22.0001 15.2104 22.0001H8.79039C6.00039 22.0001 5.91039 20.7801 5.80039 19.2101L5.15039 9.14014"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.3301 16.5H13.6601"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.5 12.5H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const IconPauseCircle = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_18131_91274)">
        <path d="M2.21875 3.85425H9.76431V3.86023H2.21875V3.85425Z" fill="currentColor" />
        <path
          d="M4.54384 9C4.23828 9 3.98828 8.75 3.98828 8.44444V4.55556C3.98828 4.25 4.23828 4 4.54384 4C4.84939 4 5.09939 4.25 5.09939 4.55556V8.44444C5.09939 8.75 4.85634 9 4.54384 9ZM7.32161 9C7.01606 9 6.76606 8.75 6.76606 8.44444V4.55556C6.76606 4.25 7.01606 4 7.32161 4C7.62717 4 7.87717 4.25 7.87717 4.55556V8.44444C7.87717 8.75 7.63411 9 7.32161 9Z"
          fill="currentColor"
        />
        <circle cx="6" cy="6.5" r="5.6" stroke="currentColor" strokeWidth="0.8" />
      </g>
      <defs>
        <clipPath id="clip0_18131_91274">
          <rect width="12" height="12" fill="white" transform="translate(0 0.5)" />
        </clipPath>
      </defs>
    </svg>
  )
}

export const IconPlayCircle = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_18131_91739)">
        <path d="M2.21875 3.85425H9.76431V3.86023H2.21875V3.85425Z" fill="#9B9B9B" />
        <path
          d="M4.87425 4C4.94963 3.99976 5.02334 4.02223 5.08575 4.0645L7.83225 5.932C7.88283 5.96639 7.92423 6.01262 7.95285 6.06668C7.98146 6.12073 7.99642 6.18096 7.99642 6.24213C7.99642 6.30329 7.98146 6.36352 7.95285 6.41758C7.92423 6.47163 7.88283 6.51787 7.83225 6.55225L5.08575 8.419C5.02935 8.45732 4.96358 8.47954 4.8955 8.48326C4.82742 8.48699 4.75961 8.47209 4.69937 8.44015C4.63912 8.40822 4.58873 8.36047 4.5536 8.30203C4.51847 8.24359 4.49994 8.17668 4.5 8.1085V4.375C4.5 4.27555 4.53951 4.18016 4.60984 4.10984C4.68016 4.03951 4.77479 4 4.87425 4Z"
          fill="#9B9B9B"
        />
        <circle cx="6" cy="6.5" r="5.6" stroke="#9B9B9B" strokeWidth="0.8" />
      </g>
      <defs>
        <clipPath id="clip0_18131_91739">
          <rect width="12" height="12" fill="white" transform="translate(0 0.5)" />
        </clipPath>
      </defs>
    </svg>
  )
}

export const IconEdit = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3.5698 10.26C3.2648 10.26 2.9798 10.155 2.7748 9.96002C2.5148 9.71502 2.3898 9.34502 2.4348 8.94502L2.6198 7.32502C2.6548 7.02002 2.8398 6.61502 3.0548 6.39502L7.1598 2.05002C8.1848 0.965024 9.2548 0.935025 10.3398 1.96002C11.4248 2.98502 11.4548 4.05502 10.4298 5.14002L6.3248 9.48502C6.1148 9.71002 5.7248 9.92003 5.4198 9.97003L3.8098 10.245C3.7248 10.25 3.6498 10.26 3.5698 10.26ZM8.7648 1.95502C8.3798 1.95502 8.0448 2.19502 7.7048 2.55502L3.5998 6.90503C3.4998 7.01003 3.3848 7.26003 3.3648 7.40503L3.1798 9.02502C3.1598 9.19002 3.1998 9.32502 3.2898 9.41002C3.3798 9.49502 3.5148 9.52502 3.6798 9.50002L5.2898 9.22503C5.4348 9.20003 5.6748 9.07002 5.7748 8.96502L9.8798 4.62002C10.4998 3.96002 10.7248 3.35002 9.8198 2.50002C9.4198 2.11502 9.0748 1.95502 8.7648 1.95502Z"
        fill="currentColor"
      />
      <path
        d="M9.46905 5.97492C9.45905 5.97492 9.44405 5.97492 9.43405 5.97492C7.87405 5.81992 6.61905 4.63492 6.37905 3.08492C6.34905 2.87992 6.48905 2.68992 6.69405 2.65492C6.89905 2.62492 7.08905 2.76492 7.12405 2.96992C7.31405 4.17992 8.29405 5.10992 9.51405 5.22992C9.71905 5.24992 9.86905 5.43492 9.84905 5.63992C9.82405 5.82992 9.65905 5.97492 9.46905 5.97492Z"
        fill="currentColor"
      />
      <path
        d="M11.2988 11.875H2.29883C2.09383 11.875 1.92383 11.705 1.92383 11.5C1.92383 11.295 2.09383 11.125 2.29883 11.125H11.2988C11.5038 11.125 11.6738 11.295 11.6738 11.5C11.6738 11.705 11.5038 11.875 11.2988 11.875Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconEdit2 = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6.48932 1.80688H5.45233C2.85986 1.80688 1.82288 2.84387 1.82288 5.43634V8.5473C1.82288 11.1398 2.85986 12.1768 5.45233 12.1768H8.56329C11.1558 12.1768 12.1927 11.1398 12.1927 8.5473V7.51031"
        stroke="currentColor"
        strokeWidth="0.875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.10284 2.33613L5.01711 6.42185C4.86156 6.5774 4.70602 6.88331 4.67491 7.10627L4.45195 8.66693C4.369 9.23209 4.76824 9.62615 5.33339 9.54837L6.89406 9.32542C7.11183 9.29431 7.41774 9.13876 7.57847 8.98321L11.6642 4.89748C12.3694 4.19233 12.7012 3.37311 11.6642 2.33613C10.6272 1.29914 9.80799 1.63097 9.10284 2.33613Z"
        stroke="currentColor"
        strokeWidth="0.875"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.51697 2.92114C8.86436 4.16034 9.83394 5.12993 11.0783 5.4825"
        stroke="currentColor"
        strokeWidth="0.875"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconArrange = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5.99967 8.66732C6.36786 8.66732 6.66634 8.36884 6.66634 8.00065C6.66634 7.63246 6.36786 7.33398 5.99967 7.33398C5.63148 7.33398 5.33301 7.63246 5.33301 8.00065C5.33301 8.36884 5.63148 8.66732 5.99967 8.66732Z"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.99967 3.99935C6.36786 3.99935 6.66634 3.70087 6.66634 3.33268C6.66634 2.96449 6.36786 2.66602 5.99967 2.66602C5.63148 2.66602 5.33301 2.96449 5.33301 3.33268C5.33301 3.70087 5.63148 3.99935 5.99967 3.99935Z"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.99967 13.3333C6.36786 13.3333 6.66634 13.0349 6.66634 12.6667C6.66634 12.2985 6.36786 12 5.99967 12C5.63148 12 5.33301 12.2985 5.33301 12.6667C5.33301 13.0349 5.63148 13.3333 5.99967 13.3333Z"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.99967 8.66732C10.3679 8.66732 10.6663 8.36884 10.6663 8.00065C10.6663 7.63246 10.3679 7.33398 9.99967 7.33398C9.63148 7.33398 9.33301 7.63246 9.33301 8.00065C9.33301 8.36884 9.63148 8.66732 9.99967 8.66732Z"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.99967 3.99935C10.3679 3.99935 10.6663 3.70087 10.6663 3.33268C10.6663 2.96449 10.3679 2.66602 9.99967 2.66602C9.63148 2.66602 9.33301 2.96449 9.33301 3.33268C9.33301 3.70087 9.63148 3.99935 9.99967 3.99935Z"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.99967 13.3333C10.3679 13.3333 10.6663 13.0349 10.6663 12.6667C10.6663 12.2985 10.3679 12 9.99967 12C9.63148 12 9.33301 12.2985 9.33301 12.6667C9.33301 13.0349 9.63148 13.3333 9.99967 13.3333Z"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconSolScan = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3.53668 9.10585C3.56782 9.0749 3.60477 9.05041 3.6454 9.03377C3.68603 9.01713 3.72954 9.00867 3.77344 9.00888H11.9189C12.0684 9.00888 12.1427 9.18827 12.0377 9.29332L10.428 10.9022C10.3654 10.9648 10.2805 11 10.192 11H2.04658C2.01334 11.0004 1.98073 10.9909 1.95295 10.9726C1.92518 10.9544 1.9035 10.9282 1.89072 10.8975C1.87794 10.8668 1.87464 10.833 1.88125 10.8005C1.88786 10.7679 1.90407 10.738 1.92779 10.7147L3.53668 9.10585ZM3.53668 3.09778C3.60004 3.03587 3.68486 3.00084 3.77344 3H11.9189C12.0684 3 12.1427 3.17939 12.0377 3.28525L10.428 4.89414C10.3653 4.95643 10.2804 4.99131 10.192 4.99111H2.04658C2.01351 4.99138 1.9811 4.98179 1.9535 4.96357C1.9259 4.94535 1.90436 4.91932 1.89161 4.8888C1.87887 4.85828 1.8755 4.82466 1.88195 4.79222C1.88839 4.75978 1.90435 4.72999 1.92779 4.70666L3.53668 3.09778ZM10.428 6.08282C10.3654 6.02023 10.2805 5.98506 10.192 5.98504H2.04658C2.01351 5.98478 1.9811 5.99436 1.9535 6.01258C1.9259 6.03081 1.90436 6.05684 1.89161 6.08736C1.87887 6.11787 1.8755 6.1515 1.88195 6.18394C1.88839 6.21637 1.90435 6.24616 1.92779 6.26949L3.53668 7.87918C3.5989 7.9406 3.68294 7.97615 3.77344 7.97615H11.9189C11.952 7.97642 11.9844 7.96683 12.012 7.94861C12.0396 7.93039 12.0611 7.90436 12.0738 7.87384C12.0866 7.84332 12.09 7.8097 12.0835 7.77726C12.0771 7.74482 12.0611 7.71504 12.0377 7.69171L10.428 6.08282Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconBscScan = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clip-path="url(#clip0_10105_584)">
        <path
          d="M5.49596 10.0001L5.50317 12.6443L7.74997 13.9665V15.5145L4.18827 13.4256V9.22687L5.49596 10.0001ZM5.49596 7.35588V8.89674L4.18747 8.1227V6.58184L5.49596 5.8078L6.81087 6.58184L5.49596 7.35588ZM8.68827 6.58184L9.99676 5.8078L11.3117 6.58184L9.99676 7.35588L8.68827 6.58184Z"
          fill="currentColor"
        />
        <path
          d="M6.4415 12.0963V10.5482L7.74999 11.3222V12.8631L6.4415 12.0963ZM8.68829 14.5209L9.99679 15.295L11.3117 14.5209V16.0618L9.99679 16.8358L8.68829 16.0618V14.5209ZM13.1883 6.58184L14.4968 5.8078L15.8117 6.58184V8.1227L14.4968 8.89674V7.35588L13.1883 6.58184ZM14.4968 12.6443L14.504 10.0001L15.8125 9.22607V13.4248L12.2508 15.5137V13.9657L14.4968 12.6443Z"
          fill="currentColor"
        />
        <path d="M13.5586 12.0962L12.2501 12.863V11.3221L13.5586 10.5481V12.0962Z" fill="currentColor" />
        <path
          d="M13.5585 7.90395L13.5657 9.45203L11.3125 10.7741V13.4248L10.004 14.1916L8.6955 13.4248V10.7741L6.4423 9.45203V7.90395L7.7564 7.12991L9.99599 8.45844L12.2492 7.12991L13.5641 7.90395H13.5585ZM6.4415 5.26052L9.99679 3.16437L13.5585 5.26052L12.25 6.03456L9.99679 4.70603L7.74999 6.03456L6.4415 5.26052Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_10105_584">
          <rect width="20" height="20" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  )
}

export const IconMonScan = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="182" height="184" viewBox="0 0 182 184" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M90.5358 0C64.3911 0 0 65.2598 0 91.7593C0 118.259 64.3911 183.52 90.5358 183.52C116.681 183.52 181.073 118.258 181.073 91.7593C181.073 65.2609 116.682 0 90.5358 0ZM76.4273 144.23C65.4024 141.185 35.7608 88.634 38.7655 77.4599C41.7703 66.2854 93.62 36.2439 104.645 39.2892C115.67 42.3341 145.312 94.8846 142.307 106.059C139.302 117.234 87.4522 147.276 76.4273 144.23Z" fill="currentColor"/>
    </svg>
  )
}

export const IconChevronRight = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5.25391 9.96004L8.51391 6.70004C8.89891 6.31504 8.89891 5.68504 8.51391 5.30004L5.25391 2.04004"
        stroke="currentColor"
        strokeWidth="0.857143"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconTimer = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6.99935 13.2709C3.54018 13.2709 0.728516 10.4592 0.728516 7.00008C0.728516 3.54092 3.54018 0.729248 6.99935 0.729248C10.4585 0.729248 13.2702 3.54092 13.2702 7.00008C13.2702 10.4592 10.4585 13.2709 6.99935 13.2709ZM6.99935 1.60425C4.02435 1.60425 1.60352 4.02508 1.60352 7.00008C1.60352 9.97508 4.02435 12.3959 6.99935 12.3959C9.97435 12.3959 12.3952 9.97508 12.3952 7.00008C12.3952 4.02508 9.97435 1.60425 6.99935 1.60425Z"
        fill="currentColor"
      />
      <path
        d="M9.16518 9.29228C9.08935 9.29228 9.01352 9.27478 8.94352 9.22812L7.13518 8.14895C6.68602 7.88062 6.35352 7.29145 6.35352 6.77228V4.38062C6.35352 4.14145 6.55185 3.94312 6.79102 3.94312C7.03018 3.94312 7.22852 4.14145 7.22852 4.38062V6.77228C7.22852 6.98228 7.40352 7.29145 7.58435 7.39645L9.39268 8.47562C9.60268 8.59812 9.66685 8.86645 9.54435 9.07645C9.45685 9.21645 9.31102 9.29228 9.16518 9.29228Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconFilter = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10.9456 1.99951H2.05469V3.70007L5.38186 7.15663V11.9995L7.63694 10.6502V7.15663L10.9456 3.70007V1.99951Z"
        stroke="currentColor"
        strokeWidth="0.808268"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconFiltered = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="white" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10.9456 1.99951H2.05469V3.70007L5.38186 7.15663V11.9995L7.63694 10.6502V7.15663L10.9456 3.70007V1.99951Z"
        stroke="currentColor"
        strokeWidth="0.808268"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconCheckCircleSolid = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="9" cy="9" r="9" fill="#6A2AE0" />
      <path
        d="M12.963 5.65395L13.6551 6.3758C13.8462 6.57514 13.8395 6.89165 13.6402 7.08275L7.81701 12.6655C7.62136 12.8531 7.31187 12.8506 7.11924 12.6599L4.14825 9.71898C3.952 9.52472 3.95039 9.20814 4.14465 9.01189L4.84816 8.30119C5.02745 8.12001 5.31099 8.1047 5.50791 8.25622L5.55523 8.29762L7.31402 10.0389C7.41033 10.1342 7.56507 10.1355 7.66291 10.0417L12.256 5.63902C12.4554 5.44798 12.7719 5.45466 12.963 5.65395Z"
        fill="white"
        style={{ fill: 'white', fillOpacity: 1 }}
      />
    </svg>
  )
}

export const IconCheckCircleSolidWithoutGradient = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="10" cy="10.5" r="9" fill="#00FFB4" />
      <path
        d="M14.3495 6.82095L15.1075 7.61153C15.3168 7.82984 15.3095 8.17648 15.0911 8.38578L8.71362 14.5C8.49933 14.7055 8.16038 14.7028 7.94941 14.4939L4.69557 11.273C4.48063 11.0602 4.47887 10.7135 4.69163 10.4986L5.46211 9.72023C5.65848 9.5218 5.96901 9.50503 6.18468 9.67097L6.2365 9.71632L8.16274 11.6234C8.26821 11.7278 8.43769 11.7291 8.54484 11.6264L13.5752 6.8046C13.7936 6.59537 14.1402 6.60269 14.3495 6.82095Z"
        fill="#141414"
      />
    </svg>
  )
}

export const IconDangerCircleSolid = () => {
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.5003 18.3337C12.8015 18.3337 14.8848 17.4009 16.3929 15.8929C17.9009 14.3848 18.8337 12.3015 18.8337 10.0003C18.8337 7.69916 17.9009 5.61583 16.3929 4.10777C14.8848 2.59973 12.8015 1.66699 10.5003 1.66699C8.19916 1.66699 6.11583 2.59973 4.60777 4.10777C3.09973 5.61583 2.16699 7.69916 2.16699 10.0003C2.16699 12.3015 3.09973 14.3848 4.60777 15.8929C6.11583 17.4009 8.19916 18.3337 10.5003 18.3337Z"
        fill="#F23F58"
        stroke="#F23F58"
        style={{
          fill: '#F23F58',
          fillOpacity: 1,
          stroke: '#F23F58',
          strokeOpacity: 1,
        }}
        strokeWidth="1.66667"
        strokeLinejoin="round"
      />
      <path
        d="M13.6245 6.875L7.37451 13.125"
        stroke="black"
        style={{ stroke: 'black', strokeOpacity: 1 }}
        strokeWidth="1.6625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.375 6.875L13.625 13.125"
        stroke="black"
        style={{ stroke: 'black', strokeOpacity: 1 }}
        strokeWidth="1.6625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconDangerCircleSolidWithoutGradient = () => {
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.5003 18.3337C12.8015 18.3337 14.8848 17.4009 16.3929 15.8929C17.9009 14.3848 18.8337 12.3015 18.8337 10.0003C18.8337 7.69916 17.9009 5.61583 16.3929 4.10777C14.8848 2.59973 12.8015 1.66699 10.5003 1.66699C8.19916 1.66699 6.11583 2.59973 4.60777 4.10777C3.09973 5.61583 2.16699 7.69916 2.16699 10.0003C2.16699 12.3015 3.09973 14.3848 4.60777 15.8929C6.11583 17.4009 8.19916 18.3337 10.5003 18.3337Z"
        fill="#F23F58"
        stroke="#F23F58"
        strokeWidth="1.66667"
        strokeLinejoin="round"
      />
      <path
        d="M13.6245 6.875L7.37451 13.125"
        stroke="black"
        strokeWidth="1.6625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.375 6.875L13.625 13.125"
        stroke="black"
        strokeWidth="1.6625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconFilterSolid = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5.50272 10.9994C5.27741 10.9994 5.05678 10.943 4.85025 10.8304C4.43717 10.6004 4.18838 10.1826 4.18838 9.71319V7.22533C4.18838 6.99063 4.03347 6.63857 3.88796 6.46019L2.13237 4.60134C1.83664 4.30561 1.61133 3.79865 1.61133 3.41843V2.33879C1.61133 1.58774 2.17931 1.00098 2.9022 1.00098H9.09839C9.81189 1.00098 10.3893 1.57835 10.3893 2.29185V3.32455C10.3893 3.81743 10.0935 4.37602 9.81658 4.65297L7.78405 6.45081C7.5869 6.6151 7.43199 6.97654 7.43199 7.26758V9.28603C7.43199 9.70381 7.16912 10.1873 6.84054 10.3844L6.19275 10.8022C5.98152 10.9337 5.74212 10.9994 5.50272 10.9994ZM2.9022 1.70509C2.57362 1.70509 2.31544 1.98204 2.31544 2.33879V3.41843C2.31544 3.59211 2.45626 3.93008 2.63464 4.10846L4.42308 5.99079C4.66248 6.28651 4.89719 6.77939 4.89719 7.22064V9.7085C4.89719 10.0136 5.10842 10.1638 5.19761 10.2108C5.39476 10.3187 5.63416 10.3187 5.81723 10.2061L6.4697 9.7883C6.60114 9.7085 6.73257 9.45502 6.73257 9.28603V7.26758C6.73257 6.76531 6.97666 6.21141 7.32872 5.91568L9.33779 4.13662C9.49739 3.97702 9.68984 3.5968 9.68984 3.31985V2.29185C9.68984 1.96796 9.42698 1.70509 9.10308 1.70509H2.9022V1.70509Z"
        fill="#878787"
      />
    </svg>
  )
}

export const IconPlay = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clip-path="url(#clip0_20096_142064)">
        <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
        <path
          d="M4.91381 3.32912C4.83725 3.27727 4.74684 3.2497 4.65438 3.25H4.6553C4.5333 3.25 4.4163 3.29846 4.33004 3.38473C4.24378 3.47099 4.19531 3.58799 4.19531 3.70999V8.28962C4.19524 8.37325 4.21797 8.45532 4.26106 8.527C4.30415 8.59868 4.36597 8.65726 4.43986 8.69643C4.51376 8.7356 4.59693 8.75388 4.68044 8.74931C4.76395 8.74474 4.84463 8.71749 4.91381 8.67049L8.28275 6.38067C8.3448 6.33849 8.39558 6.28178 8.43068 6.21547C8.46579 6.14917 8.48414 6.07529 8.48414 6.00026C8.48414 5.92524 8.46579 5.85136 8.43068 5.78505C8.39558 5.71875 8.3448 5.66203 8.28275 5.61985L4.91381 3.32912Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_20096_142064">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export const IconPause = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clip-path="url(#clip0_20056_28238)">
        <path d="M2.21875 3.35425H9.76431V3.36023H2.21875V3.35425Z" fill="currentColor" />
        <path
          d="M2.88312 3.35423L9.10133 3.36021V3.35423H2.88312ZM1.20898 2.39758L2.88312 2.40356V2.39758H1.20898ZM9.10133 2.39758L10.7755 2.40356V2.39758H9.10133ZM3.83977 2.39758H8.14469V2.3916L3.83977 2.39758Z"
          fill="currentColor"
        />
        <path
          d="M4.54384 8.5C4.23828 8.5 3.98828 8.25 3.98828 7.94444V4.05556C3.98828 3.75 4.23828 3.5 4.54384 3.5C4.84939 3.5 5.09939 3.75 5.09939 4.05556V7.94444C5.09939 8.25 4.85634 8.5 4.54384 8.5ZM7.32161 8.5C7.01606 8.5 6.76606 8.25 6.76606 7.94444V4.05556C6.76606 3.75 7.01606 3.5 7.32161 3.5C7.62717 3.5 7.87717 3.75 7.87717 4.05556V7.94444C7.87717 8.25 7.63411 8.5 7.32161 8.5Z"
          fill="currentColor"
        />
        <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
      </g>
      <defs>
        <clipPath id="clip0_20056_28238">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export const IconArrowRight = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M5.52859 3.52851C5.78894 3.26816 6.21105 3.26816 6.4714 3.52851L10.4714 7.52851C10.7317 7.78886 10.7317 8.21097 10.4714 8.47132L6.4714 12.4713C6.21105 12.7317 5.78894 12.7317 5.52859 12.4713C5.26824 12.211 5.26824 11.7889 5.52859 11.5285L9.05719 7.99992L5.52859 4.47132C5.26824 4.21097 5.26824 3.78886 5.52859 3.52851Z" fill="currentColor" />
    </svg>
  )
}

export const IconEditParams = (props: HTMLAttributes<SVGElement>) => {
  return (
    // <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    //   <path
    //     d="M2.76902 9.76003C2.46402 9.76003 2.17902 9.65502 1.97402 9.46002C1.71402 9.21502 1.58902 8.84502 1.63402 8.44502L1.81902 6.82502C1.85402 6.52002 2.03902 6.11502 2.25402 5.89502L6.35902 1.55002C7.38402 0.465024 8.45402 0.435025 9.53902 1.46002C10.624 2.48502 10.654 3.55502 9.62902 4.64002L5.52402 8.98502C5.31402 9.21002 4.92402 9.42002 4.61902 9.47003L3.00902 9.74502C2.92402 9.75002 2.84902 9.76003 2.76902 9.76003ZM7.96402 1.45502C7.57902 1.45502 7.24402 1.69502 6.90402 2.05502L2.79902 6.40503C2.69902 6.51003 2.58402 6.76003 2.56402 6.90503L2.37902 8.52502C2.35902 8.69002 2.39902 8.82502 2.48902 8.91002C2.57902 8.99502 2.71402 9.02502 2.87902 9.00002L4.48902 8.72503C4.63402 8.70003 4.87402 8.57002 4.97402 8.46502L9.07902 4.12002C9.69902 3.46002 9.92402 2.85002 9.01902 2.00002C8.61902 1.61502 8.27402 1.45502 7.96402 1.45502Z"
    //     fill="#9B9B9B"
    //   />
    //   <path
    //     d="M8.67022 5.47492C8.66022 5.47492 8.64522 5.47492 8.63522 5.47492C7.07522 5.31992 5.82022 4.13492 5.58022 2.58492C5.55022 2.37992 5.69022 2.18992 5.89522 2.15492C6.10022 2.12492 6.29022 2.26492 6.32522 2.46992C6.51522 3.67992 7.49522 4.60992 8.71522 4.72992C8.92022 4.74992 9.07022 4.93492 9.05022 5.13992C9.02522 5.32992 8.86022 5.47492 8.67022 5.47492Z"
    //     fill="#9B9B9B"
    //   />
    //   <path
    //     d="M10.5 11.375H1.5C1.295 11.375 1.125 11.205 1.125 11C1.125 10.795 1.295 10.625 1.5 10.625H10.5C10.705 10.625 10.875 10.795 10.875 11C10.875 11.205 10.705 11.375 10.5 11.375Z"
    //     fill="#9B9B9B"
    //   />
    // </svg>
    <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.4"
        d="M12.25 13.3334H1.75C1.51083 13.3334 1.3125 13.135 1.3125 12.8959C1.3125 12.6567 1.51083 12.4584 1.75 12.4584H12.25C12.4892 12.4584 12.6875 12.6567 12.6875 12.8959C12.6875 13.135 12.4892 13.3334 12.25 13.3334Z"
        fill="#878787"
      />
      <path
        opacity="0.4"
        d="M11.0953 2.52977C9.96366 1.3981 8.85533 1.36893 7.69449 2.52977L6.98866 3.2356C6.93033 3.29393 6.90699 3.38727 6.93033 3.46893C7.37366 5.01477 8.61033 6.25143 10.1562 6.69477C10.1795 6.7006 10.2028 6.70643 10.2262 6.70643C10.2903 6.70643 10.3487 6.6831 10.3953 6.63643L11.0953 5.9306C11.6728 5.35893 11.9528 4.80477 11.9528 4.24477C11.9587 3.66727 11.6787 3.10727 11.0953 2.52977Z"
        fill="#878787"
      />
      <path
        d="M9.10602 7.22633C8.93686 7.14466 8.77352 7.063 8.61602 6.96966C8.48769 6.89383 8.36519 6.81216 8.24269 6.72466C8.14352 6.6605 8.02686 6.56716 7.91602 6.47383C7.90436 6.468 7.86352 6.433 7.81686 6.38633C7.62436 6.223 7.40852 6.013 7.21602 5.77966C7.19852 5.768 7.16936 5.72716 7.12852 5.67466C7.07019 5.60466 6.97102 5.488 6.88352 5.35383C6.81352 5.26633 6.73186 5.138 6.65602 5.00966C6.56269 4.85216 6.48102 4.69466 6.39936 4.53133C6.31769 4.35633 6.25352 4.18716 6.19519 4.02966L2.53186 7.693C2.45602 7.76883 2.38602 7.91466 2.36852 8.01383L2.05352 10.248C1.99519 10.6447 2.10602 11.018 2.35102 11.2688C2.56102 11.473 2.85269 11.5838 3.16769 11.5838C3.23769 11.5838 3.30769 11.578 3.37769 11.5663L5.61769 11.2513C5.72269 11.2338 5.86852 11.1638 5.93852 11.088L9.60186 7.42466C9.43852 7.36633 9.28102 7.30216 9.10602 7.22633Z"
        fill="#878787"
      />
    </svg>
  )
}

export const IconWarningCircleSolid = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8.00065 14.6666C11.6673 14.6666 14.6673 11.6666 14.6673 7.99992C14.6673 4.33325 11.6673 1.33325 8.00065 1.33325C4.33398 1.33325 1.33398 4.33325 1.33398 7.99992C1.33398 11.6666 4.33398 14.6666 8.00065 14.6666Z"
        stroke="#9B9B9B"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 5.33325V8.66659"
        stroke="#9B9B9B"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.99609 10.6667H8.00208"
        stroke="#9B9B9B"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconChevronDown = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M11.76 6.66699L7.71335 10.7137L3.66669 6.66699"
        stroke="currentColor"
        stroke-width="1.14286"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}

export const IconChevronUp = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12.0465 9.37967L7.99979 5.33301L3.95312 9.37967"
        stroke="#9B9B9B"
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconDelete = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clip-path="url(#clip0_20056_28255)">
        <path d="M2.21875 3.35425H9.76431V3.36023H2.21875V3.35425Z" fill="#9B9B9B" />
        <path
          d="M2.88312 3.35423L9.10133 3.36021V3.35423H2.88312ZM1.20898 2.39758L2.88312 2.40356V2.39758H1.20898ZM9.10133 2.39758L10.7755 2.40356V2.39758H9.10133ZM3.83977 2.39758H8.14469V2.3916L3.83977 2.39758Z"
          fill="#9B9B9B"
        />
        <path
          d="M11.0502 2.68511H8.85023V1.58511C8.85023 0.980107 8.36073 0.485107 7.75024 0.485107H4.23023C3.62523 0.485107 3.13023 0.980107 3.13023 1.58511V2.68511H0.930234C0.809234 2.68511 0.699234 2.73461 0.616734 2.81161C0.539734 2.88861 0.490234 2.99861 0.490234 3.12511C0.490234 3.36711 0.688234 3.56511 0.930234 3.56511H1.63423L2.00823 10.3851C2.00823 10.9956 2.47573 11.4851 3.05873 11.4851H8.92723C9.50473 11.4851 9.97223 10.9956 9.97223 10.3851L10.3462 3.56511H11.0557C11.1767 3.56511 11.2867 3.51561 11.3692 3.43861C11.4462 3.35611 11.4957 3.24611 11.4957 3.12511C11.4902 2.88311 11.2922 2.68511 11.0502 2.68511ZM4.01023 1.58511C4.01023 1.46411 4.10923 1.36511 4.23023 1.36511H7.75024C7.87123 1.36511 7.97023 1.46411 7.97023 1.58511V2.68511H4.01023V1.58511ZM9.09223 10.3411V10.3906C9.09223 10.5226 9.00423 10.6106 8.92723 10.6106H3.05323C2.97073 10.6106 2.88273 10.5226 2.88273 10.3906V10.3411L2.51973 3.56511V3.55961H9.46074V3.56511L9.09223 10.3411Z"
          fill="#9B9B9B"
        />
        <path
          d="M4.88531 9.01566C4.64331 9.01566 4.44531 8.81766 4.44531 8.57566V5.49566C4.44531 5.25366 4.64331 5.05566 4.88531 5.05566C5.12731 5.05566 5.32531 5.25366 5.32531 5.49566V8.57566C5.32531 8.81766 5.13281 9.01566 4.88531 9.01566ZM7.08531 9.01566C6.84331 9.01566 6.64531 8.81766 6.64531 8.57566V5.49566C6.64531 5.25366 6.84331 5.05566 7.08531 5.05566C7.32731 5.05566 7.52531 5.25366 7.52531 5.49566V8.57566C7.52531 8.81766 7.33281 9.01566 7.08531 9.01566Z"
          fill="#9B9B9B"
        />
      </g>
      <defs>
        <clipPath id="clip0_20056_28255">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
export const IconCPDelete = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8.92708 11.5736L7.09375 9.74023"
        stroke="#9B9B9B"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.90755 9.75977L7.07422 11.5931"
        stroke="#9B9B9B"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.87427 1.33325L3.46094 3.75325"
        stroke="#9B9B9B"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.127 1.33325L12.5403 3.75325"
        stroke="#9B9B9B"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.33398 5.23299C1.33398 3.99966 1.99398 3.89966 2.81398 3.89966H13.1873C14.0073 3.89966 14.6673 3.99966 14.6673 5.23299C14.6673 6.66633 14.0073 6.56633 13.1873 6.56633H2.81398C1.99398 6.56633 1.33398 6.66633 1.33398 5.23299Z"
        stroke="#9B9B9B"
      />
      <path
        d="M2.33398 6.66675L3.27398 12.4267C3.48732 13.7201 4.00065 14.6667 5.90732 14.6667H9.92732C12.0007 14.6667 12.3073 13.7601 12.5473 12.5067L13.6673 6.66675"
        stroke="#9B9B9B"
        strokeLinecap="round"
      />
    </svg>
  )
}

export const IconFilteredHead = (props: HTMLAttributes<SVGElement> & { currentColor?: string }) => {
  const { currentColor = '#878787' } = props
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" fill={currentColor} {...props}>
      <path d="M7.18586 9.66438C7.07503 9.66438 6.96419 9.62354 6.87669 9.53604L3.33586 5.99521C3.16669 5.82604 3.16669 5.54604 3.33586 5.37688C3.50503 5.20771 3.78503 5.20771 3.95419 5.37688L7.18586 8.60854L10.4175 5.37688C10.5867 5.20771 10.8667 5.20771 11.0359 5.37688C11.205 5.54604 11.205 5.82604 11.0359 5.99521L7.49503 9.53604C7.40753 9.62354 7.29669 9.66438 7.18586 9.66438Z" />
    </svg>
  )
}

export const IconWarningCircle = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5.19727 11.6201L9.0006 7.81679C9.44977 7.36763 9.44977 6.63263 9.0006 6.18346L5.19727 2.38013"
        stroke="#9B9B9B"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconSwap = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M11.9329 9.21289L9.90625 11.2395"
        stroke="#9B9B9B"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.06641 9.21313H11.9331"
        stroke="#9B9B9B"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.06641 6.78666L7.09308 4.76001"
        stroke="#9B9B9B"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9331 6.78662H5.06641"
        stroke="#9B9B9B"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconHeaderSearch = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="7.5" cy="7.50781" r="5.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.3857 11.333L14.3303 13.2776C14.4279 13.3752 14.4279 13.5335 14.3303 13.6311L13.6232 14.3382C13.5255 14.4358 13.3673 14.4358 13.2696 14.3382L11.3251 12.3937L12.3857 11.333Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconHeaderHot = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.88024 7.42927C7.37158 8.15663 7.59453 1.14355 7.59453 1.14355C7.59453 1.14355 2.45125 6.85784 3.59453 10.8578C4.34311 13.4769 6.62629 15.3312 9.30881 14.8578C11.4843 14.4739 12.6512 13.5385 13.3082 11.4293C14.3761 8.0007 11.5939 4.57213 11.5939 4.57213C11.5939 4.57213 11.0927 7.07774 9.88024 7.42927Z"
        fill="url(#paint0_linear_20413_890985)"
      />
      <path
        d="M7.59453 1.14355L7.8801 1.15263C7.88391 1.03273 7.81242 0.923222 7.70112 0.878468C7.58982 0.833715 7.46242 0.863251 7.38217 0.952413L7.59453 1.14355ZM9.88024 7.42927L9.9598 7.70368L9.9598 7.70368L9.88024 7.42927ZM11.5939 4.57213L11.8157 4.39209C11.746 4.30613 11.6329 4.2682 11.5254 4.29475C11.4179 4.32129 11.3354 4.40753 11.3137 4.51608L11.5939 4.57213ZM13.3082 11.4293L13.0354 11.3443L13.0354 11.3443L13.3082 11.4293ZM9.30881 14.8578L9.35847 15.1392L9.30881 14.8578ZM3.59453 10.8578L3.86924 10.7793L3.86924 10.7793L3.59453 10.8578ZM7.59453 1.14355C7.30896 1.13448 7.30895 1.13455 7.30895 1.13466C7.30895 1.13473 7.30895 1.13485 7.30894 1.13499C7.30893 1.13527 7.30892 1.13566 7.30891 1.13615C7.30888 1.13713 7.30883 1.13854 7.30878 1.14036C7.30868 1.144 7.30853 1.1493 7.30835 1.15621C7.30799 1.17002 7.3075 1.19025 7.30698 1.21644C7.30593 1.26883 7.30475 1.34512 7.30414 1.44168C7.30292 1.63476 7.30403 1.90921 7.31329 2.23607C7.33177 2.88853 7.38284 3.75548 7.5143 4.60297C7.64453 5.44258 7.8583 6.29632 8.21952 6.90058C8.40152 7.20504 8.63278 7.46637 8.92954 7.62129C9.23443 7.78046 9.58192 7.81325 9.9598 7.70368L9.88024 7.42927L9.80068 7.15486C9.5514 7.22713 9.35708 7.19988 9.19399 7.11473C9.02277 7.02535 8.85987 6.85811 8.70999 6.60739C8.40745 6.10127 8.20659 5.33812 8.07897 4.51538C7.95258 3.70052 7.90261 2.85966 7.88449 2.2199C7.87545 1.90065 7.87438 1.63288 7.87556 1.44527C7.87615 1.35149 7.8773 1.27782 7.87829 1.22783C7.87879 1.20284 7.87925 1.18378 7.87958 1.1711C7.87975 1.16475 7.87988 1.16001 7.87997 1.15691C7.88001 1.15536 7.88005 1.15423 7.88007 1.15351C7.88008 1.15315 7.88009 1.1529 7.88009 1.15276C7.8801 1.15268 7.8801 1.15265 7.8801 1.15261C7.8801 1.15261 7.8801 1.15263 7.59453 1.14355ZM9.88024 7.42927L9.9598 7.70368C10.3447 7.59208 10.6498 7.31745 10.8864 7.00812C11.1247 6.69658 11.3122 6.32554 11.4558 5.97794C11.6001 5.62867 11.7042 5.29259 11.7722 5.04469C11.8063 4.92041 11.8315 4.81748 11.8483 4.74512C11.8567 4.70892 11.863 4.68031 11.8673 4.66045C11.8694 4.65052 11.8711 4.64277 11.8722 4.63734C11.8727 4.63463 11.8732 4.63249 11.8735 4.63096C11.8736 4.63019 11.8738 4.62958 11.8739 4.62911C11.8739 4.62888 11.874 4.62868 11.874 4.62852C11.874 4.62845 11.874 4.62836 11.874 4.62832C11.874 4.62824 11.8741 4.62817 11.5939 4.57213C11.3137 4.51608 11.3137 4.51603 11.3137 4.51599C11.3137 4.51599 11.3138 4.51596 11.3138 4.51596C11.3138 4.51595 11.3137 4.51599 11.3137 4.51606C11.3137 4.5162 11.3136 4.51649 11.3136 4.51693C11.3134 4.51781 11.3131 4.51927 11.3127 4.52131C11.3118 4.52539 11.3105 4.53175 11.3086 4.54025C11.305 4.55726 11.2993 4.58283 11.2917 4.61583C11.2763 4.68187 11.2529 4.77743 11.2211 4.89355C11.1572 5.12644 11.0603 5.43873 10.9276 5.75981C10.7944 6.08255 10.6292 6.40383 10.4326 6.66095C10.2342 6.92029 10.022 7.09069 9.80068 7.15486L9.88024 7.42927ZM11.5939 4.57213C11.372 4.75216 11.372 4.7521 11.3719 4.75205C11.3719 4.75205 11.3719 4.75202 11.3719 4.75202C11.3719 4.75203 11.372 4.75208 11.3721 4.75219C11.3722 4.75241 11.3726 4.75284 11.3731 4.75347C11.3741 4.75472 11.3758 4.7568 11.378 4.75968C11.3826 4.76545 11.3897 4.77443 11.3991 4.78652C11.4178 4.81072 11.4458 4.84735 11.4813 4.8956C11.5524 4.99211 11.6537 5.1349 11.7725 5.3173C12.0103 5.68253 12.3164 6.20427 12.5897 6.82943C13.139 8.08592 13.5401 9.72387 13.0354 11.3443L13.3082 11.4293L13.581 11.5142C14.1442 9.70609 13.6881 7.91548 13.1133 6.60054C12.8245 5.93998 12.5019 5.3903 12.2514 5.00552C12.126 4.81292 12.0183 4.66107 11.9414 4.55669C11.9029 4.50449 11.8722 4.46412 11.8507 4.43641C11.8399 4.42256 11.8315 4.41187 11.8256 4.40445C11.8227 4.40074 11.8204 4.39785 11.8187 4.39578C11.8179 4.39475 11.8172 4.39393 11.8167 4.39331C11.8165 4.393 11.8163 4.39275 11.8161 4.39255C11.816 4.39244 11.8159 4.39233 11.8159 4.39228C11.8158 4.39218 11.8157 4.39209 11.5939 4.57213ZM13.3082 11.4293L13.0354 11.3443C12.7177 12.3641 12.2859 13.0719 11.6936 13.5723C11.0997 14.0739 10.3178 14.3897 9.25916 14.5765L9.30881 14.8578L9.35847 15.1392C10.4753 14.9421 11.3647 14.5981 12.0623 14.0088C12.7615 13.4182 13.2416 12.6036 13.581 11.5142L13.3082 11.4293ZM9.30881 14.8578L9.25916 14.5765C6.75611 15.0182 4.58831 13.2951 3.86924 10.7793L3.59453 10.8578L3.31981 10.9364C4.09792 13.6587 6.49647 15.6443 9.35847 15.1392L9.30881 14.8578ZM3.59453 10.8578L3.86924 10.7793C3.60365 9.8501 3.69851 8.80191 4.01142 7.73274C4.32379 6.6654 4.84718 5.59876 5.41159 4.64636C5.97529 3.69517 6.57509 2.86593 7.03446 2.2741C7.26395 1.97843 7.45792 1.74261 7.59414 1.58113C7.66225 1.50041 7.71588 1.43829 7.75228 1.39661C7.77047 1.37577 7.78435 1.36004 7.79357 1.34964C7.79818 1.34444 7.80162 1.34058 7.80386 1.33808C7.80498 1.33683 7.80579 1.33592 7.8063 1.33536C7.80655 1.33507 7.80673 1.33488 7.80683 1.33477C7.80688 1.33471 7.80689 1.33469 7.80692 1.33467C7.80691 1.33467 7.80689 1.3347 7.59453 1.14355C7.38217 0.952413 7.3821 0.952483 7.38202 0.952574C7.38197 0.952633 7.38187 0.952747 7.38176 0.952865C7.38155 0.953103 7.38125 0.953428 7.38088 0.953839C7.38015 0.954662 7.3791 0.955831 7.37775 0.957343C7.37505 0.960366 7.37113 0.96476 7.36604 0.970496C7.35587 0.981969 7.34101 0.998813 7.32181 1.0208C7.28342 1.06477 7.22768 1.12934 7.15738 1.21267C7.01679 1.37932 6.81788 1.62118 6.58305 1.92373C6.11378 2.52832 5.49922 3.37766 4.92 4.35503C4.34151 5.33121 3.79344 6.44314 3.463 7.57223C3.13309 8.69948 3.01376 9.86558 3.31981 10.9364L3.59453 10.8578Z"
        fill="url(#paint1_linear_20413_890985)"
      />
      <path
        d="M6.90869 8.01372C6.84442 8.43935 7.10883 10.2044 8.75421 10.6133C9.24549 10.7354 9.68241 10.4108 9.78577 9.99488C10.5142 10.6175 10.7234 11.5527 10.6201 11.9686C10.4134 12.8005 9.5191 13.4813 8.0301 13.1112C5.18854 12.4051 6.90869 8.01372 6.90869 8.01372Z"
        fill="#FFDA20"
      />
      <defs>
        <linearGradient
          id="paint0_linear_20413_890985"
          x1="8.49049"
          y1="1.14355"
          x2="8.49049"
          y2="14.9318"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0CBEFE" />
          <stop offset="1" stopColor="#D900B8" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_20413_890985"
          x1="8.49049"
          y1="1.14355"
          x2="8.49049"
          y2="14.9318"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00F3AB" />
          <stop offset="0.5" stopColor="white" />
          <stop offset="1" stopColor="#E329FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const IconHeaderMoonShot = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6.52572 5.34131C6.52572 4.38428 6.96868 3.53443 7.66504 2.98355C7.66504 2.98355 7.80176 2.88876 7.80176 2.69808C7.80176 2.49683 7.63879 2.33386 7.43717 2.3335C4.61822 2.3335 2.33301 4.6187 2.33301 7.43766C2.33301 10.2566 4.61822 12.5418 7.43717 12.5418C10.255 12.5418 12.5399 10.2581 12.5413 7.43766C12.5413 7.23641 12.378 7.07308 12.1768 7.07308C11.9923 7.07308 11.892 7.20797 11.892 7.20797C11.3411 7.90324 10.4895 8.34912 9.53353 8.34912C7.87249 8.34912 6.52572 7.00235 6.52572 5.34131ZM11.2819 3.23874C11.3085 3.03307 11.0736 2.89747 10.9088 3.02337L10.0122 3.7083C9.96328 3.74566 9.9016 3.76218 9.84057 3.75428L8.7216 3.60942C8.51593 3.5828 8.38033 3.81766 8.50622 3.98247L9.19116 4.8791C9.22852 4.928 9.24504 4.98967 9.23714 5.0507L9.09228 6.16967C9.06566 6.37535 9.30052 6.51095 9.46533 6.38505L10.362 5.70011C10.4109 5.66276 10.4725 5.64623 10.5336 5.65413L11.6525 5.79899C11.8582 5.82562 11.9938 5.59075 11.8679 5.42594L11.183 4.52932C11.1456 4.48042 11.1291 4.41874 11.137 4.35772L11.2819 3.23874Z"
      fill="#DFFF16"
    />
  </svg>
)

export const IconHeaderFavorite = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" {...props}>
      <path
        d="M6.33131 6.34274L1.73658 7.01058L1.6585 7.02633C1.5416 7.05757 1.43506 7.11922 1.34973 7.20501C1.2644 7.2908 1.20331 7.39766 1.17269 7.51472C1.14207 7.63178 1.143 7.75486 1.17539 7.87145C1.20779 7.98803 1.27049 8.09395 1.35712 8.17844L4.68123 11.4197L3.89695 15.9966L3.88805 16.0719C3.88088 16.1931 3.90604 16.314 3.96096 16.4223C4.01589 16.5306 4.09859 16.6223 4.20062 16.6881C4.30265 16.7539 4.42032 16.7913 4.5416 16.7967C4.66288 16.8021 4.78341 16.7751 4.89083 16.7185L9.0006 14.5575L13.1104 16.7185L13.1796 16.75C13.2925 16.7943 13.4153 16.8076 13.5351 16.7889C13.655 16.7701 13.7677 16.7198 13.8618 16.6432C13.9558 16.5665 14.0279 16.4663 14.0705 16.3527C14.1131 16.2391 14.1247 16.1162 14.1043 15.9966L13.3193 11.4197L16.6448 8.17844L16.6982 8.12021C16.7745 8.02621 16.8246 7.91367 16.8432 7.79403C16.8619 7.6744 16.8485 7.55195 16.8044 7.43918C16.7604 7.3264 16.6872 7.22732 16.5924 7.15203C16.4975 7.07674 16.3845 7.02793 16.2646 7.01058L11.6692 6.34274L9.61433 2.17886C9.55773 2.06433 9.47023 1.96792 9.36172 1.9005C9.25321 1.83309 9.12801 1.79736 9.00026 1.79736C8.87251 1.79736 8.74731 1.83309 8.6388 1.9005C8.53029 1.96792 8.44279 2.06433 8.38619 2.17886L6.33131 6.34274ZM9.0006 4.02894L10.6007 7.27155L10.6418 7.34484C10.6951 7.4258 10.7649 7.49453 10.8468 7.54648C10.9286 7.59843 11.0205 7.63243 11.1164 7.64622L14.6947 8.16611L12.1055 10.6902L12.0487 10.7518C11.9881 10.8275 11.9442 10.9152 11.92 11.009C11.8958 11.1029 11.8918 11.2008 11.9083 11.2964L12.5199 14.8602L9.31911 13.1773L9.24308 13.143C9.15237 13.1086 9.05539 13.0939 8.95856 13.0998C8.86174 13.1057 8.76727 13.1321 8.68141 13.1773L5.48058 14.8602L6.09294 11.2964L6.10184 11.2128C6.10647 11.1161 6.09054 11.0196 6.05512 10.9295C6.0197 10.8394 5.96559 10.7578 5.89636 10.6902L3.30583 8.16611L6.88476 7.6469C6.99473 7.63087 7.09915 7.58833 7.18901 7.52293C7.27886 7.45754 7.35146 7.37126 7.40053 7.27155L9.0006 4.02894Z"
        fill="#5F5F5F"
      />
    </svg>
  )
}

export const IconHeaderSpinner = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" {...props}>
      <g clipPath="url(#clip0_21908_112730)">
        <circle cx="8.0536" cy="8.05165" r="6.80556" fill="#232329" />
        <path
          d="M13.1961 7.74972H12.577C12.5025 6.65427 12.0336 5.6229 11.2572 4.8465C10.4808 4.07011 9.44947 3.60124 8.35401 3.52669V2.90607C8.35391 2.86668 8.34604 2.82771 8.33085 2.79137C8.31566 2.75503 8.29345 2.72204 8.26549 2.6943C8.23753 2.66656 8.20437 2.6446 8.16792 2.6297C8.13146 2.61479 8.09242 2.60722 8.05304 2.60743H8.04837C7.96896 2.60743 7.8928 2.63897 7.83665 2.69512C7.78049 2.75128 7.74895 2.82744 7.74895 2.90685V3.52592C6.65349 3.60047 5.62212 4.06933 4.84572 4.84572C4.06933 5.62212 3.60047 6.65349 3.52592 7.74895H2.90607C2.86668 7.74905 2.82771 7.75692 2.79137 7.77211C2.75503 7.7873 2.72204 7.80951 2.6943 7.83747C2.66656 7.86543 2.6446 7.89858 2.6297 7.93504C2.61479 7.9715 2.60722 8.01054 2.60743 8.04992V8.05459C2.60743 8.22102 2.74119 8.35401 2.90685 8.35401H3.52592C3.60047 9.44947 4.06933 10.4808 4.84572 11.2572C5.62212 12.0336 6.65349 12.5025 7.74895 12.577V13.1969C7.74895 13.3625 7.88271 13.4963 8.04915 13.4963H8.05381C8.09313 13.4963 8.13207 13.4886 8.1684 13.4735C8.20472 13.4585 8.23773 13.4364 8.26554 13.4086C8.29334 13.3808 8.3154 13.3478 8.33044 13.3115C8.34549 13.2751 8.35324 13.2362 8.35324 13.1969V12.5778C9.44869 12.5033 10.4801 12.0344 11.2565 11.258C12.0329 10.4816 12.5017 9.45025 12.5763 8.35479H13.1961C13.2356 8.35479 13.2748 8.34697 13.3112 8.33178C13.3477 8.31658 13.3808 8.29432 13.4087 8.26627C13.4365 8.23822 13.4585 8.20493 13.4734 8.16833C13.4883 8.13174 13.4958 8.09255 13.4955 8.05303V8.04837C13.4955 7.96896 13.464 7.8928 13.4078 7.83664C13.3517 7.78049 13.2755 7.74895 13.1961 7.74895V7.74972ZM11.6671 7.74972H11.1359C11.0654 7.03565 10.7497 6.36804 10.2425 5.86045C9.73537 5.35285 9.06803 5.0366 8.35401 4.96548V4.43507C9.20852 4.50764 10.0098 4.88011 10.6161 5.48657C11.2225 6.09304 11.5947 6.89443 11.6671 7.74895V7.74972ZM9.71192 8.35324H10.6794C10.6105 8.94624 10.3434 9.4986 9.92133 9.92081C9.49927 10.343 8.94699 10.6103 8.35401 10.6794V9.71192C8.35401 9.67253 8.34624 9.63353 8.33115 9.59715C8.31605 9.56077 8.29393 9.52773 8.26604 9.49992C8.23815 9.4721 8.20505 9.45006 8.16864 9.43506C8.13222 9.42006 8.0932 9.41239 8.05381 9.41249H8.04915C8.00983 9.41249 7.97089 9.42024 7.93456 9.43528C7.89824 9.45033 7.86523 9.47239 7.83742 9.50019C7.80962 9.528 7.78756 9.561 7.77252 9.59733C7.75747 9.63366 7.74972 9.67259 7.74972 9.71192V10.6794C7.1567 10.6107 6.60424 10.3438 6.1819 9.92186C5.75955 9.49993 5.49206 8.94775 5.42278 8.35479H6.39027C6.42965 8.35479 6.46865 8.34702 6.50503 8.33192C6.54141 8.31683 6.57445 8.2947 6.60227 8.26682C6.63008 8.23893 6.65212 8.20583 6.66712 8.16941C6.68212 8.133 6.68979 8.09398 6.68969 8.05459V8.04992C6.68969 8.0106 6.68194 7.97167 6.6669 7.93534C6.65185 7.89901 6.62979 7.866 6.60199 7.8382C6.57419 7.8104 6.54118 7.78834 6.50485 7.77329C6.46852 7.75825 6.42959 7.7505 6.39027 7.7505H5.42356C5.49208 7.15733 5.75894 6.6047 6.18088 6.1822C6.60282 5.75969 7.1551 5.49209 7.74817 5.42278V6.39027C7.74817 6.55592 7.88194 6.68969 8.04837 6.68969H8.05304C8.09236 6.68969 8.13129 6.68194 8.16762 6.6669C8.20395 6.65185 8.23696 6.62979 8.26476 6.60199C8.29256 6.57419 8.31462 6.54118 8.32967 6.50485C8.34471 6.46852 8.35246 6.42959 8.35246 6.39027V5.42356C8.94546 5.49244 9.49783 5.75956 9.92003 6.18163C10.3422 6.60369 10.6095 7.15597 10.6786 7.74895H9.71192C9.67253 7.74895 9.63353 7.75672 9.59715 7.77181C9.56077 7.78691 9.52773 7.80903 9.49992 7.83692C9.4721 7.86481 9.45006 7.89791 9.43506 7.93432C9.42006 7.97074 9.41239 8.00976 9.41249 8.04915V8.05381C9.41249 8.22024 9.54626 8.35324 9.71192 8.35324ZM7.74972 4.43585V4.96703C7.03553 5.03759 6.36783 5.35339 5.86022 5.86072C5.35261 6.36805 5.03643 7.03557 4.96548 7.74972H4.43507C4.50744 6.895 4.8798 6.09342 5.48627 5.4868C6.09275 4.88019 6.89424 4.50764 7.74895 4.43507V4.43585H7.74972ZM4.43507 8.35324H4.96703C5.03759 9.06743 5.35339 9.73513 5.86072 10.2427C6.36805 10.7504 7.03557 11.0665 7.74972 11.1375V11.6679C6.89482 11.5956 6.09306 11.2232 5.4864 10.6166C4.87974 10.0099 4.50732 9.20814 4.43507 8.35324ZM8.35324 11.6679V11.1359C9.06731 11.0654 9.73492 10.7497 10.2425 10.2425C10.7501 9.73537 11.0664 9.06803 11.1375 8.35401H11.6679C11.5953 9.20864 11.2227 10.01 10.6161 10.6164C10.0095 11.2227 9.20789 11.5949 8.35324 11.6671V11.6679Z"
          fill="#fff"
        />
      </g>
      <defs>
        <clipPath id="clip0_21908_112730">
          <rect width="14" height="14" fill="white" transform="translate(0.855469 0.856445)" />
        </clipPath>
      </defs>
    </svg>
  )
}

export const IconWalletCopy = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6.47533 13.2707H4.02533C1.74449 13.2707 0.729492 12.2557 0.729492 9.97484V7.52484C0.729492 5.244 1.74449 4.229 4.02533 4.229H6.47533C8.75616 4.229 9.77116 5.244 9.77116 7.52484V9.97484C9.77116 12.2557 8.75616 13.2707 6.47533 13.2707ZM4.02533 5.104C2.21699 5.104 1.60449 5.7165 1.60449 7.52484V9.97484C1.60449 11.7832 2.21699 12.3957 4.02533 12.3957H6.47533C8.28366 12.3957 8.89616 11.7832 8.89616 9.97484V7.52484C8.89616 5.7165 8.28366 5.104 6.47533 5.104H4.02533Z"
        fill="#878787"
      />
      <path
        d="M9.97533 9.77067H9.33366C9.09449 9.77067 8.89616 9.57234 8.89616 9.33317V7.52484C8.89616 5.7165 8.28366 5.104 6.47533 5.104H4.66699C4.42783 5.104 4.22949 4.90567 4.22949 4.6665V4.02484C4.22949 1.744 5.24449 0.729004 7.52533 0.729004H9.97533C12.2562 0.729004 13.2712 1.744 13.2712 4.02484V6.47484C13.2712 8.75567 12.2562 9.77067 9.97533 9.77067ZM9.77116 8.89567H9.97533C11.7837 8.89567 12.3962 8.28317 12.3962 6.47484V4.02484C12.3962 2.2165 11.7837 1.604 9.97533 1.604H7.52533C5.71699 1.604 5.10449 2.2165 5.10449 4.02484V4.229H6.47533C8.75616 4.229 9.77116 5.244 9.77116 7.52484V8.89567Z"
        fill="#878787"
      />
    </svg>
  )
}

export const IconCopySuccess = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" {...props}>
      <path d="M2.5 7L5.5 10L11.5 4" stroke="#00FFB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const IconSuccessCheck = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.6663 10.9997C21.6663 5.10864 16.8907 0.333008 10.9997 0.333008C5.10864 0.333008 0.333008 5.10864 0.333008 10.9997C0.333008 16.8907 5.10864 21.6663 10.9997 21.6663C16.8907 21.6663 21.6663 16.8907 21.6663 10.9997ZM1.66638 10.9998C1.66638 5.84518 5.84506 1.6665 10.9997 1.6665C16.1544 1.6665 20.333 5.84518 20.333 10.9998C20.333 16.1545 16.1544 20.3332 10.9997 20.3332C5.84506 20.3332 1.66638 16.1545 1.66638 10.9998Z"
        fill="white"
      />
      <path
        d="M15.6424 7.69513C15.4471 7.49987 15.1306 7.49987 14.9353 7.69513L10.1951 12.4354C9.9998 12.6306 9.68321 12.6306 9.48795 12.4354L7.26187 10.2093C7.06661 10.014 6.75003 10.014 6.55477 10.2093L6.14447 10.6196C5.94921 10.8149 5.94921 11.1314 6.14447 11.3267L9.1344 14.3166C9.52492 14.7071 10.1581 14.7071 10.5486 14.3166L16.0527 8.81254C16.248 8.61728 16.248 8.30069 16.0527 8.10543L15.6424 7.69513Z"
        fill="white"
      />
    </svg>
  )
}

export const IconErrorX = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" {...props}>
      <path d="M3 3L9 9M3 9L9 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export const IconWalletBalance = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7.91803 6.94143L4.41908 6.94248C4.17998 6.94255 3.98165 6.74433 3.98158 6.50524C3.9815 6.26614 4.17972 6.06781 4.41881 6.06774L7.91777 6.06669C8.15686 6.06662 8.35519 6.26483 8.35527 6.50393C8.35534 6.74302 8.15712 6.94136 7.91803 6.94143Z"
        fill="#B9B9B9"
      />
      <path
        d="M1.50354 6.94331C1.26444 6.94338 1.06611 6.74517 1.06604 6.50607L1.06523 3.81188C1.0648 2.38314 2.22494 1.22231 3.65368 1.22188L6.93103 1.2209C8.42974 1.22045 9.52055 2.21732 9.52096 3.58774C9.52103 3.82684 9.32282 4.02517 9.08372 4.02524C8.84463 4.02532 8.6463 3.8271 8.64622 3.58801C8.64592 2.56165 7.75354 2.09539 6.93129 2.09564L3.65394 2.09662C2.70922 2.0969 1.93968 2.8669 1.93997 3.81162L1.94077 6.50581C1.94085 6.75074 1.74263 6.94324 1.50354 6.94331Z"
        fill="#B9B9B9"
      />
      <path
        d="M3.83409 3.5021L9.66612 3.50035C11.0006 3.49995 12.0861 4.58513 12.0868 5.91955L12.087 6.76525C12.087 6.78635 12.0786 6.80883 12.0607 6.82678C12.0429 6.84453 12.0211 6.85307 12.0001 6.85317L11.3703 6.85336C11.0806 6.85344 10.8024 6.96137 10.5979 7.17195L10.592 7.17781C10.349 7.42101 10.2314 7.75429 10.2749 8.09294L10.3033 8.23844C10.439 8.74437 10.9439 9.06333 11.4578 9.06329L12.0008 9.06313C12.0217 9.06321 12.0435 9.07175 12.0614 9.08948C12.0793 9.10742 12.0877 9.1299 12.0877 9.15099L12.088 9.9967C12.0882 11.3375 11.0028 12.4228 9.66879 12.4232L3.83676 12.425C2.50249 12.4251 1.41675 11.34 1.41612 10.0058L1.41489 5.92275C1.41475 4.58849 2.49983 3.50276 3.83409 3.5021ZM3.83414 3.6769C2.59742 3.67753 1.58958 4.68597 1.5897 5.92269L1.59092 10.0057C1.59152 11.2424 2.59997 12.2503 3.83671 12.2501L9.66874 12.2484C10.9057 12.248 11.9133 11.2395 11.9132 10.0026L11.913 9.24382L11.4579 9.24395C10.8548 9.24402 10.3485 8.89051 10.1656 8.39278L10.1334 8.29123C10.029 7.90234 10.1148 7.49306 10.3547 7.18276L10.467 7.05578L10.4709 7.05187C10.707 6.81103 11.025 6.67865 11.3702 6.67855L11.9122 6.67839L11.912 5.9196C11.9113 4.68272 10.9031 3.67478 9.66617 3.67516L3.83414 3.6769Z"
        fill="#B9B9B9"
        stroke="#B9B9B9"
        strokeWidth="0.69979"
      />
      <path
        d="M12.5662 9.59396L11.4407 9.5943C10.5602 9.59456 9.81354 8.94165 9.7433 8.10192C9.69651 7.61792 9.87132 7.14548 10.2211 6.80131C10.5126 6.49798 10.9266 6.32874 11.3639 6.32861L12.5594 6.32825C13.1309 6.32808 13.5976 6.78865 13.5978 7.36015L13.5981 8.56145C13.6041 9.13294 13.1377 9.59379 12.5662 9.59396ZM11.37 7.20335C11.1659 7.20341 10.9794 7.27927 10.8453 7.41927C10.6762 7.58261 10.5946 7.80426 10.618 8.02585C10.6473 8.41072 11.0206 8.71969 11.4405 8.71956L12.566 8.71922C12.6534 8.7192 12.7292 8.64919 12.7292 8.56171L12.7289 7.36041C12.7288 7.27293 12.653 7.20296 12.5655 7.20299L11.37 7.20335Z"
        fill="#B9B9B9"
      />
    </svg>
  )
}

export const IconArbitrum = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M5.82561 14.7484L2.78085 14.7484C2.78085 14.7484 2.62551 14.7329 2.54784 15.0591C2.4857 15.3232 2.67211 15.5717 2.67211 15.5717L6.47806 20.9311C6.47806 20.9311 6.72661 21.4282 7.23924 21.4282C7.73635 21.4282 7.93829 21.0709 7.93829 21.0709L11.6355 15.696C11.6355 15.696 11.7598 15.3542 11.6976 15.0591C11.6355 14.7484 11.4025 14.7484 11.4025 14.7484L8.54414 14.7484L8.54414 9.51329C8.54414 9.51329 9.10338 5.38113 10.6258 5.38113C10.6258 5.38113 5.81007 5.44326 5.81007 9.63757L5.82561 14.7484ZM18.0512 9.38901L21.0804 9.38901C21.0804 9.38901 21.2669 9.32688 21.3135 9.00065C21.3445 8.78317 21.2358 8.64336 21.1892 8.58122L17.3988 3.22184C17.3988 3.22184 17.1502 2.72473 16.6376 2.72473C16.1405 2.72473 15.9385 3.08202 15.9385 3.08202L12.2413 8.47248C12.2413 8.47248 12.1015 8.68996 12.1792 9.00065C12.2724 9.37348 12.4744 9.38901 12.4744 9.38901L15.3172 9.38901L15.3172 14.6552C15.3172 14.6552 14.7579 18.7874 13.2355 18.7874C13.2355 18.7874 18.0512 18.7252 18.0512 14.5154L18.0512 9.38901Z"
        fill="url(#paint0_linear_arbitrum)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_arbitrum"
          x1="20.7472"
          y1="21.4282"
          x2="20.7472"
          y2="2.72473"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.2" stopColor="#9945FF" />
          <stop offset="1" stopColor="#00F3AB" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const IconReset = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.31999 2.9799L8 1.33325"
        stroke="#9B9B9B"
        style={{ stroke: '#9B9B9B', strokeOpacity: 1 }}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.7256 5.19991C13.4656 6.18658 13.9256 7.40658 13.9256 8.73991C13.9256 12.0132 11.2723 14.6666 7.99894 14.6666C4.72561 14.6666 2.07227 12.0132 2.07227 8.73991C2.07227 5.46658 4.72561 2.81323 7.99894 2.81323C8.45228 2.81323 8.89226 2.87327 9.31893 2.97327"
        stroke="#9B9B9B"
        style={{ stroke: '#9B9B9B', strokeOpacity: 1 }}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconCopySolid = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10.6668 8.60016V11.4002C10.6668 13.7335 9.7335 14.6668 7.40016 14.6668H4.60016C2.26683 14.6668 1.3335 13.7335 1.3335 11.4002V8.60016C1.3335 6.26683 2.26683 5.3335 4.60016 5.3335H7.40016C9.7335 5.3335 10.6668 6.26683 10.6668 8.60016Z"
        fill="#9B9B9B"
      />
      <path
        opacity="0.4"
        d="M11.3998 1.3335H8.59984C6.29984 1.3335 5.36651 2.24683 5.33984 4.50016H7.39984C10.1998 4.50016 11.4998 5.80016 11.4998 8.60016V10.6602C13.7532 10.6335 14.6665 9.70016 14.6665 7.40016V4.60016C14.6665 2.26683 13.7332 1.3335 11.3998 1.3335Z"
        fill="#9B9B9B"
      />
    </svg>
  )
}

export const IconSearch = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="7.5" cy="7.50781" r="5.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12.3857 11.334L14.3303 13.2785C14.4279 13.3762 14.4279 13.5345 14.3303 13.6321L13.6232 14.3392C13.5255 14.4368 13.3673 14.4368 13.2696 14.3392L11.3251 12.3946L12.3857 11.334Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconNetwork = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M16.5 9C16.5 4.86 13.14 1.5 9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5"
        stroke="white"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.99922 2.25H6.74922C5.28672 6.63 5.28672 11.37 6.74922 15.75H5.99922"
        stroke="white"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.25 2.25C11.9775 4.44 12.345 6.72 12.345 9"
        stroke="white"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.25 12V11.25C4.44 11.9775 6.72 12.345 9 12.345"
        stroke="white"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.25 6.74922C6.63 5.28672 11.37 5.28672 15.75 6.74922"
        stroke="white"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11.7148H14.1075C14.5725 11.7148 14.955 12.1348 14.955 12.5623C14.955 13.0273 14.58 13.4099 14.1075 13.4099H12V11.7148Z"
        stroke="white"
        strokeWidth="1.125"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13.4102H14.415C14.9475 13.4102 15.3825 13.7852 15.3825 14.2577C15.3825 14.7227 14.9475 15.1052 14.415 15.1052H12V13.4102Z"
        stroke="white"
        strokeWidth="1.125"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3506 15.0977V15.9377"
        stroke="white"
        strokeWidth="1.125"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3496 10.875V11.715"
        stroke="white"
        strokeWidth="1.125"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconMoneyGradient = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M11.1678 14.5167H9.07611C7.70944 14.5167 6.60111 13.3667 6.60111 11.9501C6.60111 11.6084 6.88444 11.3251 7.22611 11.3251C7.56777 11.3251 7.85111 11.6084 7.85111 11.9501C7.85111 12.6751 8.40111 13.2667 9.07611 13.2667H11.1678C11.7094 13.2667 12.1594 12.7834 12.1594 12.2001C12.1594 11.4751 11.9011 11.3334 11.4761 11.1834L8.11777 10.0001C7.46777 9.77506 6.59277 9.29173 6.59277 7.80006C6.59277 6.51673 7.60111 5.4834 8.83444 5.4834H10.9261C12.2928 5.4834 13.4011 6.6334 13.4011 8.05006C13.4011 8.39173 13.1178 8.67506 12.7761 8.67506C12.4344 8.67506 12.1511 8.39173 12.1511 8.05006C12.1511 7.32506 11.6011 6.7334 10.9261 6.7334H8.83444C8.29277 6.7334 7.84277 7.21673 7.84277 7.80006C7.84277 8.52506 8.10111 8.66673 8.52611 8.81673L11.8844 10.0001C12.5344 10.2251 13.4094 10.7084 13.4094 12.2001C13.4011 13.4751 12.4011 14.5167 11.1678 14.5167Z"
        fill="url(#paint0_linear_22207_1270290)"
      />
      <path
        d="M10.001 15.625C9.65931 15.625 9.37598 15.3417 9.37598 15V5C9.37598 4.65833 9.65931 4.375 10.001 4.375C10.3426 4.375 10.626 4.65833 10.626 5V15C10.626 15.3417 10.3426 15.625 10.001 15.625Z"
        fill="url(#paint1_linear_22207_1270290)"
      />
      <path
        d="M10.0013 18.9587C5.05964 18.9587 1.04297 14.942 1.04297 10.0003C1.04297 5.05866 5.05964 1.04199 10.0013 1.04199C14.943 1.04199 18.9596 5.05866 18.9596 10.0003C18.9596 14.942 14.943 18.9587 10.0013 18.9587ZM10.0013 2.29199C5.7513 2.29199 2.29297 5.75033 2.29297 10.0003C2.29297 14.2503 5.7513 17.7087 10.0013 17.7087C14.2513 17.7087 17.7096 14.2503 17.7096 10.0003C17.7096 5.75033 14.2513 2.29199 10.0013 2.29199Z"
        fill="url(#paint2_linear_22207_1270290)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_22207_1270290"
          x1="6.59277"
          y1="14.5167"
          x2="15.5022"
          y2="7.51343"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_22207_1270290"
          x1="9.37598"
          y1="15.625"
          x2="11.9843"
          y2="15.3231"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_22207_1270290"
          x1="1.04297"
          y1="18.9587"
          x2="19.2132"
          y2="0.0312882"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const IconRecoveryConvertGradient = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12.1668 10.483V12.758C12.1668 14.658 11.4085 15.4163 9.5085 15.4163H7.24183C5.35016 15.4163 4.5835 14.658 4.5835 12.758V10.483C4.5835 8.59134 5.34183 7.83301 7.24183 7.83301H9.51683C11.4085 7.83301 12.1668 8.59134 12.1668 10.483Z"
        stroke="url(#paint0_linear_22207_1270303)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.4168 7.23301V9.50801C15.4168 11.408 14.6585 12.1663 12.7585 12.1663H12.1668V10.483C12.1668 8.59134 11.4085 7.83301 9.5085 7.83301H7.8335V7.23301C7.8335 5.33301 8.59183 4.58301 10.4918 4.58301H12.7668C14.6585 4.58301 15.4168 5.34134 15.4168 7.23301Z"
        stroke="url(#paint1_linear_22207_1270303)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3338 12.499C18.3338 15.724 15.7255 18.3324 12.5005 18.3324L13.3755 16.874"
        stroke="url(#paint2_linear_22207_1270303)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.66699 7.49935C1.66699 4.27435 4.27533 1.66602 7.50033 1.66602L6.62533 3.12435"
        stroke="url(#paint3_linear_22207_1270303)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_22207_1270303"
          x1="4.5835"
          y1="15.4163"
          x2="12.2742"
          y2="7.40522"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_22207_1270303"
          x1="7.8335"
          y1="12.1663"
          x2="15.5242"
          y2="4.15522"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_22207_1270303"
          x1="12.5005"
          y1="18.3324"
          x2="18.4164"
          y2="12.17"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_22207_1270303"
          x1="1.66699"
          y1="7.49935"
          x2="7.5829"
          y2="1.33695"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const IconTradeGradient = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M18.3333 7.08366C18.3333 10.0753 15.9083 12.5003 12.9167 12.5003C12.775 12.5003 12.625 12.492 12.4833 12.4837C12.275 9.842 10.1583 7.72532 7.51666 7.51698C7.50832 7.37532 7.5 7.22533 7.5 7.08366C7.5 4.09199 9.925 1.66699 12.9167 1.66699C15.9083 1.66699 18.3333 4.09199 18.3333 7.08366Z"
        stroke="url(#paint0_linear_23046_618264)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.4998 12.9167C12.4998 15.9083 10.0748 18.3333 7.08317 18.3333C4.0915 18.3333 1.6665 15.9083 1.6665 12.9167C1.6665 9.925 4.0915 7.5 7.08317 7.5C7.22484 7.5 7.37483 7.50832 7.51649 7.51666C10.1582 7.72499 12.2748 9.84168 12.4832 12.4833C12.4915 12.625 12.4998 12.775 12.4998 12.9167Z"
        stroke="url(#paint1_linear_23046_618264)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.65817 1.66699H2.49984C2.0415 1.66699 1.6665 2.04199 1.6665 2.50033V4.65866C1.6665 5.40032 2.5665 5.77532 3.0915 5.25032L5.24983 3.09199C5.76649 2.56699 5.39983 1.66699 4.65817 1.66699Z"
        stroke="url(#paint2_linear_23046_618264)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.3413 18.3332H17.4996C17.9579 18.3332 18.3329 17.9582 18.3329 17.4999V15.3416C18.3329 14.5999 17.4329 14.2249 16.9079 14.7499L14.7496 16.9082C14.2329 17.4332 14.5996 18.3332 15.3413 18.3332Z"
        stroke="url(#paint3_linear_23046_618264)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_23046_618264"
          x1="7.5"
          y1="12.5003"
          x2="18.4867"
          y2="1.05587"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_23046_618264"
          x1="1.6665"
          y1="18.3333"
          x2="12.6532"
          y2="6.88888"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_23046_618264"
          x1="1.6665"
          y1="5.49533"
          x2="5.54918"
          y2="1.45478"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_23046_618264"
          x1="14.5083"
          y1="18.3332"
          x2="18.391"
          y2="14.2927"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const IconWalletMoney = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.83531 14.0503V15.742C9.83531 17.1753 8.50197 18.3336 6.8603 18.3336C5.21863 18.3336 3.87695 17.1753 3.87695 15.742V14.0503C3.87695 15.4836 5.2103 16.5003 6.8603 16.5003C8.50197 16.5003 9.83531 15.4753 9.83531 14.0503Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.83383 11.7581C9.83383 12.1748 9.71716 12.5581 9.51716 12.8914C9.02549 13.6998 8.01715 14.2081 6.85048 14.2081C5.68382 14.2081 4.67547 13.6914 4.18381 12.8914C3.98381 12.5581 3.86719 12.1748 3.86719 11.7581C3.86719 11.0415 4.2005 10.3998 4.73384 9.93312C5.2755 9.45812 6.01714 9.1748 6.84214 9.1748C7.66714 9.1748 8.40883 9.46645 8.9505 9.93312C9.5005 10.3914 9.83383 11.0415 9.83383 11.7581Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.83531 11.7584V14.0501C9.83531 15.4834 8.50197 16.5001 6.8603 16.5001C5.21863 16.5001 3.87695 15.4751 3.87695 14.0501V11.7584C3.87695 10.3251 5.2103 9.16675 6.8603 9.16675C7.6853 9.16675 8.42699 9.45839 8.96866 9.92506C9.50199 10.3917 9.83531 11.0417 9.83531 11.7584Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.2079 9.14171V10.8584C19.2079 11.3168 18.8412 11.6917 18.3745 11.7084H16.7412C15.8412 11.7084 15.0162 11.0501 14.9412 10.1501C14.8912 9.62507 15.0912 9.13339 15.4412 8.79173C15.7495 8.47506 16.1745 8.29175 16.6412 8.29175H18.3745C18.8412 8.30841 19.2079 8.68338 19.2079 9.14171Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.54102 8.75008V7.08341C2.54102 4.81675 3.90768 3.23341 6.03268 2.96675C6.24935 2.93341 6.47435 2.91675 6.70768 2.91675H14.2077C14.4243 2.91675 14.6327 2.92507 14.8327 2.9584C16.9827 3.2084 18.3743 4.80008 18.3743 7.08341V8.29176H16.641C16.1743 8.29176 15.7493 8.47507 15.441 8.79174C15.091 9.1334 14.891 9.62508 14.941 10.1501C15.016 11.0501 15.841 11.7084 16.741 11.7084H18.3743V12.9167C18.3743 15.4167 16.7077 17.0834 14.2077 17.0834H12.1243"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
export const IconTradeReward = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.9231 4H3.07692C2.52609 4 1.99782 4.19754 1.60832 4.54917C1.21882 4.90081 1 5.37772 1 5.875V7.75C1 8.08152 1.14588 8.39946 1.40554 8.63388C1.66521 8.8683 2.01739 9 2.38462 9H17.6154C17.9826 9 18.3348 8.8683 18.5945 8.63388C18.8541 8.39946 19 8.08152 19 7.75V5.875C19 5.37772 18.7812 4.90081 18.3917 4.54917C18.0022 4.19754 17.4739 4 16.9231 4ZM3.07692 5.25H16.9231C17.014 5.25 17.104 5.26617 17.188 5.29758C17.272 5.32898 17.3483 5.37502 17.4126 5.43306C17.4769 5.4911 17.5279 5.55999 17.5627 5.63582C17.5975 5.71165 17.6154 5.79292 17.6154 5.875V7.75H2.38462V5.875C2.38462 5.79292 2.40252 5.71165 2.43731 5.63582C2.47211 5.55999 2.5231 5.4911 2.58739 5.43306C2.65167 5.37502 2.72799 5.32898 2.81199 5.29758C2.89598 5.26617 2.98601 5.25 3.07692 5.25Z"
        fill="white"
      />
      <path
        d="M16 7.66667H3.99996C3.64634 7.66667 3.3072 7.80714 3.05715 8.05719C2.8071 8.30724 2.66663 8.64638 2.66663 9L2.66663 17.3333C2.66663 17.6869 2.8071 18.0261 3.05715 18.2761C3.3072 18.5262 3.64634 18.6667 3.99996 18.6667H16C16.3536 18.6667 16.6927 18.5262 16.9428 18.2761C17.1928 18.0261 17.3333 17.6869 17.3333 17.3333V9C17.3333 8.64638 17.1928 8.30724 16.9428 8.05719C16.6927 7.80714 16.3536 7.66667 16 7.66667ZM3.99996 9H16V17.3333H3.99996V9ZM7.11863 1.48499C7.24791 1.37881 7.41238 1.32511 7.57941 1.33456C7.74644 1.34401 7.90381 1.41591 8.02029 1.53599L8.05696 1.57699L9.97363 3.91033C10.0829 4.04331 10.1364 4.21337 10.1232 4.38495C10.1099 4.55653 10.0307 4.71632 9.90235 4.8309C9.77394 4.94548 9.60621 5.00597 9.43423 4.99971C9.26226 4.99345 9.09936 4.92094 8.97963 4.79733L8.94296 4.75633L7.02629 2.42299C6.9142 2.28634 6.86096 2.11077 6.87827 1.93488C6.89559 1.75899 6.98204 1.59717 7.11863 1.48499Z"
        fill="white"
      />
      <path
        d="M12.3333 14.0742C12.3333 13.6008 12.1887 13.3808 11.9507 13.2092C11.8373 13.1268 11.6923 13.0445 11.403 12.9072C11.0823 12.7562 10.762 12.6188 10.431 12.4745C9.98665 12.2892 9.63499 12.1452 9.54199 12.0145C9.51099 11.9665 9.49032 11.8912 9.49032 11.7675C9.49032 11.5408 9.48032 11.2868 9.94532 11.2868C10.1623 11.2868 10.4103 11.3075 10.462 11.4792C10.483 11.5478 10.483 11.5682 10.483 11.6782V12.0352H12.1577C12.1677 11.6645 12.2093 11.1358 11.837 10.8268C11.496 10.5315 10.9273 10.4972 10.4207 10.4698V9.6665H9.56265V10.4698C9.05599 10.4972 8.50832 10.5522 8.15665 10.8338C7.80532 11.1082 7.76399 11.4792 7.76399 11.8225C7.76399 12.3168 7.90865 12.5295 8.15665 12.7082C8.37399 12.8658 8.72532 13.0238 8.78732 13.0515C9.08732 13.1888 9.38699 13.3328 9.69732 13.4702C10.1313 13.6692 10.4207 13.7858 10.514 13.9438C10.5657 14.0332 10.5657 14.1705 10.5657 14.1912C10.5657 14.3628 10.5967 14.6168 9.97632 14.6168C9.61432 14.6168 9.49032 14.5068 9.44899 14.3968C9.40765 14.3078 9.41799 14.2048 9.41799 14.1772V13.8338H7.67099C7.65032 14.5342 7.69165 14.8502 8.10499 15.1178C8.49799 15.3652 8.99432 15.4062 9.16999 15.4202C9.29399 15.4335 9.42832 15.4475 9.56265 15.4542V16.3332H10.4207V15.4545C10.948 15.4132 11.4237 15.3652 11.8267 15.1178C12.2817 14.8432 12.3333 14.4588 12.3333 14.0745V14.0742Z"
        fill="white"
      />
      <path
        d="M11.9434 1.57664C12.0523 1.44267 12.209 1.35619 12.3804 1.33541C12.5518 1.31463 12.7246 1.36117 12.8624 1.46523C13.0002 1.56928 13.0922 1.72274 13.1191 1.8933C13.1461 2.06385 13.1058 2.2382 13.0067 2.37964L12.9734 2.42297L11.0567 4.7563C10.9476 4.8895 10.7911 4.9753 10.6201 4.99572C10.4491 5.01614 10.2769 4.9696 10.1394 4.86585C10.002 4.76209 9.90999 4.60918 9.88277 4.43914C9.85555 4.26909 9.89519 4.09511 9.99338 3.95364L10.0267 3.9103L11.9434 1.57697V1.57664Z"
        fill="white"
      />
    </svg>
  )
}

export const IconExportWallet = () => {
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.375 9.99877C14.375 10.0818 14.3587 10.164 14.327 10.2407C14.2952 10.3175 14.2487 10.3872 14.19 10.4459C14.1312 10.5046 14.0615 10.5511 13.9848 10.5829C13.9081 10.6146 13.8259 10.631 13.7429 10.6309H11.5625L10.625 8.73466L11.6368 6.98235C11.7206 6.83726 11.8587 6.7314 12.0205 6.68804C12.1824 6.64467 12.3549 6.66736 12.5 6.7511C12.6451 6.83494 12.751 6.97297 12.7943 7.13484C12.8377 7.29671 12.815 7.46917 12.7312 7.61432L11.7195 9.36681H13.743C13.826 9.36679 13.9082 9.38312 13.9849 9.41487C14.0616 9.44662 14.1313 9.49317 14.19 9.55186C14.2486 9.61054 14.2952 9.68022 14.3269 9.7569C14.3587 9.83359 14.375 9.91578 14.375 9.99877Z"
        fill="#FFFFFF"
      />
      <path
        d="M12.5004 13.2478C12.3552 13.3316 12.1827 13.3543 12.0208 13.3109C11.8589 13.2676 11.7209 13.1617 11.637 13.0165L10.6254 11.2642L9.61363 13.0165C9.52978 13.1616 9.39175 13.2675 9.22989 13.3109C9.06802 13.3542 8.89556 13.3315 8.75041 13.2478C8.60532 13.1639 8.49947 13.0259 8.4561 12.8641C8.41274 12.7022 8.43542 12.5297 8.51916 12.3846L9.53077 10.6321L10.6254 10.5908L11.7199 10.6321L12.7317 12.3846C12.8154 12.5297 12.8381 12.7022 12.7947 12.8641C12.7514 13.0259 12.6455 13.1639 12.5004 13.2478Z"
        fill="#FFFFFF"
      />
      <path
        d="M10.6254 8.73467L10.3402 9.50967L9.53077 9.36682L8.51917 7.61432C8.43542 7.46917 8.41274 7.29671 8.4561 7.13484C8.49947 6.97297 8.60533 6.83494 8.75042 6.7511C8.89557 6.66736 9.06803 6.64467 9.22989 6.68804C9.39176 6.7314 9.52978 6.83726 9.61363 6.98235L10.6254 8.73467Z"
        fill="#FFFFFF"
      />
      <path
        d="M10.4618 9.36865L9.72821 10.6329H7.50679C7.42379 10.6329 7.34161 10.6166 7.26493 10.5848C7.18826 10.553 7.1186 10.5065 7.05993 10.4478C7.00125 10.3891 6.95472 10.3194 6.92299 10.2427C6.89126 10.166 6.87496 10.0838 6.875 10.0008C6.87495 9.91776 6.89127 9.83554 6.92302 9.75883C6.95478 9.68211 7.00134 9.61241 7.06005 9.5537C7.11875 9.49499 7.18846 9.44843 7.26518 9.41668C7.34189 9.38493 7.42411 9.36861 7.50714 9.36865H10.4618Z"
        fill="#FFFFFF"
      />
      <path d="M11.7203 10.6329H9.53125L10.6259 8.73682L11.7203 10.6329Z" fill="#FFFFFF" />
      <path
        d="M18.0502 9.26707C18.0502 13.3421 15.0919 17.1587 11.0502 18.2754C10.7752 18.3504 10.4752 18.3504 10.2002 18.2754C6.15852 17.1587 3.2002 13.3421 3.2002 9.26707V5.60873C3.2002 4.92539 3.71687 4.1504 4.35854 3.89206L9.00019 1.99209C10.0419 1.56709 11.2169 1.56709 12.2585 1.99209L16.9002 3.89206C17.5335 4.1504 18.0585 4.92539 18.0585 5.60873L18.0502 9.26707Z"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconGoogleAuthenticator = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13.875 9.99902C13.875 10.082 13.8587 10.1643 13.827 10.241C13.7952 10.3177 13.7487 10.3874 13.69 10.4461C13.6312 10.5048 13.5615 10.5514 13.4848 10.5831C13.4081 10.6149 13.3259 10.6312 13.2429 10.6312H11.0625L10.125 8.73491L11.1368 6.98259C11.2206 6.8375 11.3587 6.73164 11.5205 6.68828C11.6824 6.64492 11.8549 6.6676 12 6.75134C12.1451 6.83519 12.251 6.97321 12.2943 7.13508C12.3377 7.29695 12.315 7.46941 12.2312 7.61456L11.2195 9.36705H13.243C13.326 9.36703 13.4082 9.38336 13.4849 9.41511C13.5616 9.44686 13.6313 9.49341 13.69 9.5521C13.7486 9.61079 13.7952 9.68046 13.8269 9.75715C13.8587 9.83383 13.875 9.91602 13.875 9.99902Z"
        fill="currentColor"
      />
      <path
        d="M11.9994 13.2478C11.8543 13.3316 11.6818 13.3543 11.5199 13.3109C11.358 13.2676 11.2199 13.1617 11.136 13.0165L10.1244 11.2642L9.11265 13.0165C9.0288 13.1616 8.89078 13.2675 8.72891 13.3109C8.56705 13.3542 8.39459 13.3315 8.24944 13.2478C8.10435 13.1639 7.99849 13.0259 7.95513 12.8641C7.91176 12.7022 7.93445 12.5297 8.01819 12.3846L9.0298 10.6321L10.1244 10.5908L11.2189 10.6321L12.2307 12.3846C12.3144 12.5297 12.3371 12.7022 12.2938 12.8641C12.2504 13.0259 12.1445 13.1639 11.9994 13.2478Z"
        fill="currentColor"
      />
      <path
        d="M10.1244 8.73491L9.83926 9.50991L9.02979 9.36706L8.01819 7.61456C7.93445 7.46941 7.91176 7.29695 7.95513 7.13508C7.99849 6.97321 8.10435 6.83519 8.24944 6.75134C8.39459 6.6676 8.56705 6.64492 8.72892 6.68828C8.89078 6.73164 9.02881 6.8375 9.11265 6.98259L10.1244 8.73491Z"
        fill="currentColor"
      />
      <path
        d="M9.96179 9.36841L9.22821 10.6327H7.00679C6.92379 10.6327 6.84161 10.6163 6.76493 10.5846C6.68826 10.5528 6.6186 10.5062 6.55993 10.4475C6.50125 10.3888 6.45472 10.3191 6.42299 10.2424C6.39126 10.1657 6.37496 10.0835 6.375 10.0005C6.37495 9.91752 6.39127 9.8353 6.42302 9.75858C6.45478 9.68187 6.50134 9.61216 6.56005 9.55345C6.61875 9.49475 6.68846 9.44818 6.76518 9.41643C6.84189 9.38468 6.92411 9.36836 7.00714 9.36841H9.96179Z"
        fill="currentColor"
      />
      <path d="M11.2203 10.6331H9.03125L10.1259 8.73706L11.2203 10.6331Z" fill="currentColor" />
      <path
        d="M17.5492 9.26683C17.5492 13.3418 14.5909 17.1585 10.5492 18.2752C10.2742 18.3502 9.97421 18.3502 9.69921 18.2752C5.65755 17.1585 2.69922 13.3418 2.69922 9.26683V5.60848C2.69922 4.92515 3.2159 4.15015 3.85756 3.89182L8.49921 1.99185C9.54088 1.56685 10.7159 1.56685 11.7575 1.99185L16.3992 3.89182C17.0326 4.15015 17.5576 4.92515 17.5576 5.60848L17.5492 9.26683Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconCardSend = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M2.04102 7.08325H12.4577"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.375 13.75H7.04167"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.125 13.75H12.4583"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.7077 11.6917V13.4251C18.7077 16.3501 17.966 17.0834 15.0077 17.0834H5.74102C2.78268 17.0834 2.04102 16.3501 2.04102 13.4251V6.57508C2.04102 3.65008 2.78268 2.91675 5.74102 2.91675H12.4577"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.041 7.91675V2.91675L18.7077 4.58341"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.0417 2.91675L15.375 4.58341"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconReceiptTime = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M17.7507 9.41674V5.86676C17.7507 2.50842 16.9673 1.66675 13.8173 1.66675H7.51732C4.36732 1.66675 3.58398 2.50842 3.58398 5.86676V15.2501C3.58398 17.4667 4.80066 17.9917 6.27566 16.4084L6.28398 16.4001C6.96731 15.6751 8.00898 15.7334 8.60064 16.5251L9.44232 17.6501"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.4173 17.4999C16.2583 17.4999 17.7507 16.0075 17.7507 14.1666C17.7507 12.3256 16.2583 10.8333 14.4173 10.8333C12.5764 10.8333 11.084 12.3256 11.084 14.1666C11.084 16.0075 12.5764 17.4999 14.4173 17.4999Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6257 13.125V13.9C14.6257 14.1917 14.4757 14.4666 14.2173 14.6166L13.584 15"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.33398 5.83325H14.0007"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.16797 9.16675H13.168"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconTelegramCircle = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clip-path="url(#clip0_23216_494568)">
        <path
          d="M18.578 20.422L20.875 9.59399C21.078 8.64101 20.531 8.26599 19.906 8.5L6.40601 13.703C5.48398 14.062 5.5 14.578 6.24999 14.812L9.70301 15.89L17.719 10.843C18.094 10.593 18.438 10.734 18.157 10.984L11.673 16.843L11.423 20.406C11.782 20.406 11.939 20.25 12.126 20.062L13.813 18.437L17.313 21.015C17.954 21.374 18.407 21.187 18.579 20.421L18.578 20.422ZM28 14C28 21.734 21.734 28 14 28C6.26601 28 0 21.734 0 14C0 6.26601 6.26601 0 14 0C21.734 0 28 6.26601 28 14Z"
          fill="#1296DB"
        />
        <path
          d="M14 0.5C21.4578 0.5 27.5 6.54215 27.5 14C27.5 21.4578 21.4578 27.5 14 27.5C6.54215 27.5 0.5 21.4578 0.5 14C0.5 6.54215 6.54215 0.5 14 0.5ZM21.0488 8.24316C20.7244 7.92878 20.2879 7.87891 19.8955 7.97949L19.7305 8.03125L19.7266 8.0332L6.22656 13.2363L6.22461 13.2373C5.96091 13.34 5.73141 13.4653 5.55664 13.6191C5.38444 13.7708 5.22685 13.9864 5.20312 14.2617C5.17813 14.5528 5.31252 14.7919 5.48633 14.9551C5.61131 15.0724 5.76552 15.1611 5.93164 15.2285L6.10059 15.2891L9.55371 16.3672L9.77441 16.4355L9.96973 16.3135L15.0596 13.1084L11.3379 16.4717L11.1885 16.6074L11.1738 16.8076L10.9238 20.3711L10.8867 20.9062H11.4229C11.6828 20.9062 11.8996 20.8469 12.0898 20.7363C12.2632 20.6355 12.3944 20.5015 12.4805 20.415L12.4795 20.4141L13.8555 19.0889L17.0166 21.418L17.042 21.4365L17.0684 21.4512C17.292 21.5764 17.5425 21.6686 17.7979 21.6855L17.7383 21.9707L18.0283 21.6797C18.129 21.6662 18.2301 21.6397 18.3291 21.5947C18.7539 21.4015 18.9665 20.9751 19.0664 20.5303L19.4453 18.8457L19.417 18.873L21.3643 9.69824C21.484 9.13606 21.4123 8.59551 21.0488 8.24316Z"
          stroke="#ECECED"
          strokeOpacity="0.08"
        />
        <path
          d="M18.578 20.4233L20.875 9.59525C21.078 8.64226 20.531 8.26724 19.906 8.50125L6.40601 13.7042C5.48398 14.0633 5.5 14.5792 6.24999 14.8133L9.70301 15.8913L17.719 10.8443C18.094 10.5943 18.438 10.7353 18.157 10.9853L11.673 16.8443L11.423 20.4073C11.782 20.4073 11.939 20.2512 12.126 20.0633L13.813 18.4382L17.313 21.0163C17.954 21.3753 18.407 21.1883 18.579 20.4223L18.578 20.4233Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_23216_494568">
          <rect width="28" height="28" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export const IconBookmark = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3.15168 8.59998H11.1517C11.3917 8.59998 11.5517 8.43998 11.5517 8.19998V1.39998C11.5517 0.919976 11.2317 0.599976 10.7517 0.599976H9.23168V4.59998L8.03168 3.79998L6.83168 4.59998V0.599976H1.95168C1.07168 0.599976 0.351685 1.31998 0.351685 2.19998V11.8C0.351685 12.68 1.07168 13.4 1.95168 13.4H10.7517C11.2317 13.4 11.5517 13.08 11.5517 12.6V11.4C11.5517 11.16 11.3917 11 11.1517 11H3.15168C2.91168 11 2.75168 10.84 2.75168 10.6V8.99998C2.75168 8.83998 2.91168 8.59998 3.15168 8.59998Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconClockStroke = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.99935 18.9584C5.05768 18.9584 1.04102 14.9417 1.04102 10.0001C1.04102 5.05841 5.05768 1.04175 9.99935 1.04175C14.941 1.04175 18.9577 5.05841 18.9577 10.0001C18.9577 14.9417 14.941 18.9584 9.99935 18.9584ZM9.99935 2.29175C5.74935 2.29175 2.29102 5.75008 2.29102 10.0001C2.29102 14.2501 5.74935 17.7084 9.99935 17.7084C14.2493 17.7084 17.7077 14.2501 17.7077 10.0001C17.7077 5.75008 14.2493 2.29175 9.99935 2.29175Z"
        fill="currentColor"
      />
      <path
        d="M13.0909 13.2747C12.9826 13.2747 12.8742 13.2497 12.7742 13.1831L10.1909 11.6414C9.54922 11.2581 9.07422 10.4164 9.07422 9.67472V6.25806C9.07422 5.91639 9.35755 5.63306 9.69922 5.63306C10.0409 5.63306 10.3242 5.91639 10.3242 6.25806V9.67472C10.3242 9.97472 10.5742 10.4164 10.8326 10.5664L13.4159 12.1081C13.7159 12.2831 13.8076 12.6664 13.6326 12.9664C13.5076 13.1664 13.2992 13.2747 13.0909 13.2747Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconClockGradient = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.99935 18.9584C5.05768 18.9584 1.04102 14.9417 1.04102 10.0001C1.04102 5.05841 5.05768 1.04175 9.99935 1.04175C14.941 1.04175 18.9577 5.05841 18.9577 10.0001C18.9577 14.9417 14.941 18.9584 9.99935 18.9584ZM9.99935 2.29175C5.74935 2.29175 2.29102 5.75008 2.29102 10.0001C2.29102 14.2501 5.74935 17.7084 9.99935 17.7084C14.2493 17.7084 17.7077 14.2501 17.7077 10.0001C17.7077 5.75008 14.2493 2.29175 9.99935 2.29175Z"
        fill="url(#paint0_linear_23216_497915)"
      />
      <path
        d="M13.0909 13.2747C12.9826 13.2747 12.8742 13.2497 12.7742 13.1831L10.1909 11.6414C9.54922 11.2581 9.07422 10.4164 9.07422 9.67472V6.25806C9.07422 5.91639 9.35755 5.63306 9.69922 5.63306C10.0409 5.63306 10.3242 5.91639 10.3242 6.25806V9.67472C10.3242 9.97472 10.5742 10.4164 10.8326 10.5664L13.4159 12.1081C13.7159 12.2831 13.8076 12.6664 13.6326 12.9664C13.5076 13.1664 13.2992 13.2747 13.0909 13.2747Z"
        fill="url(#paint1_linear_23216_497915)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_23216_497915"
          x1="1.04102"
          y1="18.9584"
          x2="19.2113"
          y2="0.031044"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_23216_497915"
          x1="9.07422"
          y1="13.2747"
          x2="16.0866"
          y2="8.83307"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const IconMessageNotificationStroke = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.99935 19.0084C9.42435 19.0084 8.88268 18.7167 8.49935 18.2084L7.24935 16.5417C7.22435 16.5084 7.12435 16.4584 7.07435 16.4584H6.66602C3.19102 16.4584 1.04102 15.5167 1.04102 10.8334V6.66675C1.04102 2.98341 2.98268 1.04175 6.66602 1.04175H11.666C12.0077 1.04175 12.291 1.32508 12.291 1.66675C12.291 2.00841 12.0077 2.29175 11.666 2.29175H6.66602C3.68268 2.29175 2.29102 3.68341 2.29102 6.66675V10.8334C2.29102 14.6001 3.58268 15.2084 6.66602 15.2084H7.08268C7.50768 15.2084 7.99102 15.4501 8.24935 15.7917L9.49935 17.4584C9.79102 17.8417 10.2077 17.8417 10.4993 17.4584L11.7493 15.7917C12.0244 15.4251 12.4577 15.2084 12.916 15.2084H13.3327C16.316 15.2084 17.7077 13.8167 17.7077 10.8334V8.33342C17.7077 7.99175 17.991 7.70842 18.3327 7.70842C18.6744 7.70842 18.9577 7.99175 18.9577 8.33342V10.8334C18.9577 14.5167 17.016 16.4584 13.3327 16.4584H12.916C12.8493 16.4584 12.791 16.4917 12.7493 16.5417L11.4993 18.2084C11.116 18.7167 10.5743 19.0084 9.99935 19.0084Z"
        fill="currentColor"
      />
      <path
        d="M9.99935 9.99992C9.53268 9.99992 9.16602 9.62492 9.16602 9.16659C9.16602 8.70825 9.54102 8.33325 9.99935 8.33325C10.4577 8.33325 10.8327 8.70825 10.8327 9.16659C10.8327 9.62492 10.466 9.99992 9.99935 9.99992Z"
        fill="currentColor"
      />
      <path
        d="M13.3333 9.99992C12.8667 9.99992 12.5 9.62492 12.5 9.16659C12.5 8.70825 12.875 8.33325 13.3333 8.33325C13.7917 8.33325 14.1667 8.70825 14.1667 9.16659C14.1667 9.62492 13.8 9.99992 13.3333 9.99992Z"
        fill="currentColor"
      />
      <path
        d="M6.66732 9.99992C6.20065 9.99992 5.83398 9.62492 5.83398 9.16659C5.83398 8.70825 6.20898 8.33325 6.66732 8.33325C7.12565 8.33325 7.50065 8.70825 7.50065 9.16659C7.50065 9.62492 7.13398 9.99992 6.66732 9.99992Z"
        fill="currentColor"
      />
      <path
        d="M16.2493 6.45842C14.7577 6.45842 13.541 5.24175 13.541 3.75008C13.541 2.25841 14.7577 1.04175 16.2493 1.04175C17.741 1.04175 18.9577 2.25841 18.9577 3.75008C18.9577 5.24175 17.741 6.45842 16.2493 6.45842ZM16.2493 2.29175C15.4493 2.29175 14.791 2.95008 14.791 3.75008C14.791 4.55008 15.4493 5.20842 16.2493 5.20842C17.0493 5.20842 17.7077 4.55008 17.7077 3.75008C17.7077 2.95008 17.0493 2.29175 16.2493 2.29175Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconMessageNotificationGradient = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.99935 19.0084C9.42435 19.0084 8.88268 18.7167 8.49935 18.2084L7.24935 16.5417C7.22435 16.5084 7.12435 16.4584 7.07435 16.4584H6.66602C3.19102 16.4584 1.04102 15.5167 1.04102 10.8334V6.66675C1.04102 2.98341 2.98268 1.04175 6.66602 1.04175H11.666C12.0077 1.04175 12.291 1.32508 12.291 1.66675C12.291 2.00841 12.0077 2.29175 11.666 2.29175H6.66602C3.68268 2.29175 2.29102 3.68341 2.29102 6.66675V10.8334C2.29102 14.6001 3.58268 15.2084 6.66602 15.2084H7.08268C7.50768 15.2084 7.99102 15.4501 8.24935 15.7917L9.49935 17.4584C9.79102 17.8417 10.2077 17.8417 10.4993 17.4584L11.7493 15.7917C12.0244 15.4251 12.4577 15.2084 12.916 15.2084H13.3327C16.316 15.2084 17.7077 13.8167 17.7077 10.8334V8.33342C17.7077 7.99175 17.991 7.70842 18.3327 7.70842C18.6744 7.70842 18.9577 7.99175 18.9577 8.33342V10.8334C18.9577 14.5167 17.016 16.4584 13.3327 16.4584H12.916C12.8493 16.4584 12.791 16.4917 12.7493 16.5417L11.4993 18.2084C11.116 18.7167 10.5743 19.0084 9.99935 19.0084Z"
        fill="url(#paint0_linear_23216_497938)"
      />
      <path
        d="M9.99935 9.99992C9.53268 9.99992 9.16602 9.62492 9.16602 9.16659C9.16602 8.70825 9.54102 8.33325 9.99935 8.33325C10.4577 8.33325 10.8327 8.70825 10.8327 9.16659C10.8327 9.62492 10.466 9.99992 9.99935 9.99992Z"
        fill="url(#paint1_linear_23216_497938)"
      />
      <path
        d="M13.3333 9.99992C12.8667 9.99992 12.5 9.62492 12.5 9.16659C12.5 8.70825 12.875 8.33325 13.3333 8.33325C13.7917 8.33325 14.1667 8.70825 14.1667 9.16659C14.1667 9.62492 13.8 9.99992 13.3333 9.99992Z"
        fill="url(#paint2_linear_23216_497938)"
      />
      <path
        d="M6.66732 9.99992C6.20065 9.99992 5.83398 9.62492 5.83398 9.16659C5.83398 8.70825 6.20898 8.33325 6.66732 8.33325C7.12565 8.33325 7.50065 8.70825 7.50065 9.16659C7.50065 9.62492 7.13398 9.99992 6.66732 9.99992Z"
        fill="url(#paint3_linear_23216_497938)"
      />
      <path
        d="M16.2493 6.45842C14.7577 6.45842 13.541 5.24175 13.541 3.75008C13.541 2.25841 14.7577 1.04175 16.2493 1.04175C17.741 1.04175 18.9577 2.25841 18.9577 3.75008C18.9577 5.24175 17.741 6.45842 16.2493 6.45842ZM16.2493 2.29175C15.4493 2.29175 14.791 2.95008 14.791 3.75008C14.791 4.55008 15.4493 5.20842 16.2493 5.20842C17.0493 5.20842 17.7077 4.55008 17.7077 3.75008C17.7077 2.95008 17.0493 2.29175 16.2493 2.29175Z"
        fill="url(#paint4_linear_23216_497938)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_23216_497938"
          x1="1.04102"
          y1="19.0084"
          x2="19.264"
          y2="0.0789645"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_23216_497938"
          x1="9.16602"
          y1="9.99992"
          x2="10.8563"
          y2="8.23923"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_23216_497938"
          x1="12.5"
          y1="9.99992"
          x2="14.1903"
          y2="8.23923"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_23216_497938"
          x1="5.83398"
          y1="9.99992"
          x2="7.52424"
          y2="8.23923"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_23216_497938"
          x1="13.541"
          y1="6.45841"
          x2="19.0344"
          y2="0.736186"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const IconArrowPair = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7.96385 6.47995L5.48386 4L3.00391 6.47995"
        stroke="#00FFB4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.48047 15.9999V4" stroke="#00FFB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12.0273 13.52L14.5073 16L16.9873 13.52"
        stroke="#F25461"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.5117 4V15.9999" stroke="#F25461" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const IconArrowPairInverse = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7.96385 6.47995L5.48386 4L3.00391 6.47995"
        stroke="#F25461"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.48047 15.9999V4" stroke="#F25461" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12.0273 13.52L14.5073 16L16.9873 13.52"
        stroke="#00FFB4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.5117 4V15.9999" stroke="#00FFB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const IconColorPaletteStroke = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5.61678 11.6975C5.50819 11.7231 5.40584 11.7703 5.31581 11.8362C5.22577 11.9022 5.14989 11.9855 5.09265 12.0813C5.03542 12.177 4.99799 12.2833 4.98259 12.3939C4.96719 12.5044 4.97413 12.6169 5.003 12.7247C5.03187 12.8324 5.08208 12.9333 5.15067 13.0214C5.21925 13.1094 5.3048 13.1827 5.40225 13.2371C5.4997 13.2914 5.60708 13.3257 5.718 13.3378C5.82893 13.3499 5.94116 13.3396 6.04804 13.3075L6.05553 13.305C6.2632 13.2427 6.43841 13.1019 6.54402 12.9125C6.64962 12.7232 6.67732 12.5001 6.62122 12.2907C6.56512 12.0813 6.42965 11.9019 6.24353 11.7907C6.05742 11.6795 5.8353 11.6452 5.62428 11.695L5.61678 11.6975ZM6.04054 7.08374C6.04054 6.83751 6.08903 6.59369 6.18326 6.36621C6.27749 6.13872 6.4156 5.93203 6.58971 5.75792C6.76382 5.58381 6.97052 5.44569 7.198 5.35147C7.42549 5.25724 7.66931 5.20874 7.91553 5.20874C8.16176 5.20874 8.40558 5.25724 8.63307 5.35147C8.86055 5.44569 9.06725 5.58381 9.24136 5.75792C9.41547 5.93203 9.55358 6.13872 9.64781 6.36621C9.74204 6.59369 9.79053 6.83751 9.79053 7.08374C9.79053 7.58102 9.59299 8.05793 9.24136 8.40957C8.88973 8.7612 8.41282 8.95874 7.91553 8.95874C7.41825 8.95874 6.94134 8.7612 6.58971 8.40957C6.23808 8.05793 6.04054 7.58102 6.04054 7.08374ZM7.91553 6.45874C7.74977 6.45874 7.5908 6.52459 7.47359 6.6418C7.35638 6.75901 7.29053 6.91798 7.29053 7.08374C7.29053 7.2495 7.35638 7.40847 7.47359 7.52568C7.5908 7.64289 7.74977 7.70874 7.91553 7.70874C8.0813 7.70874 8.24027 7.64289 8.35748 7.52568C8.47469 7.40847 8.54053 7.2495 8.54053 7.08374C8.54053 6.91798 8.47469 6.75901 8.35748 6.6418C8.24027 6.52459 8.0813 6.45874 7.91553 6.45874ZM13.7493 6.04124C13.5031 6.04124 13.2592 6.08974 13.0318 6.18397C12.8043 6.27819 12.5976 6.41631 12.4235 6.59042C12.2493 6.76453 12.1112 6.97122 12.017 7.19871C11.9228 7.42619 11.8743 7.67001 11.8743 7.91624C11.8743 8.16247 11.9228 8.40629 12.017 8.63377C12.1112 8.86126 12.2493 9.06796 12.4235 9.24207C12.5976 9.41618 12.8043 9.55429 13.0318 9.64851C13.2592 9.74274 13.5031 9.79124 13.7493 9.79124C14.2466 9.79124 14.7235 9.5937 15.0751 9.24207C15.4267 8.89043 15.6243 8.41352 15.6243 7.91624C15.6243 7.41896 15.4267 6.94205 15.0751 6.59042C14.7235 6.23878 14.2466 6.04124 13.7493 6.04124ZM13.1243 7.91624C13.1243 7.75048 13.1901 7.59151 13.3073 7.4743C13.4246 7.35709 13.5835 7.29124 13.7493 7.29124C13.915 7.29124 14.074 7.35709 14.1912 7.4743C14.3084 7.59151 14.3743 7.75048 14.3743 7.91624C14.3743 8.082 14.3084 8.24097 14.1912 8.35818C14.074 8.47539 13.915 8.54124 13.7493 8.54124C13.5835 8.54124 13.4246 8.47539 13.3073 8.35818C13.1901 8.24097 13.1243 8.082 13.1243 7.91624Z"
        fill="currentColor"
      />
      <path
        d="M9.99977 1.04126C7.62376 1.04126 5.34506 1.98513 3.66497 3.66522C1.98488 5.34531 1.04102 7.624 1.04102 10C1.04102 12.376 1.98488 14.6547 3.66497 16.3348C5.34506 18.0149 7.62376 18.9588 9.99977 18.9588H10.146C10.446 18.9638 10.8948 18.9713 11.2648 18.8675C11.5446 18.7963 11.7959 18.641 11.9848 18.4225C12.1998 18.165 12.291 17.845 12.291 17.5C12.291 16.8 11.9323 16.2675 11.686 15.9025L11.6585 15.8625C11.4548 15.5613 11.3298 15.365 11.276 15.1588C11.2323 14.9925 11.226 14.7788 11.3923 14.4463C11.5923 14.0463 11.8235 13.8838 12.1335 13.795C12.5085 13.6863 12.9935 13.68 13.7335 13.68H13.7435C14.4523 13.68 15.3223 13.68 16.3385 13.535C17.3423 13.3925 18.0573 12.9875 18.4823 12.285C18.8798 11.6288 18.9573 10.8125 18.9573 10C18.9573 7.62422 18.0136 5.34571 16.3338 3.66566C14.6539 1.9856 12.3756 1.04159 9.99977 1.04126ZM2.29102 10C2.29102 8.98768 2.49041 7.98527 2.87781 7.05C3.26521 6.11473 3.83303 5.26492 4.54886 4.5491C5.26468 3.83328 6.11449 3.26545 7.04975 2.87805C7.98502 2.49065 8.98744 2.29126 9.99977 2.29126C11.0121 2.29126 12.0145 2.49065 12.9498 2.87805C13.885 3.26545 14.7349 3.83328 15.4507 4.5491C16.1665 5.26492 16.7343 6.11473 17.1217 7.05C17.5091 7.98527 17.7085 8.98768 17.7085 10C17.7085 10.7775 17.621 11.2938 17.4135 11.6375C17.2348 11.9325 16.9085 12.1913 16.161 12.2975C15.2373 12.43 14.4448 12.43 13.7348 12.43H13.6723C13.0135 12.43 12.3498 12.43 11.7848 12.5938C11.1385 12.7813 10.6298 13.1763 10.2735 13.8875C9.98351 14.4675 9.93976 14.9913 10.0673 15.4775C10.1798 15.9075 10.4235 16.2663 10.6023 16.5325L10.6223 16.5613C10.901 16.9738 11.041 17.2113 11.041 17.4988C11.041 17.5775 11.0285 17.6113 11.0248 17.6225C10.9953 17.6426 10.9622 17.6566 10.9273 17.6638C10.7999 17.6938 10.6694 17.7089 10.5385 17.7088C10.4281 17.7111 10.3177 17.7111 10.2073 17.7088H9.99977C7.95528 17.7088 5.99453 16.8966 4.54886 15.4509C3.10319 14.0052 2.29102 12.0445 2.29102 10ZM11.0248 17.6225C11.0237 17.6236 11.0229 17.6249 11.0223 17.6263L11.0248 17.6225Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconColorPaletteGradient = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5.61678 11.6975C5.50819 11.7231 5.40584 11.7703 5.31581 11.8362C5.22577 11.9022 5.14989 11.9855 5.09265 12.0813C5.03542 12.177 4.99799 12.2833 4.98259 12.3939C4.96719 12.5044 4.97413 12.6169 5.003 12.7247C5.03187 12.8324 5.08208 12.9333 5.15067 13.0214C5.21925 13.1094 5.3048 13.1827 5.40225 13.2371C5.4997 13.2914 5.60708 13.3257 5.718 13.3378C5.82893 13.3499 5.94116 13.3396 6.04804 13.3075L6.05553 13.305C6.2632 13.2427 6.43841 13.1019 6.54402 12.9125C6.64962 12.7232 6.67732 12.5001 6.62122 12.2907C6.56512 12.0813 6.42965 11.9019 6.24353 11.7907C6.05742 11.6795 5.8353 11.6452 5.62428 11.695L5.61678 11.6975ZM6.04054 7.08374C6.04054 6.83751 6.08903 6.59369 6.18326 6.36621C6.27749 6.13872 6.4156 5.93203 6.58971 5.75792C6.76382 5.58381 6.97052 5.44569 7.198 5.35147C7.42549 5.25724 7.66931 5.20874 7.91553 5.20874C8.16176 5.20874 8.40558 5.25724 8.63307 5.35147C8.86055 5.44569 9.06725 5.58381 9.24136 5.75792C9.41547 5.93203 9.55358 6.13872 9.64781 6.36621C9.74204 6.59369 9.79053 6.83751 9.79053 7.08374C9.79053 7.58102 9.59299 8.05793 9.24136 8.40957C8.88973 8.7612 8.41282 8.95874 7.91553 8.95874C7.41825 8.95874 6.94134 8.7612 6.58971 8.40957C6.23808 8.05793 6.04054 7.58102 6.04054 7.08374ZM7.91553 6.45874C7.74977 6.45874 7.5908 6.52459 7.47359 6.6418C7.35638 6.75901 7.29053 6.91798 7.29053 7.08374C7.29053 7.2495 7.35638 7.40847 7.47359 7.52568C7.5908 7.64289 7.74977 7.70874 7.91553 7.70874C8.0813 7.70874 8.24027 7.64289 8.35748 7.52568C8.47469 7.40847 8.54053 7.2495 8.54053 7.08374C8.54053 6.91798 8.47469 6.75901 8.35748 6.6418C8.24027 6.52459 8.0813 6.45874 7.91553 6.45874ZM13.7493 6.04124C13.5031 6.04124 13.2592 6.08974 13.0318 6.18397C12.8043 6.27819 12.5976 6.41631 12.4235 6.59042C12.2493 6.76453 12.1112 6.97122 12.017 7.19871C11.9228 7.42619 11.8743 7.67001 11.8743 7.91624C11.8743 8.16247 11.9228 8.40629 12.017 8.63377C12.1112 8.86126 12.2493 9.06796 12.4235 9.24207C12.5976 9.41618 12.8043 9.55429 13.0318 9.64851C13.2592 9.74274 13.5031 9.79124 13.7493 9.79124C14.2466 9.79124 14.7235 9.5937 15.0751 9.24207C15.4267 8.89043 15.6243 8.41352 15.6243 7.91624C15.6243 7.41896 15.4267 6.94205 15.0751 6.59042C14.7235 6.23878 14.2466 6.04124 13.7493 6.04124ZM13.1243 7.91624C13.1243 7.75048 13.1901 7.59151 13.3073 7.4743C13.4246 7.35709 13.5835 7.29124 13.7493 7.29124C13.915 7.29124 14.074 7.35709 14.1912 7.4743C14.3084 7.59151 14.3743 7.75048 14.3743 7.91624C14.3743 8.082 14.3084 8.24097 14.1912 8.35818C14.074 8.47539 13.915 8.54124 13.7493 8.54124C13.5835 8.54124 13.4246 8.47539 13.3073 8.35818C13.1901 8.24097 13.1243 8.082 13.1243 7.91624Z"
        fill="url(#paint0_linear_23216_494158)"
      />
      <path
        d="M9.99977 1.04126C7.62376 1.04126 5.34506 1.98513 3.66497 3.66522C1.98488 5.34531 1.04102 7.624 1.04102 10C1.04102 12.376 1.98488 14.6547 3.66497 16.3348C5.34506 18.0149 7.62376 18.9588 9.99977 18.9588H10.146C10.446 18.9638 10.8948 18.9713 11.2648 18.8675C11.5446 18.7963 11.7959 18.641 11.9848 18.4225C12.1998 18.165 12.291 17.845 12.291 17.5C12.291 16.8 11.9323 16.2675 11.686 15.9025L11.6585 15.8625C11.4548 15.5613 11.3298 15.365 11.276 15.1588C11.2323 14.9925 11.226 14.7788 11.3923 14.4463C11.5923 14.0463 11.8235 13.8838 12.1335 13.795C12.5085 13.6863 12.9935 13.68 13.7335 13.68H13.7435C14.4523 13.68 15.3223 13.68 16.3385 13.535C17.3423 13.3925 18.0573 12.9875 18.4823 12.285C18.8798 11.6288 18.9573 10.8125 18.9573 10C18.9573 7.62422 18.0136 5.34571 16.3338 3.66566C14.6539 1.9856 12.3756 1.04159 9.99977 1.04126ZM2.29102 10C2.29102 8.98768 2.49041 7.98527 2.87781 7.05C3.26521 6.11473 3.83303 5.26492 4.54886 4.5491C5.26468 3.83328 6.11449 3.26545 7.04975 2.87805C7.98502 2.49065 8.98744 2.29126 9.99977 2.29126C11.0121 2.29126 12.0145 2.49065 12.9498 2.87805C13.885 3.26545 14.7349 3.83328 15.4507 4.5491C16.1665 5.26492 16.7343 6.11473 17.1217 7.05C17.5091 7.98527 17.7085 8.98768 17.7085 10C17.7085 10.7775 17.621 11.2938 17.4135 11.6375C17.2348 11.9325 16.9085 12.1913 16.161 12.2975C15.2373 12.43 14.4448 12.43 13.7348 12.43H13.6723C13.0135 12.43 12.3498 12.43 11.7848 12.5938C11.1385 12.7813 10.6298 13.1763 10.2735 13.8875C9.98351 14.4675 9.93976 14.9913 10.0673 15.4775C10.1798 15.9075 10.4235 16.2663 10.6023 16.5325L10.6223 16.5613C10.901 16.9738 11.041 17.2113 11.041 17.4988C11.041 17.5775 11.0285 17.6113 11.0248 17.6225C10.9953 17.6426 10.9622 17.6566 10.9273 17.6638C10.7999 17.6938 10.6694 17.7089 10.5385 17.7088C10.4281 17.7111 10.3177 17.7111 10.2073 17.7088H9.99977C7.95528 17.7088 5.99453 16.8966 4.54886 15.4509C3.10319 14.0052 2.29102 12.0445 2.29102 10ZM11.0248 17.6225C11.0237 17.6236 11.0229 17.6249 11.0223 17.6263L11.0248 17.6225Z"
        fill="url(#paint1_linear_23216_494158)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_23216_494158"
          x1="4.97461"
          y1="13.3427"
          x2="12.8484"
          y2="2.60404"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_23216_494158"
          x1="1.04102"
          y1="18.9612"
          x2="19.2148"
          y2="0.0341332"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const IconGlobalStroke = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.99935 18.9584C5.05768 18.9584 1.04102 14.9417 1.04102 10.0001C1.04102 5.05841 5.05768 1.04175 9.99935 1.04175C14.941 1.04175 18.9577 5.05841 18.9577 10.0001C18.9577 14.9417 14.941 18.9584 9.99935 18.9584ZM9.99935 2.29175C5.74935 2.29175 2.29102 5.75008 2.29102 10.0001C2.29102 14.2501 5.74935 17.7084 9.99935 17.7084C14.2493 17.7084 17.7077 14.2501 17.7077 10.0001C17.7077 5.75008 14.2493 2.29175 9.99935 2.29175Z"
        fill="currentColor"
      />
      <path
        d="M7.49922 18.125H6.66589C6.32422 18.125 6.04089 17.8417 6.04089 17.5C6.04089 17.1583 6.30755 16.8833 6.64922 16.875C5.34089 12.4083 5.34089 7.59167 6.64922 3.125C6.30755 3.11667 6.04089 2.84167 6.04089 2.5C6.04089 2.15833 6.32422 1.875 6.66589 1.875H7.49922C7.69922 1.875 7.89089 1.975 8.00755 2.13333C8.12422 2.3 8.15755 2.50833 8.09089 2.7C6.52422 7.40833 6.52422 12.5917 8.09089 17.3083C8.15755 17.5 8.12422 17.7083 8.00755 17.875C7.89089 18.025 7.69922 18.125 7.49922 18.125Z"
        fill="currentColor"
      />
      <path
        d="M12.5 18.1247C12.4333 18.1247 12.3667 18.1164 12.3 18.0914C11.975 17.9831 11.7917 17.6247 11.9083 17.2997C13.475 12.5914 13.475 7.40808 11.9083 2.69141C11.8 2.36641 11.975 2.00808 12.3 1.89974C12.6333 1.79141 12.9833 1.96641 13.0917 2.29141C14.75 7.25808 14.75 12.7247 13.0917 17.6831C13.0083 17.9581 12.7583 18.1247 12.5 18.1247Z"
        fill="currentColor"
      />
      <path
        d="M10 14.3332C7.675 14.3332 5.35833 14.0082 3.125 13.3499C3.11667 13.6832 2.84167 13.9582 2.5 13.9582C2.15833 13.9582 1.875 13.6749 1.875 13.3332V12.4999C1.875 12.2999 1.975 12.1082 2.13333 11.9916C2.3 11.8749 2.50833 11.8416 2.7 11.9082C7.40833 13.4749 12.6 13.4749 17.3083 11.9082C17.5 11.8416 17.7083 11.8749 17.875 11.9916C18.0417 12.1082 18.1333 12.2999 18.1333 12.4999V13.3332C18.1333 13.6749 17.85 13.9582 17.5083 13.9582C17.1667 13.9582 16.8917 13.6916 16.8833 13.3499C14.6417 14.0082 12.325 14.3332 10 14.3332Z"
        fill="currentColor"
      />
      <path
        d="M17.4992 8.12521C17.4325 8.12521 17.3658 8.11688 17.2992 8.09188C12.5908 6.52521 7.39917 6.52521 2.69084 8.09188C2.3575 8.20021 2.0075 8.02521 1.89917 7.70021C1.79917 7.36688 1.97417 7.01688 2.29917 6.90855C7.26584 5.25021 12.7325 5.25021 17.6908 6.90855C18.0158 7.01688 18.1992 7.37521 18.0825 7.70021C18.0075 7.95854 17.7575 8.12521 17.4992 8.12521Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconGlobalGradient = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.99935 18.9584C5.05768 18.9584 1.04102 14.9417 1.04102 10.0001C1.04102 5.05841 5.05768 1.04175 9.99935 1.04175C14.941 1.04175 18.9577 5.05841 18.9577 10.0001C18.9577 14.9417 14.941 18.9584 9.99935 18.9584ZM9.99935 2.29175C5.74935 2.29175 2.29102 5.75008 2.29102 10.0001C2.29102 14.2501 5.74935 17.7084 9.99935 17.7084C14.2493 17.7084 17.7077 14.2501 17.7077 10.0001C17.7077 5.75008 14.2493 2.29175 9.99935 2.29175Z"
        fill="url(#paint0_linear_23216_494182)"
      />
      <path
        d="M7.49922 18.125H6.66589C6.32422 18.125 6.04089 17.8417 6.04089 17.5C6.04089 17.1583 6.30755 16.8833 6.64922 16.875C5.34089 12.4083 5.34089 7.59167 6.64922 3.125C6.30755 3.11667 6.04089 2.84167 6.04089 2.5C6.04089 2.15833 6.32422 1.875 6.66589 1.875H7.49922C7.69922 1.875 7.89089 1.975 8.00755 2.13333C8.12422 2.3 8.15755 2.50833 8.09089 2.7C6.52422 7.40833 6.52422 12.5917 8.09089 17.3083C8.15755 17.5 8.12422 17.7083 8.00755 17.875C7.89089 18.025 7.69922 18.125 7.49922 18.125Z"
        fill="url(#paint1_linear_23216_494182)"
      />
      <path
        d="M12.5 18.1247C12.4333 18.1247 12.3667 18.1164 12.3 18.0914C11.975 17.9831 11.7917 17.6247 11.9083 17.2997C13.475 12.5914 13.475 7.40808 11.9083 2.69141C11.8 2.36641 11.975 2.00808 12.3 1.89974C12.6333 1.79141 12.9833 1.96641 13.0917 2.29141C14.75 7.25808 14.75 12.7247 13.0917 17.6831C13.0083 17.9581 12.7583 18.1247 12.5 18.1247Z"
        fill="url(#paint2_linear_23216_494182)"
      />
      <path
        d="M10 14.3332C7.675 14.3332 5.35833 14.0082 3.125 13.3499C3.11667 13.6832 2.84167 13.9582 2.5 13.9582C2.15833 13.9582 1.875 13.6749 1.875 13.3332V12.4999C1.875 12.2999 1.975 12.1082 2.13333 11.9916C2.3 11.8749 2.50833 11.8416 2.7 11.9082C7.40833 13.4749 12.6 13.4749 17.3083 11.9082C17.5 11.8416 17.7083 11.8749 17.875 11.9916C18.0417 12.1082 18.1333 12.2999 18.1333 12.4999V13.3332C18.1333 13.6749 17.85 13.9582 17.5083 13.9582C17.1667 13.9582 16.8917 13.6916 16.8833 13.3499C14.6417 14.0082 12.325 14.3332 10 14.3332Z"
        fill="url(#paint3_linear_23216_494182)"
      />
      <path
        d="M17.4992 8.12521C17.4325 8.12521 17.3658 8.11688 17.2992 8.09188C12.5908 6.52521 7.39917 6.52521 2.69084 8.09188C2.3575 8.20021 2.0075 8.02521 1.89917 7.70021C1.79917 7.36688 1.97417 7.01688 2.29917 6.90855C7.26584 5.25021 12.7325 5.25021 17.6908 6.90855C18.0158 7.01688 18.1992 7.37521 18.0825 7.70021C18.0075 7.95854 17.7575 8.12521 17.4992 8.12521Z"
        fill="url(#paint4_linear_23216_494182)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_23216_494182"
          x1="1.04102"
          y1="18.9584"
          x2="19.2113"
          y2="0.0310441"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_23216_494182"
          x1="5.66797"
          y1="18.125"
          x2="10.7375"
          y2="17.3266"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_23216_494182"
          x1="11.873"
          y1="18.1247"
          x2="16.9535"
          y2="17.3232"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_23216_494182"
          x1="1.875"
          y1="14.3332"
          x2="2.58481"
          y2="9.44458"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_23216_494182"
          x1="1.87109"
          y1="8.12521"
          x2="2.5822"
          y2="3.23395"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const IconXbitLogo = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 41 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13.4482 20.9539C13.4625 25.6498 18.1152 28.9163 22.5566 27.2771C25.1632 26.3148 26.9476 23.7433 26.9385 20.9539H35.0693C35.1101 25.8785 32.5636 30.5829 28.5234 33.3172C24.2976 36.1764 18.8225 36.6666 14.1494 34.5867C8.83993 32.2239 5.26237 26.8225 5.31738 20.9539H13.4482ZM2.54785 0.00856781C1.59509 4.49137 2.75446 9.36452 7.35059 11.1599C11.4265 12.7515 17.7452 13.436 22.0898 13.2263C25.1442 13.0788 31.2124 12.1524 33.8662 10.7234C37.6805 8.66907 38.5955 4.07261 37.7207 0.097435C38.0036 0.0403899 38.2946 0.524922 38.4561 0.748802C40.486 3.56126 40.6997 8.51829 39.6299 11.7312C37.3843 18.4751 30.0662 20.2134 23.7471 20.7127C23.2319 16.3429 17.1739 16.3721 16.6064 20.7156C10.3598 20.2517 2.95825 18.515 0.679688 11.8699C-0.4401 8.60318 -0.257242 3.57208 1.83691 0.713646C1.91214 0.611124 2.43494 -0.0846334 2.54785 0.00856781Z"
        fill="url(#paint0_linear_606_3791)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_606_3791"
          x1="17.3337"
          y1="8.96527"
          x2="20.1321"
          y2="35.8623"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#8870FF" />
          <stop offset="1" stop-color="#AE70FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const IconShareStroke = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12.3555 0.400146C13.7109 0.400146 14.8095 1.49885 14.8096 2.85425C14.8096 4.20966 13.7109 5.30835 12.3555 5.30835C11.5805 5.30824 10.8901 4.94854 10.4404 4.38745L5.93359 7.11792C6.03931 7.39189 6.10054 7.68852 6.10059 7.99976C6.10059 8.28622 6.04822 8.56057 5.95801 8.81616L10.5254 11.5144C10.9748 11.0106 11.6272 10.6922 12.3555 10.6921C13.7109 10.6921 14.8096 11.7908 14.8096 13.1462C14.8094 14.5015 13.7108 15.6003 12.3555 15.6003C11.0003 15.6002 9.90155 14.5014 9.90137 13.1462C9.90137 12.861 9.95249 12.5875 10.042 12.3328L5.47363 9.63354C5.02423 10.1361 4.3727 10.4539 3.64551 10.4539C2.29028 10.4536 1.19141 9.35503 1.19141 7.99976C1.19159 6.64464 2.29039 5.54587 3.64551 5.54565C4.34764 5.54565 4.97942 5.84254 5.42676 6.31519L10.001 3.5437C9.93703 3.3249 9.90137 3.09372 9.90137 2.85425C9.90139 1.49897 11.0002 0.400333 12.3555 0.400146ZM12.3555 11.6414C11.5249 11.6415 10.8516 12.3156 10.8516 13.1462C10.8517 13.9767 11.525 14.65 12.3555 14.6501C13.1861 14.6501 13.8602 13.9768 13.8604 13.1462C13.8604 12.3155 13.1862 11.6414 12.3555 11.6414ZM3.64551 6.49585C2.81507 6.49606 2.14179 7.16931 2.1416 7.99976C2.1416 8.83036 2.81496 9.50443 3.64551 9.50464C4.47624 9.50464 5.15039 8.83049 5.15039 7.99976C5.1502 7.16918 4.47612 6.49585 3.64551 6.49585ZM12.3555 1.35034C11.5249 1.35053 10.8516 2.02365 10.8516 2.85425C10.8516 3.68486 11.5249 4.35797 12.3555 4.35815C13.1862 4.35815 13.8604 3.68498 13.8604 2.85425C13.8603 2.02353 13.1862 1.35034 12.3555 1.35034Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.19141 8.0001C1.19141 6.64469 2.2902 5.5459 3.64561 5.5459C5.00102 5.5459 6.09981 6.64469 6.09981 8.0001C6.09981 9.35551 5.00102 10.4543 3.64561 10.4543C2.2902 10.4543 1.19141 9.35551 1.19141 8.0001ZM3.64561 6.49591C2.81488 6.49591 2.14142 7.16937 2.14142 8.0001C2.14142 8.83083 2.81488 9.50429 3.64561 9.50429C4.47634 9.50429 5.1498 8.83083 5.1498 8.0001C5.1498 7.16937 4.47634 6.49591 3.64561 6.49591Z"
        fill="white"
      />
    </svg>
  )
}

export const IconShareGradient = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M15.4434 0.5C17.1375 0.5 18.5115 1.87328 18.5117 3.56738C18.5117 5.26164 17.1376 6.63574 15.4434 6.63574C14.4748 6.6356 13.6119 6.1856 13.0498 5.48438L7.41602 8.89844C7.54797 9.24075 7.62402 9.61118 7.62402 10C7.62402 10.3579 7.55896 10.7002 7.44629 11.0195L13.1543 14.3936C13.7161 13.7631 14.5325 13.3644 15.4434 13.3643C17.1376 13.3643 18.5117 14.7384 18.5117 16.4326C18.5115 18.1267 17.1375 19.5 15.4434 19.5C13.7494 19.4998 12.3762 18.1266 12.376 16.4326C12.376 16.0762 12.439 15.7343 12.5508 15.416L6.84082 12.042C6.27912 12.6699 5.46543 13.0673 4.55664 13.0674C2.86238 13.0674 1.48828 11.6943 1.48828 10C1.48828 8.30574 2.86238 6.93262 4.55664 6.93262C5.43408 6.93268 6.22312 7.30297 6.78223 7.89355L12.499 4.42969C12.4191 4.15623 12.376 3.86666 12.376 3.56738C12.3762 1.87343 13.7494 0.500244 15.4434 0.5ZM15.4434 14.5518C14.4052 14.552 13.5635 15.3944 13.5635 16.4326C13.5637 17.4707 14.4053 18.3123 15.4434 18.3125C16.4816 18.3125 17.324 17.4709 17.3242 16.4326C17.3242 15.3942 16.4818 14.5518 15.4434 14.5518ZM4.55664 8.12012C3.51823 8.12012 2.67578 8.96159 2.67578 10C2.67578 11.0384 3.51823 11.8799 4.55664 11.8799C5.59495 11.8798 6.43652 11.0383 6.43652 10C6.43652 8.96166 5.59495 8.12023 4.55664 8.12012ZM15.4434 1.6875C14.4053 1.68774 13.5637 2.52928 13.5635 3.56738C13.5635 4.60565 14.4052 5.448 15.4434 5.44824C16.4818 5.44824 17.3242 4.6058 17.3242 3.56738C17.324 2.52913 16.4817 1.6875 15.4434 1.6875Z"
        fill="url(#paint0_linear_23216_494223)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_23216_494223"
          x1="1.48828"
          y1="19.5"
          x2="20.7274"
          y2="1.54405"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const IconEditStroke = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13.233 6.55343C13.1864 6.55343 13.1397 6.54677 13.0997 6.53343C11.3464 6.0401 9.95305 4.64677 9.45971 2.89343C9.38638 2.62677 9.53971 2.35343 9.80638 2.27343C10.073 2.2001 10.3464 2.35343 10.4197 2.6201C10.8197 4.0401 11.9464 5.16677 13.3664 5.56677C13.633 5.6401 13.7864 5.9201 13.713 6.18677C13.653 6.41343 13.453 6.55343 13.233 6.55343Z"
        fill="white"
      />
      <path
        d="M10.0007 15.1666H6.00065C2.38065 15.1666 0.833984 13.6199 0.833984 9.99992V5.99992C0.833984 2.37992 2.38065 0.833252 6.00065 0.833252H7.33398C7.60732 0.833252 7.83398 1.05992 7.83398 1.33325C7.83398 1.60659 7.60732 1.83325 7.33398 1.83325H6.00065C2.92732 1.83325 1.83398 2.92658 1.83398 5.99992V9.99992C1.83398 13.0733 2.92732 14.1666 6.00065 14.1666H10.0007C13.074 14.1666 14.1673 13.0733 14.1673 9.99992V8.66658C14.1673 8.39325 14.394 8.16658 14.6673 8.16658C14.9406 8.16658 15.1673 8.39325 15.1673 8.66658V9.99992C15.1673 13.6199 13.6207 15.1666 10.0007 15.1666Z"
        fill="white"
      />
      <path
        d="M5.66688 11.7934C5.26022 11.7934 4.88688 11.6467 4.61355 11.38C4.28688 11.0534 4.14688 10.58 4.22022 10.08L4.50688 8.07337C4.56022 7.68671 4.81355 7.18671 5.08688 6.91337L10.3402 1.66004C11.6669 0.333372 13.0135 0.333372 14.3402 1.66004C15.0669 2.38671 15.3935 3.12671 15.3269 3.86671C15.2669 4.46671 14.9469 5.05337 14.3402 5.65337L9.08688 10.9067C8.81355 11.18 8.31355 11.4334 7.92688 11.4867L5.92022 11.7734C5.83355 11.7934 5.74688 11.7934 5.66688 11.7934ZM11.0469 2.36671L5.79355 7.62004C5.66688 7.74671 5.52022 8.04004 5.49355 8.21337L5.20688 10.22C5.18022 10.4134 5.22022 10.5734 5.32022 10.6734C5.42022 10.7734 5.58022 10.8134 5.77355 10.7867L7.78022 10.5C7.95355 10.4734 8.25355 10.3267 8.37355 10.2L13.6269 4.94671C14.0602 4.51337 14.2869 4.12671 14.3202 3.76671C14.3602 3.33337 14.1335 2.87337 13.6269 2.36004C12.5602 1.29337 11.8269 1.59337 11.0469 2.36671Z"
        fill="white"
      />
    </svg>
  )
}

export const IconEditGradient = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12.4993 18.9584H7.49935C2.97435 18.9584 1.04102 17.0251 1.04102 12.5001V7.50008C1.04102 2.97508 2.97435 1.04175 7.49935 1.04175H9.16602C9.50768 1.04175 9.79102 1.32508 9.79102 1.66675C9.79102 2.00841 9.50768 2.29175 9.16602 2.29175H7.49935C3.65768 2.29175 2.29102 3.65841 2.29102 7.50008V12.5001C2.29102 16.3417 3.65768 17.7084 7.49935 17.7084H12.4993C16.341 17.7084 17.7077 16.3417 17.7077 12.5001V10.8334C17.7077 10.4917 17.991 10.2084 18.3327 10.2084C18.6744 10.2084 18.9577 10.4917 18.9577 10.8334V12.5001C18.9577 17.0251 17.0243 18.9584 12.4993 18.9584Z"
        fill="url(#paint0_linear_23216_494243)"
      />
      <path
        d="M7.08409 14.7417C6.57576 14.7417 6.10909 14.5584 5.76742 14.225C5.35909 13.8167 5.18409 13.225 5.27576 12.6L5.63409 10.0917C5.70076 9.60838 6.01742 8.98338 6.35909 8.64172L12.9258 2.07505C14.5841 0.416716 16.2674 0.416716 17.9258 2.07505C18.8341 2.98338 19.2424 3.90838 19.1591 4.83338C19.0841 5.58338 18.6841 6.31672 17.9258 7.06672L11.3591 13.6334C11.0174 13.975 10.3924 14.2917 9.90909 14.3584L7.40076 14.7167C7.29242 14.7417 7.18409 14.7417 7.08409 14.7417ZM13.8091 2.95838L7.24242 9.52505C7.08409 9.68338 6.90076 10.05 6.86742 10.2667L6.50909 12.775C6.47576 13.0167 6.52576 13.2167 6.65076 13.3417C6.77576 13.4667 6.97576 13.5167 7.21742 13.4834L9.72576 13.125C9.94243 13.0917 10.3174 12.9084 10.4674 12.75L17.0341 6.18338C17.5758 5.64172 17.8591 5.15838 17.9008 4.70838C17.9508 4.16672 17.6674 3.59172 17.0341 2.95005C15.7008 1.61672 14.7841 1.99172 13.8091 2.95838Z"
        fill="url(#paint1_linear_23216_494243)"
      />
      <path
        d="M16.5403 8.19173C16.482 8.19173 16.4237 8.1834 16.3737 8.16673C14.182 7.55006 12.4403 5.8084 11.8237 3.61673C11.732 3.2834 11.9237 2.94173 12.257 2.84173C12.5903 2.75006 12.932 2.94173 13.0237 3.27506C13.5237 5.05006 14.932 6.4584 16.707 6.9584C17.0403 7.05006 17.232 7.40006 17.1403 7.7334C17.0653 8.01673 16.8153 8.19173 16.5403 8.19173Z"
        fill="url(#paint2_linear_23216_494243)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_23216_494243"
          x1="1.04102"
          y1="18.9584"
          x2="19.2113"
          y2="0.031044"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_23216_494243"
          x1="5.25195"
          y1="14.7417"
          x2="19.359"
          y2="0.0391888"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_23216_494243"
          x1="11.8008"
          y1="8.19173"
          x2="17.2501"
          y2="2.52636"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.45684" stopColor="white" />
          <stop offset="0.61684" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const IconPlus = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M14.5992 9.70005H3.39922C3.01655 9.70005 2.69922 9.38272 2.69922 9.00005C2.69922 8.61738 3.01655 8.30005 3.39922 8.30005H14.5992C14.9819 8.30005 15.2992 8.61738 15.2992 9.00005C15.2992 9.38272 14.9819 9.70005 14.5992 9.70005Z"
        fill="currentColor"
        stroke="black"
        strokeWidth="0.9"
      />
      <path
        d="M9.00078 15.3C8.61811 15.3 8.30078 14.9826 8.30078 14.6V3.39995C8.30078 3.01728 8.61811 2.69995 9.00078 2.69995C9.38345 2.69995 9.70078 3.01728 9.70078 3.39995V14.6C9.70078 14.9826 9.38345 15.3 9.00078 15.3Z"
        fill="currentColor"
        stroke="black"
        strokeWidth="0.9"
      />
    </svg>
  )
}

export const IconTriangleDown = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13.5229 7.50195H9.81472H6.47559C5.90419 7.50195 5.61849 8.26087 6.02323 8.70575L9.10642 12.0947C9.60045 12.6377 10.404 12.6377 10.898 12.0947L12.0706 10.8058L13.9812 8.70575C14.38 8.26087 14.0943 7.50195 13.5229 7.50195Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const NewIconTriangleDown = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5.26799 6.5791C4.86821 7.05848 4.13179 7.05848 3.73201 6.5791L0.238901 2.39046C-0.304218 1.7392 0.158881 0.75 1.00689 0.75L7.99311 0.750001C8.84112 0.750001 9.30422 1.7392 8.7611 2.39047L5.26799 6.5791Z"
        fill="#524F56"
      />
    </svg>
  )
}

export const IconWalletGradient = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clip-path="url(#clip0_23503_98995)">
        <path
          d="M13 3.47097C14.1046 3.47097 15 4.3664 15 5.47097V7.47097H10.5C9.67157 7.47097 9 8.14254 9 8.97097C9.00001 9.79939 9.67158 10.471 10.5 10.471H15V13.471C15 14.5755 14.1046 15.471 13 15.471H2C0.895438 15.471 1.25308e-05 14.5755 0 13.471V5.47097C1.28853e-07 4.3664 0.895431 3.47097 2 3.47097H13ZM10.5 8.22097C10.9142 8.22097 11.25 8.55676 11.25 8.97097C11.25 9.38517 10.9142 9.72097 10.5 9.72097C10.0858 9.72097 9.75001 9.38517 9.75 8.97097C9.75 8.55676 10.0858 8.22097 10.5 8.22097ZM8.68164 0.267844C9.6381 -0.284081 10.8608 0.04397 11.4131 1.00027L12.2617 2.47097H4.86621L8.68164 0.267844Z"
          fill="url(#paint0_linear_23503_98995)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_23503_98995"
          x1="4"
          y1="15"
          x2="15.4495"
          y2="0.351177"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E149F8" />
          <stop offset="0.28" stopColor="#9945FF" />
          <stop offset="0.92" stop-color="#00F3AB" />
        </linearGradient>
        <clipPath id="clip0_23503_98995">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export const IconEye = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.33317 7.99998C9.33317 7.26255 8.73727 6.66665 7.99984 6.66665C7.26241 6.66665 6.6665 7.26255 6.6665 7.99998C6.6665 8.73741 7.26241 9.33331 7.99984 9.33331C8.73727 9.33331 9.33317 8.73741 9.33317 7.99998Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.99984 12.3334C10.2846 12.3334 12.4141 11.2441 13.8963 9.35893C14.4788 8.62056 14.4788 7.37948 13.8963 6.64111C12.4141 4.75591 10.2846 3.66669 7.99984 3.66669C5.71505 3.66669 3.5856 4.75591 2.1034 6.64111C1.52087 7.37948 1.52087 8.62056 2.1034 9.35893C3.5856 11.2441 5.71505 12.3334 7.99984 12.3334Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconEyeSlash = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M2 5.33331C2.21157 5.73975 2.53215 6.11678 2.94092 6.45178C4.087 7.39108 5.92633 7.99998 8 7.99998C10.0737 7.99998 11.913 7.39108 13.0591 6.45178C13.4678 6.11678 13.7884 5.73975 14 5.33331"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.65869 8L10.3489 10.5758" stroke="#878787" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.4512 7.11786L14.3368 9.00346" stroke="#878787" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.6665 9.00349L3.55212 7.11786" stroke="#878787" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.64258 10.5758L6.33275 8" stroke="#878787" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const IconEyeSlash2 = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.51818 6.48155L6.48223 9.51751C6.09223 9.12752 5.85223 8.59352 5.85223 7.99953C5.85223 6.81155 6.81222 5.85156 8.0002 5.85156C8.5942 5.85156 9.12819 6.09156 9.51818 6.48155Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.4918 4.26183C10.4418 3.46984 9.24181 3.03784 7.99983 3.03784C5.88185 3.03784 3.90788 4.28582 2.5339 6.4458C1.99391 7.29178 1.99391 8.71376 2.5339 9.55975C3.00789 10.3037 3.55989 10.9457 4.15988 11.4617"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.85223 12.5173C6.53622 12.8053 7.26221 12.9613 8.0002 12.9613C10.1182 12.9613 12.0921 11.7133 13.4661 9.55332C14.0061 8.70733 14.0061 7.28535 13.4661 6.43936C13.2681 6.12737 13.0521 5.83337 12.8301 5.55737"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.1054 8.42065C9.94937 9.26664 9.25938 9.95663 8.41339 10.1126"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6.48194 9.51831L2 14.0002" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.0002 2L9.51825 6.48194" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const IconCheckbox = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect
        x="2.33314"
        y="2.33407"
        width="11.3333"
        height="11.3333"
        rx="2.33333"
        stroke="currentColor"
        strokeWidth="0.666667"
      />
    </svg>
  )
}

export const IconCheckboxChecked = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect
        x="2.33314"
        y="2.33407"
        width="11.3333"
        height="11.3333"
        rx="2.33333"
        stroke="currentColor"
        strokeWidth="0.666667"
      />
      <rect x="4.00013" y="3.99951" width="8" height="8" rx="2" fill="currentColor" />
    </svg>
  )
}

export const IconKey = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12.1554 9.56406C11.0565 10.6576 9.48284 10.9937 8.10122 10.5616L5.58871 13.0688C5.40734 13.2555 5.04993 13.3675 4.79388 13.3302L3.63097 13.1701C3.24689 13.1168 2.88949 12.754 2.83081 12.37L2.67078 11.2071C2.63344 10.951 2.75613 10.5936 2.93216 10.4122L5.43934 7.90506C5.01259 6.51811 5.34332 4.94445 6.44221 3.8509C8.01587 2.27724 10.5711 2.27724 12.15 3.8509C13.729 5.42455 13.729 7.99041 12.1554 9.56406Z"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.27417 10.9297L6.50109 12.1566"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33337 7.46751C9.77528 7.46751 10.1335 7.10927 10.1335 6.66735C10.1335 6.22543 9.77528 5.86719 9.33337 5.86719C8.89145 5.86719 8.5332 6.22543 8.5332 6.66735C8.5332 7.10927 8.89145 7.46751 9.33337 7.46751Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconExport = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6.21362 4.33289L7.92029 2.62622L9.62696 4.33289"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.91992 9.4531V2.6731"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.66675 8C2.66675 10.9467 4.66675 13.3333 8.00008 13.3333C11.3334 13.3333 13.3334 10.9467 13.3334 8"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconArrowDown = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12.0465 9.62012L7.99979 13.6668L3.95312 9.62012"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 3V13.5533"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconArrowDown2 = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M14.0669 7.56641C14.311 7.32233 14.311 6.92572 14.0669 6.68164C13.8229 6.43756 13.4263 6.43756 13.1822 6.68164L9.62456 10.2393L6.06694 6.68164C5.82286 6.43756 5.42625 6.43756 5.18218 6.68164C4.9381 6.92572 4.9381 7.32233 5.18218 7.56641L9.18218 11.5664L9.62456 12.0078L10.0669 11.5664L14.0669 7.56641Z" fill="currentColor"/>
    </svg>
  )
}

export const IconCopy = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7.39967 15.1666H4.59967C1.99301 15.1666 0.833008 14.0066 0.833008 11.3999V8.59992C0.833008 5.99325 1.99301 4.83325 4.59967 4.83325H7.39967C10.0063 4.83325 11.1663 5.99325 11.1663 8.59992V11.3999C11.1663 14.0066 10.0063 15.1666 7.39967 15.1666ZM4.59967 5.83325C2.53301 5.83325 1.83301 6.53325 1.83301 8.59992V11.3999C1.83301 13.4666 2.53301 14.1666 4.59967 14.1666H7.39967C9.46634 14.1666 10.1663 13.4666 10.1663 11.3999V8.59992C10.1663 6.53325 9.46634 5.83325 7.39967 5.83325H4.59967Z"
        fill="currentColor"
      />
      <path
        d="M11.3997 11.1666H10.6663C10.393 11.1666 10.1663 10.9399 10.1663 10.6666V8.59992C10.1663 6.53325 9.46634 5.83325 7.39967 5.83325H5.33301C5.05967 5.83325 4.83301 5.60659 4.83301 5.33325V4.59992C4.83301 1.99325 5.99301 0.833252 8.59967 0.833252H11.3997C14.0063 0.833252 15.1663 1.99325 15.1663 4.59992V7.39992C15.1663 10.0066 14.0063 11.1666 11.3997 11.1666ZM11.1663 10.1666H11.3997C13.4663 10.1666 14.1663 9.46659 14.1663 7.39992V4.59992C14.1663 2.53325 13.4663 1.83325 11.3997 1.83325H8.59967C6.53301 1.83325 5.83301 2.53325 5.83301 4.59992V4.83325H7.39967C10.0063 4.83325 11.1663 5.99325 11.1663 8.59992V10.1666Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconTwitter = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M11.5729 2.18164H13.7199L9.02988 7.26464L14.5469 14.1816H10.2269L6.84288 9.98664L2.97188 14.1816H0.822875L5.83988 8.74464L0.546875 2.18164H4.97688L8.03488 6.01564L11.5729 2.18164ZM10.8189 12.9636H12.0089L4.32988 3.33564H3.05388L10.8189 12.9636Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconTelegram2 = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6.37989 13.274L6.60205 9.91777L12.6957 4.42717C12.9654 4.1812 12.6401 4.06219 12.2831 4.27642L4.76128 9.02912L1.50818 7.99764C0.809949 7.79929 0.802014 7.31529 1.66686 6.96617L14.3381 2.07859C14.9173 1.81675 15.4727 2.22141 15.2505 3.11006L13.0924 13.274C12.9416 13.996 12.5052 14.1706 11.9022 13.8374L8.61739 11.4094L7.03845 12.9408C6.85595 13.1233 6.7052 13.274 6.37989 13.274Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconClose = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clip-path="url(#clip0_62522_1414193)">
        <path d="M7 7L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0_62522_1414193">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export const IconArrowLeft1 = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10.25 5L3.25 11.8772L10.25 19" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export const IconArrowRight1 = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M13.75 19L20.75 12.1228L13.75 5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export const IconCustomerSupport = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.99935 1.66675C13.8653 1.66675 17.008 4.67279 17.0814 8.40804L17.0827 8.54175V8.95841H15.7948V8.54175C15.7948 5.43515 13.2001 2.91675 9.99935 2.91675C6.84306 2.91675 4.27609 5.36568 4.20539 8.41265L4.20389 8.54175V8.95841H2.91602V8.54175C2.91602 4.74479 6.08733 1.66675 9.99935 1.66675Z"
        fill="currentColor"
      />
      <rect x="2.29102" y="8.54175" width="2.5" height="5" rx="0.833333" stroke="currentColor" strokeWidth="1.25" />
      <rect x="15.209" y="8.54175" width="2.5" height="5" rx="0.833333" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M17.1518 14.0186C16.7103 16.024 15.1042 17.4056 12.437 18.1699C12.4219 18.1766 12.4062 18.1825 12.3891 18.1855C12.3836 18.1871 12.3781 18.1889 12.3725 18.1904C12.3725 18.1904 12.37 18.1898 12.3657 18.1895L8.90183 18.7998C8.6545 18.8434 8.42435 18.66 8.41257 18.4092L8.33445 16.7305C8.32465 16.5211 8.47181 16.3372 8.6782 16.3008L11.4399 15.8135C11.6405 15.7781 11.8378 15.893 11.9057 16.085L12.2055 16.9355C14.3426 16.3011 15.5469 15.2757 15.9057 13.8574L15.9311 13.75L17.1518 14.0186Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const IconPreferences = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M16.625 15.5C17.4534 15.5 18.125 14.8284 18.125 14C18.125 13.1716 17.4534 12.5 16.625 12.5C15.7966 12.5 15.125 13.1716 15.125 14C15.125 14.8284 15.7966 15.5 16.625 15.5Z"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.625 14.4402V13.5602C11.625 13.0402 12.05 12.6102 12.575 12.6102C13.48 12.6102 13.85 11.9702 13.395 11.1852C13.135 10.7352 13.29 10.1502 13.745 9.89021L14.61 9.39521C15.005 9.16021 15.515 9.30021 15.75 9.69521L15.805 9.79021C16.255 10.5752 16.995 10.5752 17.45 9.79021L17.505 9.69521C17.74 9.30021 18.25 9.16021 18.645 9.39521L19.51 9.89021C19.965 10.1502 20.12 10.7352 19.86 11.1852C19.405 11.9702 19.775 12.6102 20.68 12.6102C21.2 12.6102 21.63 13.0352 21.63 13.5602V14.4402C21.63 14.9602 21.205 15.3902 20.68 15.3902C19.775 15.3902 19.405 16.0302 19.86 16.8152C20.12 17.2702 19.965 17.8502 19.51 18.1102L18.645 18.6052C18.25 18.8402 17.74 18.7002 17.505 18.3052L17.45 18.2102C17 17.4252 16.26 17.4252 15.805 18.2102L15.75 18.3052C15.515 18.7002 15.005 18.8402 14.61 18.6052L13.745 18.1102C13.29 17.8502 13.135 17.2652 13.395 16.8152C13.85 16.0302 13.48 15.3902 12.575 15.3902C12.05 15.3902 11.625 14.9602 11.625 14.4402Z"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.3254 7.87659C12.2885 7.87659 14.3303 7.4456 15.5544 6.62496V8.12061H16.6899V4.84391C16.6899 2.87595 13.4102 1.81323 10.3254 1.81323C7.24056 1.81323 3.96094 2.87593 3.96094 4.84392V13.7815C3.96094 15.7505 7.24058 16.8132 10.3254 16.8132V15.6807C7.0861 15.6807 5.09647 14.5746 5.09647 13.7815V11.0933C6.32153 11.9139 8.36235 12.3449 10.3254 12.3449V11.2123C7.0861 11.2123 5.09647 10.1063 5.09647 9.31322V6.62496C6.32153 7.4456 8.36233 7.87659 10.3254 7.87659ZM10.3254 2.94579C13.5657 2.94579 15.5544 4.0518 15.5544 4.84491C15.5544 5.63702 13.5657 6.74401 10.3254 6.74401C7.08609 6.74401 5.09645 5.63702 5.09645 4.84491C5.09645 4.0518 7.08609 2.94579 10.3254 2.94579Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.3"
      />
    </svg>
  )
}

export const AddIcon = () => {
  return (
    <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.0982 9.70005H3.89824C3.51558 9.70005 3.19824 9.38272 3.19824 9.00005C3.19824 8.61738 3.51558 8.30005 3.89824 8.30005H15.0982C15.4809 8.30005 15.7982 8.61738 15.7982 9.00005C15.7982 9.38272 15.4809 9.70005 15.0982 9.70005Z"
        fill="white"
        stroke="white"
        strokeWidth="0.9"
      />
      <path
        d="M9.50127 15.3C9.1186 15.3 8.80127 14.9827 8.80127 14.6V3.40003C8.80127 3.01736 9.1186 2.70003 9.50127 2.70003C9.88394 2.70003 10.2013 3.01736 10.2013 3.40003V14.6C10.2013 14.9827 9.88394 15.3 9.50127 15.3Z"
        fill="white"
        stroke="white"
        strokeWidth="0.9"
      />
    </svg>
  )
}

export const CheckboxWallet = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_33509_490398)">
        <path
          d="M9.99837 18.3333C12.2995 18.3333 14.3829 17.4006 15.8909 15.8925C17.399 14.3845 18.3317 12.3011 18.3317 9.99997C18.3317 7.69881 17.399 5.61547 15.8909 4.10742C14.3829 2.59938 12.2995 1.66664 9.99837 1.66664C7.69721 1.66664 5.61387 2.59938 4.10581 4.10742C2.59778 5.61547 1.66504 7.69881 1.66504 9.99997C1.66504 12.3011 2.59778 14.3845 4.10581 15.8925C5.61387 17.4006 7.69721 18.3333 9.99837 18.3333Z"
          fill="#6A2AE0"
          stroke="#6A2AE0"
          strokeWidth="1.66667"
          strokeLinejoin="round"
        />
        <path
          d="M6.66504 10L9.16504 12.5L14.165 7.5"
          stroke="white"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export const NewCheckboxWallet = () => {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="25" height="25" rx="12.5" fill="#8159DE" />
      <path d="M7 13.5L11 17L18 8" stroke="white" stroke-width="2.5" stroke-linecap="round" />
    </svg>
  )
}

export const IconRadioChecked = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <circle cx="7.9998" cy="8.00005" r="6.6" stroke="#6A2AE0" strokeWidth="1.2" />
      <circle cx="7.9998" cy="8.00005" r="3.2" fill="#6A2AE0" />
    </svg>
  )
}

export const IconRadioUnchecked = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <circle cx="8.00005" cy="7.9998" r="6.6" stroke="#5F5F5F" strokeWidth="1.2" />
    </svg>
  )
}

export const IconWatch = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M13 7.99854C13 10.7585 10.76 12.9985 8 12.9985C5.24 12.9985 3 10.7585 3 7.99854C3 5.23854 5.24 2.99854 8 2.99854C10.76 2.99854 13 5.23854 13 7.99854Z"
        stroke="#B9B9B9"
        style={{ stroke: 'color(display-p3 0.7255 0.7255 0.7255)', strokeOpacity: 1 }}
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.85445 9.58744L8.30445 8.66244C8.03445 8.50244 7.81445 8.11744 7.81445 7.80244V5.75244"
        stroke="#B9B9B9"
        style={{ stroke: 'color(display-p3 0.7255 0.7255 0.7255)', strokeOpacity: 1 }}
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconVerifyKOL = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3 7.10048L0.100525 9.99996L3 12.8994V17H7.10053L10 19.8995L12.8995 17H17V12.8995L19.8995 9.99996L17 7.10044V2.99996H12.8995L10 0.100464L7.10053 2.99996H3V7.10048Z"
        fill="#5BACF8"
      ></path>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9.53924 14.5127L15.6281 8.4239L13.7722 6.56799L9.53867 10.8015L6.90101 8.16382L5.0451 10.0197L8.13829 13.1129L8.13886 13.1123L9.53924 14.5127Z"
        fill="white"
      ></path>
    </svg>
  )
}

export const IconTwitterX = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...rest}>
      <path d="M5.7333 5.13334H7.06664L14.4667 14.9334H13.1333L5.7333 5.13334Z"></path>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0ZM7.5333 4H3.53329L8.49778 10.5227L3.93331 16H5.73332L9.3685 11.6667L12.6667 16H16.6L11.4506 9.1847L15.8 4H13.9333L10.5767 8.028L7.5333 4Z"
      ></path>
      <svg width="14px" height="14px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M5.7333 5.13334H7.06664L14.4667 14.9334H13.1333L5.7333 5.13334Z"></path>
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0ZM7.5333 4H3.53329L8.49778 10.5227L3.93331 16H5.73332L9.3685 11.6667L12.6667 16H16.6L11.4506 9.1847L15.8 4H13.9333L10.5767 8.028L7.5333 4Z"
        ></path>
      </svg>
    </svg>
  )
}

export const Wallet = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M9.72913 8.38049H5.35413"
        stroke="#FCFCFC"
        strokeWidth="1.09375"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.70837 8.38011V5.01137C1.70837 3.52387 2.9115 2.32074 4.399 2.32074H8.49691C9.98441 2.32074 11.1875 3.24678 11.1875 4.73428"
        stroke="#FCFCFC"
        strokeWidth="1.09375"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.9959 9.14613C12.6313 9.49613 12.4563 10.0357 12.6021 10.5899C12.7844 11.268 13.4553 11.6982 14.1553 11.6982H14.8334V12.7555C14.8334 14.367 13.5282 15.6722 11.9167 15.6722H4.62504C3.01358 15.6722 1.70837 14.367 1.70837 12.7555V7.65135C1.70837 6.03989 3.01358 4.73468 4.62504 4.73468H11.9167C13.5209 4.73468 14.8334 6.04718 14.8334 7.65135V8.7086H14.0459C13.6375 8.7086 13.2657 8.86905 12.9959 9.14613Z"
        stroke="#FCFCFC"
        strokeWidth="1.09375"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.2919 9.45183V10.9539C16.2919 11.3622 15.9564 11.6977 15.5408 11.6977H14.1335C13.346 11.6977 12.6242 11.1216 12.5585 10.3341C12.5148 9.87477 12.6898 9.44455 12.996 9.1456C13.2658 8.86851 13.6377 8.70807 14.046 8.70807H15.5408C15.9564 8.70807 16.2919 9.0435 16.2919 9.45183Z"
        stroke="#FCFCFC"
        strokeWidth="1.09375"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconCloseCircle = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M6 11.375C3.035 11.375 0.625 8.965 0.625 6C0.625 3.035 3.035 0.625 6 0.625C8.965 0.625 11.375 3.035 11.375 6C11.375 8.965 8.965 11.375 6 11.375ZM6 1.375C3.45 1.375 1.375 3.45 1.375 6C1.375 8.55 3.45 10.625 6 10.625C8.55 10.625 10.625 8.55 10.625 6C10.625 3.45 8.55 1.375 6 1.375Z"
        fill="#9B9B9B"
      />
      <path
        d="M4.58469 7.78969C4.48969 7.78969 4.39469 7.75469 4.31969 7.67969C4.17469 7.53469 4.17469 7.29469 4.31969 7.14969L7.14969 4.31969C7.29469 4.17469 7.53469 4.17469 7.67969 4.31969C7.82469 4.46469 7.82469 4.70469 7.67969 4.84969L4.84969 7.67969C4.77969 7.75469 4.67969 7.78969 4.58469 7.78969Z"
        fill="#9B9B9B"
      />
      <path
        d="M7.41469 7.78969C7.31969 7.78969 7.22469 7.75469 7.14969 7.67969L4.31969 4.84969C4.17469 4.70469 4.17469 4.46469 4.31969 4.31969C4.46469 4.17469 4.70469 4.17469 4.84969 4.31969L7.67969 7.14969C7.82469 7.29469 7.82469 7.53469 7.67969 7.67969C7.60469 7.75469 7.50969 7.78969 7.41469 7.78969Z"
        fill="#9B9B9B"
      />
    </svg>
  )
}

export const IconRanking = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M7.225 11.6667H3.33333C2.41667 11.6667 1.66667 12.4167 1.66667 13.3334V18.3334H7.225V11.6667Z"
        stroke="#FCFCFC"
        strokeWidth="1.25"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.1085 8.33331H8.88346C7.9668 8.33331 7.2168 9.08331 7.2168 9.99998V18.3333H12.7751V9.99998C12.7751 9.08331 12.0335 8.33331 11.1085 8.33331Z"
        stroke="#FCFCFC"
        strokeWidth="1.25"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.6667 14.1667H12.7751V18.3334H18.3334V15.8334C18.3334 14.9167 17.5834 14.1667 16.6667 14.1667Z"
        stroke="#FCFCFC"
        strokeWidth="1.25"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.4335 1.72497L10.8752 2.60831C10.9335 2.73331 11.0919 2.84997 11.2252 2.86664L12.0252 2.99997C12.5335 3.08331 12.6585 3.45829 12.2919 3.81662L11.6669 4.44162C11.5585 4.54996 11.5002 4.74996 11.5335 4.89163L11.7085 5.65831C11.8502 6.26664 11.5252 6.49998 10.9919 6.18331L10.2419 5.74165C10.1085 5.65831 9.88353 5.65831 9.75019 5.74165L9.00019 6.18331C8.46686 6.49998 8.14186 6.26664 8.28352 5.65831L8.45853 4.89163C8.49186 4.74996 8.43353 4.54162 8.32519 4.44162L7.70852 3.82497C7.34186 3.4583 7.45852 3.09162 7.97519 3.00829L8.77519 2.87498C8.90852 2.84998 9.06686 2.73331 9.12519 2.61665L9.56686 1.73329C9.80852 1.24996 10.1919 1.24997 10.4335 1.72497Z"
        stroke="#FCFCFC"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconOrderConfirm = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.7789 7.21566C15.9495 7.21566 16.8984 6.26673 16.8984 5.09616C16.8984 3.92559 15.9495 2.97665 14.7789 2.97665C13.6084 2.97665 12.6594 3.92559 12.6594 5.09616C12.6594 6.26673 13.6084 7.21566 14.7789 7.21566Z" stroke="#FBFBFB" stroke-width="1.21115" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.30103 10.7482H9.83353" stroke="#FBFBFB" stroke-width="1.21115" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.30103 13.5742H12.6595" stroke="#FBFBFB" stroke-width="1.21115" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11.2463 2.97665H7.71382C4.18131 2.97665 2.76831 4.38966 2.76831 7.92216V12.1612C2.76831 15.6937 4.18131 17.1067 7.71382 17.1067H11.9528C15.4853 17.1067 16.8983 15.6937 16.8983 12.1612V8.62867" stroke="#FBFBFB" stroke-width="1.21115" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

  )
}

export const IconStar = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <g clip-path="url(#clip0_60076_185026)">
        <path
          d="M7.2719 2.29487C7.5792 1.7066 8.4211 1.7066 8.72839 2.29487L10.1207 4.96017C10.2397 5.18808 10.4586 5.34711 10.7122 5.38991L13.6773 5.89043C14.3317 6.0009 14.5919 6.80159 14.1273 7.27564L12.0227 9.4234C11.8428 9.60706 11.7592 9.86437 11.7968 10.1187L12.237 13.0934C12.3342 13.7499 11.6531 14.2448 11.0587 13.9495L8.36571 12.6116C8.13543 12.4972 7.86487 12.4972 7.63459 12.6116L4.94158 13.9495C4.34719 14.2448 3.66608 13.7499 3.76325 13.0934L4.20349 10.1187C4.24114 9.86437 4.15753 9.60706 3.97757 9.4234L1.87295 7.27564C1.40844 6.80159 1.6686 6.0009 2.32304 5.89043L5.28813 5.38991C5.54167 5.34711 5.76056 5.18808 5.87962 4.96017L7.2719 2.29487Z"
          stroke="currentColor"
          strokeWidth="1.25"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_60076_185026">
          <rect width="16" height="16" fill="white"></rect>
        </clipPath>
      </defs>
    </svg>
  )
}

export const IconStarActive = ({ ...rest }: HTMLAttributes<SVGElement> & { currentColor?: string }) => {
  const { currentColor = '#6A2AE0' } = rest
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M5.33131 4.84225L0.736584 5.51009L0.658498 5.52584C0.5416 5.55708 0.435065 5.61873 0.349731 5.70452C0.264397 5.79031 0.203311 5.89717 0.172689 6.01423C0.142066 6.13129 0.143 6.25438 0.175395 6.37096C0.20779 6.48754 0.27049 6.59347 0.357115 6.67795L3.68123 9.91919L2.89695 14.4961L2.88805 14.5714C2.88088 14.6926 2.90604 14.8135 2.96096 14.9218C3.01589 15.0301 3.09859 15.1218 3.20062 15.1876C3.30265 15.2534 3.42032 15.2909 3.5416 15.2962C3.66288 15.3016 3.78341 15.2746 3.89083 15.2181L8.0006 13.057L12.1104 15.2181L12.1796 15.2496C12.2925 15.2938 12.4153 15.3072 12.5351 15.2884C12.655 15.2696 12.7677 15.2193 12.8618 15.1427C12.9558 15.066 13.0279 14.9658 13.0705 14.8522C13.1131 14.7386 13.1247 14.6157 13.1043 14.4961L12.3193 9.91919L15.6448 6.67795L15.6982 6.61973C15.7745 6.52573 15.8246 6.41318 15.8432 6.29354C15.8619 6.17391 15.8485 6.05147 15.8044 5.93869C15.7604 5.82591 15.6872 5.72683 15.5924 5.65154C15.4975 5.57625 15.3844 5.52744 15.2646 5.51009L10.6692 4.84225L8.61433 0.678369C8.55773 0.563843 8.47023 0.467427 8.36172 0.400013C8.25321 0.3326 8.12801 0.296875 8.00026 0.296875C7.87251 0.296875 7.74731 0.3326 7.6388 0.400013C7.53029 0.467427 7.44279 0.563843 7.38619 0.678369L5.33131 4.84225Z"
        fill={currentColor}
      />
    </svg>
  )
}

export const IconSwap2 = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M0.900024 10.277L4.50002 13.477M4.50002 13.477L8.10003 10.277M4.50002 13.477L4.50002 3.87695"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8.89923 4.1L12.4992 0.9M12.4992 0.9L16.0992 4.1M12.4992 0.9L12.4992 10.5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}

export const IconInfo = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M6.99999 12.8334C10.2083 12.8334 12.8333 10.2084 12.8333 7.00008C12.8333 3.79175 10.2083 1.16675 6.99999 1.16675C3.79166 1.16675 1.16666 3.79175 1.16666 7.00008C1.16666 10.2084 3.79166 12.8334 6.99999 12.8334Z"
        stroke="currentColor"
        stroke-width="1.16667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M7 4.66675V7.58341"
        stroke="currentColor"
        stroke-width="1.16667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.99686 9.33325H7.0021"
        stroke="currentColor"
        stroke-width="1.16667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}

export const IconInfo2 = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <g clip-path="url(#clip0_6953_4301)">
    <path d="M8.00065 5.33203V7.9987M8.00065 10.6654H8.00732M14.6673 7.9987C14.6673 11.6806 11.6825 14.6654 8.00065 14.6654C4.31875 14.6654 1.33398 11.6806 1.33398 7.9987C1.33398 4.3168 4.31875 1.33203 8.00065 1.33203C11.6825 1.33203 14.6673 4.3168 14.6673 7.9987Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <defs>
    <clipPath id="clip0_6953_4301">
    <rect width="16" height="16" fill="white"/>
    </clipPath>
    </defs>
  </svg>
  )
}

export const LeftIcon = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path d="M10 2H14M14 2V6M14 2L6.66667 9.33333M12 8.66667V12.6667C12 13.0203 11.8595 13.3594 11.6095 13.6095C11.3594 13.8595 11.0203 14 10.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V5.33333C2 4.97971 2.14048 4.64057 2.39052 4.39052C2.64057 4.14048 2.97971 4 3.33333 4H7.33333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}

export const IconCheckCircle2 = ({ 
  fill = "#8159DE", 
  stroke = "white", 
  ...props 
}: HTMLAttributes<SVGElement> & { fill?: string; stroke?: string }) => {
  return (
    <svg 
      width="25" 
      height="25" 
      viewBox="0 0 25 25" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      {...props}
    >
      <rect width="25" height="25" rx="12.5" fill={fill} />
      <path 
        d="M7 13.5L11 17L18 8" 
        stroke={stroke} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

export const IconHelp = ({ ...rest }: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M6.05957 5.99875C6.21631 5.5532 6.52567 5.17749 6.93287 4.93817C7.34007 4.69886 7.81883 4.61138 8.28435 4.69123C8.74987 4.77108 9.17211 5.0131 9.47629 5.37444C9.78046 5.73577 9.94694 6.1931 9.94624 6.66542C9.94624 7.99875 7.94624 8.66542 7.94624 8.66542M7.99967 11.332H8.00634M14.6663 7.9987C14.6663 11.6806 11.6816 14.6654 7.99967 14.6654C4.31778 14.6654 1.33301 11.6806 1.33301 7.9987C1.33301 4.3168 4.31778 1.33203 7.99967 1.33203C11.6816 1.33203 14.6663 4.3168 14.6663 7.9987Z"
        stroke="currentColor"
        stroke-width="0.666667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
export const NewEmailIcon = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M11.0001 3.5L6.50458 6.3635C6.35202 6.45211 6.17874 6.49878 6.00233 6.49878C5.82591 6.49878 5.65263 6.45211 5.50008 6.3635L1.00008 3.5"
        stroke="#908E98"
        strokeWidth="0.72"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0001 2H2.00008C1.44779 2 1.00008 2.44772 1.00008 3V9C1.00008 9.55228 1.44779 10 2.00008 10H10.0001C10.5524 10 11.0001 9.55228 11.0001 9V3C11.0001 2.44772 10.5524 2 10.0001 2Z"
        stroke="#908E98"
        strokeWidth="0.72"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
export const NewCopyIcon = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7.44584 5C7.8581 5 8.25348 5.16377 8.54499 5.45528C8.8365 5.74679 9.00027 6.14217 9.00027 6.55443V9.9459C9.00027 10.15 8.96006 10.3522 8.88195 10.5408C8.80383 10.7293 8.68933 10.9007 8.54499 11.045C8.40065 11.1894 8.22929 11.3039 8.0407 11.382C7.8521 11.4601 7.64997 11.5003 7.44584 11.5003H4.05437C3.85024 11.5003 3.6481 11.4601 3.45951 11.382C3.27092 11.3039 3.09956 11.1894 2.95522 11.045C2.81088 10.9007 2.69638 10.7293 2.61826 10.5408C2.54015 10.3522 2.49994 10.15 2.49994 9.9459V6.55443C2.49994 6.3503 2.54015 6.14817 2.61826 5.95957C2.69638 5.77098 2.81088 5.59962 2.95522 5.45528C3.09956 5.31094 3.27092 5.19644 3.45951 5.11832C3.6481 5.04021 3.85024 5 4.05437 5H7.44584ZM4.05437 5.84787C3.66435 5.84787 3.34781 6.16441 3.34781 6.55443V9.9459C3.34781 10.3359 3.66435 10.6525 4.05437 10.6525H7.44584C7.83586 10.6525 8.1524 10.3359 8.1524 9.9459V6.55443C8.1524 6.16441 7.83586 5.84787 7.44584 5.84787H4.05437Z"
        fill="#908E98"
      />
      <path
        d="M9.94584 2.5C10.15 2.5 10.3521 2.54021 10.5407 2.61832C10.7293 2.69644 10.9006 2.81094 11.045 2.95528C11.1893 3.09962 11.3038 3.27098 11.3819 3.45957C11.4601 3.64817 11.5003 3.8503 11.5003 4.05443V7.4459C11.5003 7.65003 11.4601 7.85217 11.3819 8.04076C11.3038 8.22935 11.1893 8.40071 11.045 8.54505C10.9006 8.68939 10.7293 8.80389 10.5407 8.88201C10.3521 8.96012 10.15 9.00033 9.94584 9.00033C9.83341 9.00033 9.72558 8.95567 9.64608 8.87616C9.56657 8.79666 9.52191 8.68883 9.52191 8.5764C9.52191 8.46396 9.56657 8.35613 9.64608 8.27663C9.72558 8.19713 9.83341 8.15246 9.94584 8.15246C10.3359 8.15246 10.6524 7.83592 10.6524 7.4459V4.05443C10.6524 3.66441 10.3359 3.34787 9.94584 3.34787H6.55437C6.16435 3.34787 5.84781 3.66441 5.84781 4.05443C5.84781 4.16686 5.80314 4.27469 5.72364 4.35419C5.64414 4.4337 5.53631 4.47836 5.42387 4.47836C5.31144 4.47836 5.20361 4.4337 5.12411 4.35419C5.0446 4.27469 4.99994 4.16686 4.99994 4.05443C4.99994 3.8503 5.04015 3.64817 5.11826 3.45957C5.19638 3.27098 5.31088 3.09962 5.45522 2.95528C5.59956 2.81094 5.77092 2.69644 5.95951 2.61832C6.1481 2.54021 6.35024 2.5 6.55437 2.5H9.94584Z"
        fill="#908E98"
      />
    </svg>
  )
}

export const PointsIcon = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8.70113 7.87585C10.6642 7.87585 12.706 7.44487 13.9301 6.62422V8.11988H15.0656V4.84317C15.0656 2.87521 11.786 1.8125 8.70113 1.8125C5.6163 1.8125 2.33667 2.8752 2.33667 4.84319V13.7808C2.33667 15.7498 5.61631 16.8125 8.70114 16.8125V15.6799C5.46184 15.6799 3.4722 14.5739 3.4722 13.7808V11.0925C4.69727 11.9132 6.73808 12.3442 8.70114 12.3442V11.2116C5.46184 11.2116 3.4722 10.1056 3.4722 9.31249V6.62422C4.69727 7.44487 6.73806 7.87585 8.70113 7.87585ZM8.70113 2.94506C11.9414 2.94506 13.9301 4.05107 13.9301 4.84418C13.9301 5.63628 11.9414 6.74328 8.70113 6.74328C5.46182 6.74328 3.47219 5.63628 3.47219 4.84418C3.47219 4.05107 5.46182 2.94506 8.70113 2.94506Z"
        fill="white"
        stroke="white"
        strokeWidth="0.3"
      />
      <circle cx="14.5" cy="13.5" r={5} fill="white" />
      <path
        d="M16.8665 14.4077C16.8665 13.9343 16.7219 13.7143 16.4839 13.5427C16.3705 13.4603 16.2255 13.378 15.9362 13.2407C15.6155 13.0897 15.2952 12.9523 14.9642 12.808C14.5199 12.6227 14.1682 12.4787 14.0752 12.348C14.0442 12.3 14.0235 12.2247 14.0235 12.101C14.0235 11.8743 14.0135 11.6203 14.4785 11.6203C14.6955 11.6203 14.9435 11.641 14.9952 11.8127C15.0162 11.8813 15.0162 11.9017 15.0162 12.0117V12.3687H16.6909C16.7009 11.998 16.7425 11.4693 16.3702 11.1603C16.0292 10.865 15.4605 10.8307 14.9539 10.8033V10H14.0959V10.8033C13.5892 10.8307 13.0415 10.8857 12.6899 11.1673C12.3385 11.4417 12.2972 11.8127 12.2972 12.156C12.2972 12.6503 12.4419 12.863 12.6899 13.0417C12.9072 13.1993 13.2585 13.3573 13.3205 13.385C13.6205 13.5223 13.9202 13.6663 14.2305 13.8037C14.6645 14.0027 14.9539 14.1193 15.0472 14.2773C15.0989 14.3667 15.0989 14.504 15.0989 14.5247C15.0989 14.6963 15.1299 14.9503 14.5095 14.9503C14.1475 14.9503 14.0235 14.8403 13.9822 14.7303C13.9409 14.6413 13.9512 14.5383 13.9512 14.5107V14.1673H12.2042C12.1835 14.8677 12.2249 15.1837 12.6382 15.4513C13.0312 15.6987 13.5275 15.7397 13.7032 15.7537C13.8272 15.767 13.9615 15.781 14.0959 15.7877V16.6667H14.9539V15.788C15.4812 15.7467 15.9569 15.6987 16.3599 15.4513C16.8149 15.1767 16.8665 14.7923 16.8665 14.408V14.4077Z"
        fill="#0A0A0A"
      />
    </svg>
  )
}

export const FundingRateIcon = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10 18.3327C14.6024 18.3327 18.3333 14.6017 18.3333 9.99935C18.3333 5.39698 14.6024 1.66602 10 1.66602C5.39763 1.66602 1.66667 5.39698 1.66667 9.99935C1.66667 14.6017 5.39763 18.3327 10 18.3327Z"
        stroke="white"
        strokeWidth="1.04167"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.87316 13.9306C12.5461 14.4018 13.2061 10.6601 10.5332 10.1884M9.87316 13.9306L6.66667 13.365M9.87316 13.9306L9.68534 15M8.39504 9.81164L10.5338 10.1884C13.2067 10.6601 13.8668 6.91782 11.1933 6.44664L7.98575 5.88101M11.1928 6.44664L11.3817 5.37727M7.54606 14.6227L9.24294 5"
        stroke="white"
        strokeWidth="1.08566"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const DocumentIcon = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10.0001 1.33398H4.00013C3.64651 1.33398 3.30737 1.47446 3.05732 1.72451C2.80727 1.97456 2.66679 2.3137 2.66679 2.66732V13.334C2.66679 13.6876 2.80727 14.0267 3.05732 14.2768C3.30737 14.5268 3.64651 14.6673 4.00013 14.6673H12.0001C12.3537 14.6673 12.6929 14.5268 12.9429 14.2768C13.193 14.0267 13.3335 13.6876 13.3335 13.334V4.66732L10.0001 1.33398Z"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33321 1.33398V4.00065C9.33321 4.35427 9.47368 4.69341 9.72373 4.94346C9.97378 5.19351 10.3129 5.33398 10.6665 5.33398H13.3332"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 10H10" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const CommunityIcon = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10.6667 14V12.6667C10.6667 11.9594 10.3857 11.2811 9.88561 10.781C9.38552 10.281 8.70724 10 7.99999 10H3.99999C3.29275 10 2.61447 10.281 2.11438 10.781C1.61428 11.2811 1.33333 11.9594 1.33333 12.6667V14"
        stroke="white"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6667 2.08594C11.2385 2.23418 11.7449 2.56811 12.1065 3.03531C12.468 3.50251 12.6641 4.07653 12.6641 4.66727C12.6641 5.25801 12.468 5.83203 12.1065 6.29923C11.7449 6.76643 11.2385 7.10036 10.6667 7.2486"
        stroke="white"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6667 13.9993V12.6659C14.6662 12.0751 14.4696 11.5011 14.1076 11.0341C13.7456 10.5672 13.2388 10.2336 12.6667 10.0859"
        stroke="white"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.99999 7.33333C7.47275 7.33333 8.66666 6.13943 8.66666 4.66667C8.66666 3.19391 7.47275 2 5.99999 2C4.52724 2 3.33333 3.19391 3.33333 4.66667C3.33333 6.13943 4.52724 7.33333 5.99999 7.33333Z"
        stroke="white"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const DisconnectIcon = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width={16} height={20} viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5.99999 14.1673H4.66666C3.78261 14.1673 2.93476 13.7283 2.30964 12.9469C1.68452 12.1655 1.33333 11.1057 1.33333 10.0007C1.33333 8.89558 1.68452 7.83577 2.30964 7.05437C2.93476 6.27297 3.78261 5.83398 4.66666 5.83398"
        stroke="#FF1568"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 5.83398H11.3333C11.9524 5.83398 12.5592 6.04946 13.0858 6.45627C13.6124 6.86308 14.0379 7.44515 14.3148 8.13726C14.5916 8.82937 14.7088 9.60417 14.6532 10.3748C14.5976 11.1455 14.3714 11.8816 14 12.5007"
        stroke="#FF1568"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.33333 10H7.99999"
        stroke="#FF1568"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.33333 1.66602L14.6667 18.3327"
        stroke="#FF1568"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconWalletManagement = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M15.25 6.25V4C15.25 3.80109 15.171 3.61032 15.0303 3.46967C14.8897 3.32902 14.6989 3.25 14.5 3.25H4.75C4.35218 3.25 3.97064 3.40804 3.68934 3.68934C3.40804 3.97064 3.25 4.35218 3.25 4.75C3.25 5.14782 3.40804 5.52936 3.68934 5.81066C3.97064 6.09196 4.35218 6.25 4.75 6.25H16C16.1989 6.25 16.3897 6.32902 16.5303 6.46967C16.671 6.61032 16.75 6.80109 16.75 7V10M16.75 10H14.5C14.1022 10 13.7206 10.158 13.4393 10.4393C13.158 10.7206 13 11.1022 13 11.5C13 11.8978 13.158 12.2794 13.4393 12.5607C13.7206 12.842 14.1022 13 14.5 13H16.75C16.9489 13 17.1397 12.921 17.2803 12.7803C17.421 12.6397 17.5 12.4489 17.5 12.25V10.75C17.5 10.5511 17.421 10.3603 17.2803 10.2197C17.1397 10.079 16.9489 10 16.75 10Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.25 4.75V15.25C3.25 15.6478 3.40804 16.0294 3.68934 16.3107C3.97064 16.592 4.35218 16.75 4.75 16.75H16C16.1989 16.75 16.3897 16.671 16.5303 16.5303C16.671 16.3897 16.75 16.1989 16.75 16V13"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const IconRise = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5.55557 12.2223L8.14892 9.50848C8.28163 9.36961 8.50441 9.37292 8.63293 9.51568L10.8373 11.9642C10.9637 12.1046 11.1819 12.1105 11.3157 11.9772L15.4085 7.89923M12.413 7.77783H15.5301V10.6784" stroke="currentColor" stroke-width="1.05639" stroke-linecap="round"/>
    </svg>
  )
}

export const IconFall = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5.55557 7.77772L8.14892 10.4915C8.28163 10.6304 8.50441 10.6271 8.63293 10.4843L10.8373 8.03581C10.9637 7.89543 11.1819 7.88951 11.3157 8.02283L15.4085 12.1008M12.413 12.2222H15.5301V9.32162" stroke="currentColor" stroke-width="1.05639" stroke-linecap="round"/>
    </svg>
  )
}

export const XIcons = {
  IconVerifyKOL,
  IconWatch,
  IconRadioChecked,
  IconRadioUnchecked,
  IconCustomerSupport,
  IconPreferences,
  IconTwitterX,
  IconStar,
  IconStarActive,
  IconOrderConfirm,
}
