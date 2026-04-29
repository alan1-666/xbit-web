import { TokenAvatar, TokenAvatarProps } from '@components/discover/cards/TokenAvatar.tsx'

export interface TokenAvatarWithProgressProps extends TokenAvatarProps {
  progress: number
  showProgress?: boolean
}

export const TokenAvatarWithProgress = (props: TokenAvatarWithProgressProps) => {
  const { progress, showProgress = true, ...rest } = props
  return (
    <TokenAvatar {...rest} className="size-[46px]">
      {showProgress && (
        <>
          <div className="z-[5] absolute -inset-[2px]">
            <svg
              width="50"
              height="50"
              viewBox="0 0 62 62"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-[48px]"
            >
              <path
                d="M59 52.5V52.5C59 56.0899 56.0899 59 52.5 59H13.6667C7.77563 59 3 54.2244 3 48.3333V13.6667C3 7.77563 7.77563 3 13.6667 3H48.3333C54.2244 3 59 7.77563 59 13.6667V51"
                stroke="black"
                strokeWidth="5"
                strokeLinecap="round"
                pathLength="100"
              />
            </svg>
          </div>
          <div className="z-[6] absolute -inset-[0px]">
            <svg
              width="46"
              height="46"
              viewBox="0 0 58 58"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-[44px]"
            >
              <path
                d="M50 57H11.6667C5.77563 57 1 52.2244 1 46.3333V11.6667C1 5.77563 5.77563 1 11.6667 1H46.3333C52.2244 1 57 5.77563 57 11.6667V50C57 53.866 53.866 57 50 57Z"
                stroke="#333"
                strokeWidth="1.6"
                strokeLinecap="round"
                pathLength="100"
              />
              <path
                d="M50 57H11.6667C5.77563 57 1 52.2244 1 46.3333V11.6667C1 5.77563 5.77563 1 11.6667 1H46.3333C52.2244 1 57 5.77563 57 11.6667V50C57 53.866 53.866 57 50 57Z"
                stroke="url(#paint0_linear_29495_650571)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeDasharray={`${progress} ${100 - progress}`}
                strokeDashoffset="0"
                pathLength="100"
                className="transition-all"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_29495_650571"
                  x1="49.5"
                  y1="57"
                  x2="57"
                  y2="42"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.2" stopColor="#9945FF" />
                  <stop offset="1" stopColor="#00F3AB" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </>
      )}
    </TokenAvatar>
  )
}