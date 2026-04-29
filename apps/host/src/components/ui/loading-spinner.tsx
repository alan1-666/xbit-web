import { HTMLAttributes } from 'react'
import {Loading} from "@components/common/Loading.tsx"

const LoadingSpinner = ({ size = 40 }) => {
  return (
    <div className="inline-block">
      <svg
        width={size}
        height={size * (16 / 15)}
        viewBox="0 0 15 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
      >
        <circle cx="7.5" cy="8" r="5.75" stroke="#141414" strokeOpacity="0.5" strokeWidth="2.5" />
        <path d="M7.5 14C4.18629 14 1.5 11.3137 1.5 8C1.5 4.68629 4.18629 2 7.5 2" stroke="#00FFB4" strokeWidth="3" />
      </svg>
    </div>
  )
}

export const LoadingSpinnerGradient = ({ size = 20 }) => {
  return (
    <div className="inline-block animate-spin">
        <svg width={size} height={size} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="10.5"
            cy="10"
            r="7.1875"
            stroke="#ECECED"
            strokeOpacity="0.18"
            style={{ stroke: "#ECECED", strokeOpacity: 0.18 }}
            strokeWidth="3.125"
          />
          <path
            d="M10.5 17.5C6.35786 17.5 3 14.1421 3 10C3 5.85786 6.35786 2.5 10.5 2.5"
            stroke="#6A2AE0"
            strokeWidth="3.75"
          />
          <defs>
            <linearGradient
              id="paint0_linear_37574_401289"
              x1="3"
              y1="17.5"
              x2="15.4752"
              y2="11.0025"
              gradientUnits="userSpaceOnUse"
            >
              <stop
                stop-color="#9035FF"
                style={{ stopColor: "#9035FF", stopOpacity: 1 }}
              />
              <stop
                offset="1"
                stop-color="#EE69FF"
                style={{ stopColor: "#EE69FF", stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>
        </svg>
    </div>
  )
}

export const LoadMore = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="h-[80px] w-full flex justify-center items-center pt-[0px]" {...props}>
      {/*<img src="/images/loading-sprite.png" className="w-[25px] h-[25px] block mt-[-20px]" alt="" />*/}
      <Loading/>
    </div>
  )
}

export default LoadingSpinner
