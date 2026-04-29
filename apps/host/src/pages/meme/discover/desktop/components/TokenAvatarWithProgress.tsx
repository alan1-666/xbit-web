import { TokenAvatar, TokenAvatarProps } from '@components/discover/cards/TokenAvatar.tsx'
import { cn } from '@/lib/utils.ts'

export interface TokenAvatarWithProgressProps extends TokenAvatarProps {
  progress: number
  showProgress?: boolean
  className?: string
}

export const TokenAvatarWithProgress = (props: TokenAvatarWithProgressProps) => {
  const { progress, showProgress = true, className, ...rest } = props
  const highProgress = +progress >= 90
  return (
    <TokenAvatar
      {...rest}
      className={cn('size-16', className)}
      chainLogoContainerClassName={cn(
        'size-4 -bottom-1 -right-1 flex justify-center items-center',
        highProgress
          ? 'bg-[linear-gradient(37.15deg,#FF8700_13.23%,#FFCA00_93.06%)]'
          : 'bg-[linear-gradient(37.15deg,#F437FF_13.23%,#A53EFF_37.52%,#00F7A5_93.06%)]',
      )}
      chainLogoClassName="size-3.5 p-[1.5px]"
    >
      {showProgress && (
        <>
          <div className="z-[5] absolute -inset-[2px]">
            <svg
              width="72"
              height="73"
              viewBox="0 0 72 73"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-[70px]"
            >
              <path
                d="M69 61.5117V61.5117C69 65.7426 65.5702 69.1724 61.3393 69.1724H15.063C8.4008 69.1724 3 63.7716 3 57.1094V15.2355C3 8.57323 8.4008 3.17242 15.063 3.17242H56.937C63.5992 3.17242 69 8.57322 69 15.2354V59.7439"
                stroke="black"
                stroke-width="6"
                stroke-linecap="round"  
              />
            </svg>
          </div>
          <div className="z-[6] absolute -inset-[0px]">
            <svg width="66" height="66" viewBox="0 0 66 66" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g filter={`url(#filter-${highProgress})`}>
                <path
                  d="M12.5059 1H53.1494C59.5039 1 64.6553 6.15141 64.6553 12.5059V53.1494C64.6553 59.5039 59.5039 64.6553 53.1494 64.6553H12.5059C6.15141 64.6553 1 59.5039 1 53.1494V12.5059C1 6.15141 6.15141 1 12.5059 1Z"
                  stroke={`url(#paint-${highProgress})`}
                  stroke-width="2"
                  stroke-linecap="round"
                  strokeDasharray={`${progress} ${100 - progress}`}
                  strokeDashoffset="50"
                  pathLength="100"
                  className="transition-all"
                />
              </g>
              <defs>
                <filter
                  id={`filter-${highProgress}`}
                  x="0"
                  y="0"
                  width="65.6553"
                  height="69.6552"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="4" />
                  <feGaussianBlur stdDeviation="2" />
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.764706 0 0 0 0 0 0 0 0 0.25 0" />
                  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_60076_88215" />
                </filter>
                <linearGradient
                  id={`paint-${highProgress}`}
                  x1="65.6552"
                  y1="50.4138"
                  x2="65.6552"
                  y2="14.069"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.2" stopColor={highProgress ? '#F38E00' : '#E149F8'} />
                  <stop offset="1" stopColor={highProgress ? '#FACC14' : '#9945FF'} />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </>
      )}
    </TokenAvatar>
  )
}
