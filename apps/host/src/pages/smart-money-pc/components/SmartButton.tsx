import React from 'react'
import clsx from 'clsx'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

export const SmartButton = ({ leftIcon, rightIcon, children, className, ...btnProps }: Props) => {
  return (
    <button
      {...btnProps}
      className={clsx(
        'relative overflow-hidden transition-all duration-300',
        'inline-flex items-center justify-center h-9 px-3 gap-3',
        'rounded-4xl border border-[#C3C8FF]',
        'text-[14px] leading-[1.3] text-[#FBFBFB] select-none',
        'hover:shadow-[0_0_16px_rgba(152,88,236,0.5)]',
        className,
      )}
      style={{
        background: 'linear-gradient(180deg, rgba(219,222,255,0.2), rgba(152,88,236,0.2))',
        boxShadow: '0 11.392px 22.336px rgba(51,62,192,0.09), 0 -2px 1px rgba(152,88,236,0.4) inset',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    >

      {/* <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_60%)] opacity-0 group-hover:opacity-100 transition duration-500" /> */}
      <span className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(white_10%,transparent_70%)] bg-no-repeat bg-[length:200%_200%] opacity-0 group-hover:opacity-20 transition" />
      {leftIcon && <span className="shrink-0 group-hover:scale-110 transition-transform duration-200">{leftIcon}</span>}
      <span className="font-normal"> {children} </span>
      {rightIcon && <span className="shrink-0 group-hover:translate-x-1 transition-transform duration-200">{rightIcon}</span>}
    </button>
  )
}
